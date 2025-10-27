import { neon } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

export const sql = neon(process.env.DATABASE_URL);

export type Schulung = {
  id: string;
  titel: string;
  beschreibung?: string;
  typ: 'Grundlagen' | 'Praxis' | 'Online' | 'Sonder';
  hersteller: 'KUKA' | 'ABB' | 'Mitsubishi' | 'Fanuc' | 'Universal Robots' | 'Sonstige';
  dauer_tage: number;
  max_teilnehmer: number;
  preis_pro_person?: number;
  google_calendar_event_id?: string;
  status: 'geplant' | 'aktiv' | 'abgeschlossen' | 'abgesagt';
  created_at: Date;
  updated_at: Date;
};

export type Termin = {
  id: string;
  schulung_id: string;
  start_datum: Date;
  end_datum: Date;
  start_zeit?: string;
  end_zeit?: string;
  standort?: string;
  raum?: string;
  status: 'geplant' | 'bestaetigt' | 'abgeschlossen' | 'abgesagt';
  notizen?: string;
  created_at: Date;
  updated_at: Date;
};

export type Teilnehmer = {
  id: string;
  vorname: string;
  nachname: string;
  email: string;
  firma?: string;
  telefon?: string;
  notizen?: string;
  created_at: Date;
  updated_at: Date;
};

export type Anmeldung = {
  id: string;
  termin_id: string;
  teilnehmer_id: string;
  status: 'angemeldet' | 'bestaetigt' | 'teilgenommen' | 'abgesagt' | 'nicht_erschienen';
  anmeldedatum: Date;
  bezahlt: boolean;
  bezahldatum?: Date;
  notizen?: string;
  created_at: Date;
  updated_at: Date;
};

export type Zertifikat = {
  id: string;
  anmeldung_id: string;
  zertifikat_nummer: string;
  ausstellungsdatum: Date;
  validierung_hash: string;
  google_drive_file_id?: string;
  google_drive_url?: string;
  qr_code_data?: string;
  status: 'gueltig' | 'widerrufen' | 'abgelaufen';
  created_at: Date;
  updated_at: Date;
};

// Database query helpers
export async function getSchulungen() {
  return await sql`SELECT * FROM schulungen ORDER BY created_at DESC`;
}

export async function getSchulungById(id: string) {
  const result = await sql`SELECT * FROM schulungen WHERE id = ${id}`;
  return result[0];
}

export async function getTermineBySchulungId(schulungId: string) {
  return await sql`
    SELECT * FROM termine 
    WHERE schulung_id = ${schulungId} 
    ORDER BY start_datum ASC
  `;
}

export async function getTeilnehmer() {
  return await sql`SELECT * FROM teilnehmer ORDER BY nachname, vorname`;
}

export async function getAnmeldungenByTerminId(terminId: string) {
  return await sql`
    SELECT a.*, t.vorname, t.nachname, t.email, t.firma
    FROM anmeldungen a
    JOIN teilnehmer t ON a.teilnehmer_id = t.id
    WHERE a.termin_id = ${terminId}
    ORDER BY a.anmeldedatum DESC
  `;
}

export async function getZertifikatByHash(hash: string) {
  const result = await sql`
    SELECT z.*, 
           a.termin_id,
           t.vorname, t.nachname, t.email,
           ter.start_datum, ter.end_datum,
           s.titel as schulung_titel, s.typ, s.hersteller
    FROM zertifikate z
    JOIN anmeldungen a ON z.anmeldung_id = a.id
    JOIN teilnehmer t ON a.teilnehmer_id = t.id
    JOIN termine ter ON a.termin_id = ter.id
    JOIN schulungen s ON ter.schulung_id = s.id
    WHERE z.validierung_hash = ${hash}
  `;
  return result[0];
}

export async function logValidierung(
  zertifikatId: string | null,
  hash: string,
  erfolg: boolean,
  ipAdresse?: string,
  userAgent?: string
) {
  await sql`
    INSERT INTO validierungen (zertifikat_id, validierung_hash, erfolg, ip_adresse, user_agent)
    VALUES (${zertifikatId}, ${hash}, ${erfolg}, ${ipAdresse}, ${userAgent})
  `;
}
