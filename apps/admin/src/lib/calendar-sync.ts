import { google } from 'googleapis';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Google Calendar Setup
const getCalendarClient = () => {
  if (!process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
    throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON environment variable is not set');
  }

  const credentials = JSON.parse(
    Buffer.from(process.env.GOOGLE_SERVICE_ACCOUNT_JSON, 'base64').toString('utf-8')
  );

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/calendar'],
  });

  return google.calendar({ version: 'v3', auth });
};

// Schulung zu Google Calendar Event konvertieren
export const schulungToCalendarEvent = (schulung: any) => {
  const event = {
    summary: schulung.titel,
    description: `${schulung.beschreibung || ''}\n\nTyp: ${schulung.typ}\nHersteller: ${schulung.hersteller}\nMax. Teilnehmer: ${schulung.maxTeilnehmer}\nPreis: ${schulung.preis}€`,
    location: schulung.ort || '',
    start: {
      dateTime: new Date(schulung.startDatum).toISOString(),
      timeZone: 'Europe/Berlin',
    },
    end: {
      dateTime: new Date(schulung.endDatum).toISOString(),
      timeZone: 'Europe/Berlin',
    },
    colorId: getColorForType(schulung.typ),
    extendedProperties: {
      private: {
        schulungId: schulung.id,
        typ: schulung.typ,
        hersteller: schulung.hersteller,
        status: schulung.status,
      },
    },
  };

  return event;
};

// Farbe basierend auf Schulungstyp
const getColorForType = (typ: string): string => {
  const colors: Record<string, string> = {
    'Grundlagen': '1', // Blau
    'Fortgeschritten': '5', // Gelb
    'Wartung': '10', // Grün
    'Individualschulung': '11', // Rot
  };
  return colors[typ] || '1';
};

// Schulung zu Google Calendar hinzufügen
export const addToCalendar = async (schulung: any) => {
  try {
    if (!process.env.GOOGLE_CALENDAR_ID) {
      throw new Error('GOOGLE_CALENDAR_ID environment variable is not set');
    }

    const calendar = getCalendarClient();
    const event = schulungToCalendarEvent(schulung);

    const response = await calendar.events.insert({
      calendarId: process.env.GOOGLE_CALENDAR_ID,
      requestBody: event,
    });

    // Update Schulung mit Calendar Event ID
    await prisma.schulung.update({
      where: { id: schulung.id },
      data: {
        calendarEventId: response.data.id,
        lastSyncedAt: new Date(),
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error adding to calendar:', error);
    throw error;
  }
};

// Schulung in Google Calendar aktualisieren
export const updateInCalendar = async (schulung: any) => {
  try {
    if (!schulung.calendarEventId) {
      return addToCalendar(schulung);
    }

    if (!process.env.GOOGLE_CALENDAR_ID) {
      throw new Error('GOOGLE_CALENDAR_ID environment variable is not set');
    }

    const calendar = getCalendarClient();
    const event = schulungToCalendarEvent(schulung);

    const response = await calendar.events.update({
      calendarId: process.env.GOOGLE_CALENDAR_ID,
      eventId: schulung.calendarEventId,
      requestBody: event,
    });

    // Update lastSyncedAt
    await prisma.schulung.update({
      where: { id: schulung.id },
      data: {
        lastSyncedAt: new Date(),
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error updating calendar:', error);
    throw error;
  }
};

// Schulung aus Google Calendar löschen
export const deleteFromCalendar = async (schulung: any) => {
  try {
    if (!schulung.calendarEventId) {
      return;
    }

    if (!process.env.GOOGLE_CALENDAR_ID) {
      throw new Error('GOOGLE_CALENDAR_ID environment variable is not set');
    }

    const calendar = getCalendarClient();

    await calendar.events.delete({
      calendarId: process.env.GOOGLE_CALENDAR_ID,
      eventId: schulung.calendarEventId,
    });

    // Entferne Calendar Event ID
    await prisma.schulung.update({
      where: { id: schulung.id },
      data: {
        calendarEventId: null,
        lastSyncedAt: new Date(),
      },
    });
  } catch (error) {
    console.error('Error deleting from calendar:', error);
    throw error;
  }
};

// Sync von Google Calendar zu Datenbank
export const syncFromCalendar = async () => {
  try {
    if (!process.env.GOOGLE_CALENDAR_ID) {
      throw new Error('GOOGLE_CALENDAR_ID environment variable is not set');
    }

    const calendar = getCalendarClient();
    
    // Hole Events der nächsten 6 Monate
    const now = new Date();
    const sixMonthsLater = new Date();
    sixMonthsLater.setMonth(sixMonthsLater.getMonth() + 6);

    const response = await calendar.events.list({
      calendarId: process.env.GOOGLE_CALENDAR_ID,
      timeMin: now.toISOString(),
      timeMax: sixMonthsLater.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
    });

    const events = response.data.items || [];

    for (const event of events) {
      if (!event.id || !event.start?.dateTime || !event.end?.dateTime) {
        continue;
      }

      // Prüfe ob Schulung bereits existiert
      const existingSchulung = await prisma.schulung.findFirst({
        where: { calendarEventId: event.id },
      });

      if (existingSchulung) {
        // Update existierende Schulung
        await prisma.schulung.update({
          where: { id: existingSchulung.id },
          data: {
            titel: event.summary || existingSchulung.titel,
            beschreibung: event.description,
            startDatum: new Date(event.start.dateTime),
            endDatum: new Date(event.end.dateTime),
            ort: event.location,
            lastSyncedAt: new Date(),
          },
        });
      } else {
        // Erstelle neue Schulung nur wenn extendedProperties vorhanden sind
        if (event.extendedProperties?.private?.schulungId) {
          continue; // Skip, da dies von uns erstellt wurde
        }

        // Berechne Dauer in Tagen
        const start = new Date(event.start.dateTime);
        const end = new Date(event.end.dateTime);
        const dauer = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

        // Erstelle neue Schulung mit korrektem Status-Enum
        await prisma.schulung.create({
          data: {
            titel: event.summary || 'Unbekannte Schulung',
            beschreibung: event.description,
            typ: 'Grundlagen', // Standard
            hersteller: 'Diverse', // Standard
            startDatum: new Date(event.start.dateTime),
            endDatum: new Date(event.end.dateTime),
            dauer: dauer,
            maxTeilnehmer: 12, // Standard
            preis: 0, // Wird später gesetzt
            status: 'bestaetigt', // Verwendet korrekten Enum-Wert
            ort: event.location,
            calendarEventId: event.id,
            lastSyncedAt: new Date(),
          },
        });
      }
    }

    return { 
      success: true,
      synced: events.length,
      message: `${events.length} Events erfolgreich synchronisiert`
    };
  } catch (error) {
    console.error('Error syncing from calendar:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unbekannter Fehler beim Importieren',
      synced: 0
    };
  }
};

// Export zu Google Calendar (alle Schulungen ohne Event ID)
export const syncToCalendar = async () => {
  try {
    const schulungenOhneEvent = await prisma.schulung.findMany({
      where: {
        calendarEventId: null,
        status: {
          not: 'abgesagt',
        },
      },
    });

    let exported = 0;
    const errors: string[] = [];

    for (const schulung of schulungenOhneEvent) {
      try {
        await addToCalendar(schulung);
        exported++;
      } catch (error) {
        console.error(`Fehler beim Exportieren von Schulung ${schulung.id}:`, error);
        errors.push(`${schulung.titel}: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`);
      }
    }

    return {
      success: true,
      exported,
      total: schulungenOhneEvent.length,
      errors: errors.length > 0 ? errors : undefined,
      message: `${exported} von ${schulungenOhneEvent.length} Schulungen exportiert`
    };
  } catch (error) {
    console.error('Error syncing to calendar:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unbekannter Fehler beim Exportieren',
      exported: 0,
      total: 0
    };
  }
};

// Vollständiger Sync (bidirektional)
export const fullSync = async () => {
  try {
    // 1. Sync von Calendar zu DB
    const importResult = await syncFromCalendar();

    // 2. Sync von DB zu Calendar (für Schulungen ohne calendarEventId)
    const exportResult = await syncToCalendar();

    // 3. Update bestehende Events
    const schulungenMitEvent = await prisma.schulung.findMany({
      where: {
        calendarEventId: {
          not: null,
        },
        OR: [
          {
            lastSyncedAt: null,
          },
          {
            lastSyncedAt: {
              lt: new Date(Date.now() - 24 * 60 * 60 * 1000), // Älter als 24h
            },
          },
        ],
      },
    });

    let updated = 0;
    for (const schulung of schulungenMitEvent) {
      try {
        await updateInCalendar(schulung);
        updated++;
      } catch (error) {
        console.error(`Fehler beim Update von Schulung ${schulung.id}:`, error);
      }
    }

    return {
      success: importResult.success && exportResult.success,
      import: importResult,
      export: exportResult,
      updated,
      message: `Sync abgeschlossen: ${importResult.synced} importiert, ${exportResult.exported} exportiert, ${updated} aktualisiert`
    };
  } catch (error) {
    console.error('Error in full sync:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unbekannter Fehler beim vollständigen Sync'
    };
  }
};

// ✅ NEUE EXPORTS für API-Kompatibilität
export const importFromGoogleCalendar = syncFromCalendar;
export const exportToGoogleCalendar = syncToCalendar;

// Export für API Routes
export default {
  addToCalendar,
  updateInCalendar,
  deleteFromCalendar,
  syncFromCalendar,
  syncToCalendar,
  fullSync,
  importFromGoogleCalendar,
  exportToGoogleCalendar,
};
