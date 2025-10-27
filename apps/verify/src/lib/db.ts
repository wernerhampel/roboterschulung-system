import { neon } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

export const sql = neon(process.env.DATABASE_URL);

export async function validateCertificate(hash: string) {
  const result = await sql`
    SELECT 
      z.id,
      z.zertifikat_nummer,
      z.ausstellungsdatum,
      z.status,
      t.vorname,
      t.nachname,
      s.titel as schulung_titel,
      s.typ as schulung_typ,
      s.hersteller,
      ter.start_datum,
      ter.end_datum
    FROM zertifikate z
    JOIN anmeldungen a ON z.anmeldung_id = a.id
    JOIN teilnehmer t ON a.teilnehmer_id = t.id
    JOIN termine ter ON a.termin_id = ter.id
    JOIN schulungen s ON ter.schulung_id = s.id
    WHERE z.validierung_hash = ${hash}
    AND z.status = 'gueltig'
  `;

  return result[0] || null;
}

export async function logValidation(
  zertifikatId: string | null,
  hash: string,
  success: boolean,
  ipAddress?: string,
  userAgent?: string
) {
  await sql`
    INSERT INTO validierungen (zertifikat_id, validierung_hash, erfolg, ip_adresse, user_agent)
    VALUES (${zertifikatId}, ${hash}, ${success}, ${ipAddress}, ${userAgent})
  `;
}
