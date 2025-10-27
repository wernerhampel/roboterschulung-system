import { google } from 'googleapis';
import { prisma } from './prisma';

interface CalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: {
    dateTime?: string;
    date?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
  };
  location?: string;
}

interface SyncResult {
  success: boolean;
  imported: number;
  updated: number;
  checked: number;
  errors: string[];
}

// Hilfsfunktion: Parse Schulungsinfo aus Event-Titel
function parseSchulungFromTitle(title: string): {
  hersteller: string;
  typ: string;
} {
  const titleLower = title.toLowerCase();
  
  // Hersteller erkennen
  let hersteller = 'sonstige';
  if (titleLower.includes('kuka')) hersteller = 'kuka';
  else if (titleLower.includes('abb')) hersteller = 'abb';
  else if (titleLower.includes('mitsubishi')) hersteller = 'mitsubishi';
  else if (titleLower.includes('universal robot') || titleLower.includes('ur')) hersteller = 'universal_robots';
  
  // Typ erkennen
  let typ = 'sonstige';
  if (titleLower.includes('grundlagen') || titleLower.includes('basic')) typ = 'grundlagen';
  else if (titleLower.includes('praxis') || titleLower.includes('advanced')) typ = 'praxis';
  else if (titleLower.includes('online') || titleLower.includes('webinar')) typ = 'online';
  
  return { hersteller, typ };
}

// Hilfsfunktion: Berechne Dauer in Tagen
function calculateDurationDays(start: Date, end: Date): number {
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays || 1; // Mindestens 1 Tag
}

export async function importFromGoogleCalendar(): Promise<SyncResult> {
  const result: SyncResult = {
    success: false,
    imported: 0,
    updated: 0,
    checked: 0,
    errors: []
  };

  try {
    console.log('[Calendar Sync] Starte Import...');

    // Service Account Auth
    const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
    const calendarId = process.env.GOOGLE_CALENDAR_ID;

    if (!serviceAccountJson || !calendarId) {
      throw new Error('Google Calendar Credentials fehlen');
    }

    const credentials = JSON.parse(Buffer.from(serviceAccountJson, 'base64').toString());
    
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/calendar.readonly']
    });

    const calendar = google.calendar({ version: 'v3', auth });

    // Zeitraum: 3 Monate zurück bis 12 Monate voraus
    const timeMin = new Date();
    timeMin.setMonth(timeMin.getMonth() - 3);
    
    const timeMax = new Date();
    timeMax.setMonth(timeMax.getMonth() + 12);

    console.log(`[Calendar Sync] Zeitraum: ${timeMin.toISOString()} bis ${timeMax.toISOString()}`);
    console.log(`[Calendar Sync] Calendar ID: ${calendarId}`);

    // Events laden
    const response = await calendar.events.list({
      calendarId,
      timeMin: timeMin.toISOString(),
      timeMax: timeMax.toISOString(),
      singleEvents: true,
      orderBy: 'startTime'
    });

    const events = response.data.items || [];
    console.log(`[Calendar Sync] ${events.length} Events gefunden`);

    result.checked = events.length;

    // Jedes Event verarbeiten
    for (const event of events) {
      try {
        if (!event.id || !event.summary) {
          console.log('[Calendar Sync] Event ohne ID oder Titel übersprungen');
          continue;
        }

        console.log(`[Calendar Sync] Verarbeite: ${event.summary}`);

        // Start und End Datum parsen
        let startDate: Date;
        let endDate: Date;

        if (event.start?.dateTime) {
          // Zeitbasiertes Event
          startDate = new Date(event.start.dateTime);
          endDate = event.end?.dateTime ? new Date(event.end.dateTime) : startDate;
        } else if (event.start?.date) {
          // Ganztägiges Event
          startDate = new Date(event.start.date + 'T00:00:00');
          endDate = event.end?.date ? new Date(event.end.date + 'T00:00:00') : startDate;
        } else {
          console.log('[Calendar Sync] Event ohne gültiges Datum übersprungen');
          continue;
        }

        console.log(`[Calendar Sync] Datum: ${startDate.toISOString()} bis ${endDate.toISOString()}`);

        // Parse Schulungsinfo
        const { hersteller, typ } = parseSchulungFromTitle(event.summary);
        const dauer = calculateDurationDays(startDate, endDate);

        console.log(`[Calendar Sync] Erkannt: Hersteller=${hersteller}, Typ=${typ}, Dauer=${dauer}`);

        // Prüfe ob Event schon existiert
        const existing = await prisma.schulung.findUnique({
          where: { calendarEventId: event.id }
        });

        if (existing) {
          // Update
          console.log(`[Calendar Sync] Aktualisiere existierende Schulung: ${existing.id}`);
          
          await prisma.schulung.update({
            where: { id: existing.id },
            data: {
              titel: event.summary,
              beschreibung: event.description,
              typ: typ as any,
              hersteller: hersteller as any,
              startDatum: startDate,
              endDatum: endDate,
              dauer,
              ort: event.location,
              lastSyncedAt: new Date()
            }
          });

          result.updated++;
          console.log(`[Calendar Sync] ✅ Aktualisiert!`);

        } else {
          // Neu erstellen
          console.log(`[Calendar Sync] Erstelle neue Schulung`);
          
          const schulung = await prisma.schulung.create({
            data: {
              titel: event.summary,
              beschreibung: event.description,
              typ: typ as any,
              hersteller: hersteller as any,
              startDatum: startDate,
              endDatum: endDate,
              dauer,
              maxTeilnehmer: 12, // Standard
              preis: 0, // Wird später gesetzt
              status: 'geplant',
              ort: event.location,
              calendarEventId: event.id,
              lastSyncedAt: new Date()
            }
          });

          result.imported++;
          console.log(`[Calendar Sync] ✅ Erstellt mit ID: ${schulung.id}`);
        }

      } catch (eventError) {
        const errorMsg = `Fehler bei Event ${event.summary}: ${eventError instanceof Error ? eventError.message : 'Unbekannt'}`;
        console.error(`[Calendar Sync] ${errorMsg}`);
        result.errors.push(errorMsg);
      }
    }

    result.success = true;
    console.log(`[Calendar Sync] ✅ Import abgeschlossen: ${result.imported} neu, ${result.updated} aktualisiert`);

    // Log in DB speichern
    await prisma.syncLog.create({
      data: {
        typ: 'import_calendar',
        status: 'completed',
        eventsGeprueft: result.checked,
        eventsImportiert: result.imported,
        eventsAktualisiert: result.updated,
        fehler: result.errors.length,
        fehlermeldung: result.errors.join('\n'),
        completedAt: new Date()
      }
    });

  } catch (error) {
    result.success = false;
    const errorMsg = error instanceof Error ? error.message : 'Unbekannter Fehler';
    result.errors.push(errorMsg);
    console.error('[Calendar Sync] Fehler beim Import:', errorMsg);

    // Error Log
    try {
      await prisma.syncLog.create({
        data: {
          typ: 'import_calendar',
          status: 'failed',
          eventsGeprueft: result.checked,
          eventsImportiert: result.imported,
          eventsAktualisiert: result.updated,
          fehler: result.errors.length,
          fehlermeldung: errorMsg,
          completedAt: new Date()
        }
      });
    } catch (logError) {
      console.error('[Calendar Sync] Konnte Error Log nicht speichern:', logError);
    }
  }

  return result;
}

export async function exportToGoogleCalendar(): Promise<SyncResult> {
  const result: SyncResult = {
    success: false,
    imported: 0,
    updated: 0,
    checked: 0,
    errors: []
  };

  // TODO: Export implementieren
  result.errors.push('Export noch nicht implementiert');
  
  return result;
}
