import { google } from 'googleapis';
import { sql } from './db';
import { createCalendarEvent, updateCalendarEvent, deleteCalendarEvent } from './google';

// Initialize Google Auth
function getGoogleAuth() {
  if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
    throw new Error('Google Service Account credentials are not configured');
  }

  const privateKey = process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n');

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: privateKey,
    },
    scopes: ['https://www.googleapis.com/auth/calendar'],
  });

  return auth;
}

export type SyncResult = {
  success: boolean;
  eventsImported: number;
  eventsUpdated: number;
  eventsCreated: number;
  errors: string[];
  summary: string;
  debug?: {
    totalEventsFound: number;
    eventsProcessed: number;
    eventsSkipped: number;
    calendarId: string;
    timeRange: { start: string; end: string };
    sampleEvent?: any;
  };
};

/**
 * Sync FROM Google Calendar TO Database
 * Reads all events from calendar and creates/updates schulungen and termine
 */
export async function syncFromCalendar(): Promise<SyncResult> {
  const result: SyncResult = {
    success: false,
    eventsImported: 0,
    eventsUpdated: 0,
    eventsCreated: 0,
    errors: [],
    summary: '',
  };

  try {
    const auth = getGoogleAuth();
    const calendar = google.calendar({ version: 'v3', auth });

    // Get all events from calendar (next 6 months)
    const now = new Date();
    const sixMonthsFromNow = new Date();
    sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);

    console.log('📅 Syncing from Calendar...', {
      calendarId: process.env.GOOGLE_CALENDAR_ID,
      timeRange: { start: now.toISOString(), end: sixMonthsFromNow.toISOString() }
    });

    const response = await calendar.events.list({
      calendarId: process.env.GOOGLE_CALENDAR_ID!,
      timeMin: now.toISOString(),
      timeMax: sixMonthsFromNow.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
    });

    const events = response.data.items || [];
    
    console.log(`📊 Found ${events.length} events in calendar`);

    // Add debug info
    result.debug = {
      totalEventsFound: events.length,
      eventsProcessed: 0,
      eventsSkipped: 0,
      calendarId: process.env.GOOGLE_CALENDAR_ID || '',
      timeRange: {
        start: now.toISOString(),
        end: sixMonthsFromNow.toISOString(),
      },
      sampleEvent: events.length > 0 ? {
        id: events[0].id,
        summary: events[0].summary,
        start: events[0].start,
        end: events[0].end,
      } : null,
    };

    for (const event of events) {
      try {
        if (!event.id || !event.summary) {
          console.log('⏭️  Skipping event (no id or summary):', event);
          if (result.debug) result.debug.eventsSkipped++;
          continue; // Skip events without required data
        }

        // Support both timed events (dateTime) and all-day events (date)
        const startDate = event.start?.dateTime || event.start?.date;
        const endDate = event.end?.dateTime || event.end?.date;

        if (!startDate) {
          console.log('⏭️  Skipping event (no start date):', event.summary);
          if (result.debug) result.debug.eventsSkipped++;
          continue; // Skip events without start date
        }

        console.log('✅ Processing event:', {
          id: event.id,
          summary: event.summary,
          startDate,
          endDate,
          isAllDay: !!event.start?.date,
        });

        if (result.debug) result.debug.eventsProcessed++;

        // Check if schulung with this calendar event ID exists
        const existingSchulung = await sql`
          SELECT s.*, t.id as termin_id 
          FROM schulungen s
          LEFT JOIN termine t ON s.id = t.schulung_id AND t.status != 'abgesagt'
          WHERE s.google_calendar_event_id = ${event.id}
          LIMIT 1
        `;

        if (existingSchulung.length > 0) {
          // Update existing
          const schulung = existingSchulung[0];
          
          await sql`
            UPDATE schulungen 
            SET titel = ${event.summary},
                beschreibung = ${event.description || ''},
                updated_at = NOW()
            WHERE id = ${schulung.id}
          `;

          if (schulung.termin_id) {
            await sql`
              UPDATE termine
              SET start_datum = ${new Date(startDate).toISOString().split('T')[0]},
                  end_datum = ${new Date(endDate || startDate).toISOString().split('T')[0]},
                  standort = ${event.location || ''},
                  updated_at = NOW()
              WHERE id = ${schulung.termin_id}
            `;
          }

          result.eventsUpdated++;
        } else {
          // Create new schulung and termin
          // Try to parse type and hersteller from title or description
          let typ = 'Grundlagen';
          let hersteller = 'Sonstige';

          // Parse from title (e.g., "KUKA KRC4 Grundlagen")
          const title = event.summary.toUpperCase();
          if (title.includes('KUKA')) hersteller = 'KUKA';
          else if (title.includes('ABB')) hersteller = 'ABB';
          else if (title.includes('FANUC')) hersteller = 'Fanuc';
          else if (title.includes('MITSUBISHI')) hersteller = 'Mitsubishi';
          else if (title.includes('UNIVERSAL')) hersteller = 'Universal Robots';

          if (title.includes('PRAXIS')) typ = 'Praxis';
          else if (title.includes('ONLINE')) typ = 'Online';
          else if (title.includes('SONDER')) typ = 'Sonder';

          // Calculate duration in days
          const eventStartDate = new Date(startDate);
          const eventEndDate = new Date(endDate || startDate);
          const durationDays = Math.ceil((eventEndDate.getTime() - eventStartDate.getTime()) / (1000 * 60 * 60 * 24)) || 1;

          // Create schulung
          const newSchulung = await sql`
            INSERT INTO schulungen (
              titel, 
              beschreibung, 
              typ, 
              hersteller, 
              dauer_tage, 
              max_teilnehmer,
              google_calendar_event_id,
              status
            )
            VALUES (
              ${event.summary},
              ${event.description || ''},
              ${typ},
              ${hersteller},
              ${durationDays},
              6,
              ${event.id},
              'geplant'
            )
            RETURNING id
          `;

          const schulungId = newSchulung[0].id;

          // Create termin
          await sql`
            INSERT INTO termine (
              schulung_id,
              start_datum,
              end_datum,
              standort,
              status
            )
            VALUES (
              ${schulungId},
              ${eventStartDate.toISOString().split('T')[0]},
              ${eventEndDate.toISOString().split('T')[0]},
              ${event.location || ''},
              'geplant'
            )
          `;

          result.eventsCreated++;
        }

        result.eventsImported++;
      } catch (err) {
        result.errors.push(`Event ${event.summary}: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    }

    result.success = result.errors.length === 0;
    result.summary = `Importiert: ${result.eventsImported}, Neu: ${result.eventsCreated}, Aktualisiert: ${result.eventsUpdated}`;

    // Log sync to audit log
    await sql`
      INSERT INTO audit_log (benutzer, aktion, tabelle, neue_werte)
      VALUES ('system', 'calendar_sync_from', 'schulungen', ${JSON.stringify(result)})
    `;

  } catch (error) {
    result.success = false;
    result.errors.push(error instanceof Error ? error.message : 'Unknown error');
    result.summary = 'Sync fehlgeschlagen';
  }

  return result;
}

/**
 * Sync FROM Database TO Google Calendar
 * Creates/updates calendar events for all schulungen/termine without calendar ID
 */
export async function syncToCalendar(): Promise<SyncResult> {
  const result: SyncResult = {
    success: false,
    eventsImported: 0,
    eventsUpdated: 0,
    eventsCreated: 0,
    errors: [],
    summary: '',
  };

  try {
    // Get all schulungen with termine that don't have calendar event ID
    const schulungenOhneEvent = await sql`
      SELECT 
        s.id as schulung_id,
        s.titel,
        s.beschreibung,
        s.typ,
        s.hersteller,
        s.google_calendar_event_id,
        t.id as termin_id,
        t.start_datum,
        t.end_datum,
        t.start_zeit,
        t.end_zeit,
        t.standort
      FROM schulungen s
      JOIN termine t ON s.id = t.schulung_id
      WHERE t.status != 'abgesagt'
      ORDER BY t.start_datum
    `;

    for (const item of schulungenOhneEvent) {
      try {
        const eventData = {
          summary: item.titel,
          description: `${item.typ} Training - ${item.hersteller}\n\n${item.beschreibung || ''}`,
          location: item.standort || '',
          startDate: new Date(item.start_datum),
          endDate: new Date(item.end_datum),
          startTime: item.start_zeit || '09:00',
          endTime: item.end_zeit || '17:00',
        };

        if (!item.google_calendar_event_id) {
          // Create new calendar event
          const eventId = await createCalendarEvent(eventData);

          // Update schulung with calendar event ID
          await sql`
            UPDATE schulungen
            SET google_calendar_event_id = ${eventId},
                updated_at = NOW()
            WHERE id = ${item.schulung_id}
          `;

          result.eventsCreated++;
        } else {
          // Update existing calendar event
          await updateCalendarEvent(item.google_calendar_event_id, eventData);
          result.eventsUpdated++;
        }

        result.eventsImported++;
      } catch (err) {
        result.errors.push(`Schulung ${item.titel}: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    }

    result.success = result.errors.length === 0;
    result.summary = `Synchronisiert: ${result.eventsImported}, Neu: ${result.eventsCreated}, Aktualisiert: ${result.eventsUpdated}`;

    // Log sync to audit log
    await sql`
      INSERT INTO audit_log (benutzer, aktion, tabelle, neue_werte)
      VALUES ('system', 'calendar_sync_to', 'schulungen', ${JSON.stringify(result)})
    `;

  } catch (error) {
    result.success = false;
    result.errors.push(error instanceof Error ? error.message : 'Unknown error');
    result.summary = 'Sync fehlgeschlagen';
  }

  return result;
}

/**
 * Full bidirectional sync
 * First syncs FROM calendar TO database, then FROM database TO calendar
 */
export async function fullSync(): Promise<{ from: SyncResult; to: SyncResult }> {
  const fromResult = await syncFromCalendar();
  const toResult = await syncToCalendar();

  return {
    from: fromResult,
    to: toResult,
  };
}
