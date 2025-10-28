import crypto from 'crypto';

/**
 * Generiert einen sicheren Hash für Zertifikat-Validierung
 * Basierend auf: Schulung ID, Teilnehmer ID, Ausstellungsdatum
 */
export function generateCertificateHash(
  schulungId: string,
  teilnehmerId: string,
  ausstellungsdatum: Date
): string {
  const data = `${schulungId}-${teilnehmerId}-${ausstellungsdatum.toISOString()}`;
  const secret = process.env.CERTIFICATE_SECRET || 'robtec-default-secret-change-in-production';
  
  return crypto
    .createHmac('sha256', secret)
    .update(data)
    .digest('hex');
}

/**
 * Validiert einen Zertifikat-Hash
 */
export function validateCertificateHash(
  hash: string,
  schulungId: string,
  teilnehmerId: string,
  ausstellungsdatum: Date
): boolean {
  const expectedHash = generateCertificateHash(schulungId, teilnehmerId, ausstellungsdatum);
  return hash === expectedHash;
}

/**
 * Generiert QR-Code URL für Zertifikat-Validierung
 */
export function generateQRCodeURL(zertifikatId: string, hash: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://robtec-admin.vercel.app';
  return `${baseUrl}/verify/${zertifikatId}?hash=${hash}`;
}

/**
 * Generiert Zertifikat-Nummer im Format: YYYY-MM-XXXX
 * YYYY = Jahr, MM = Monat, XXXX = laufende Nummer
 */
export function generateCertificateNumber(count: number, date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const number = String(count).padStart(4, '0');
  
  return `${year}-${month}-${number}`;
}

/**
 * Bestimmt Template basierend auf Schulung
 */
export function determineTemplate(
  hersteller: string,
  typ: string
): string {
  // KUKA Templates
  if (hersteller === 'kuka') {
    if (typ === 'grundlagen') return 'kuka-grundlagen';
    if (typ === 'praxis') return 'kuka-praxis';
    return 'kuka-sonstige';
  }
  
  // ABB Templates
  if (hersteller === 'abb') {
    if (typ === 'grundlagen') return 'abb-grundlagen';
    if (typ === 'praxis') return 'abb-praxis';
    return 'abb-sonstige';
  }
  
  // Mitsubishi Templates
  if (hersteller === 'mitsubishi') {
    if (typ === 'grundlagen') return 'mitsubishi-grundlagen';
    if (typ === 'praxis') return 'mitsubishi-praxis';
    return 'mitsubishi-sonstige';
  }
  
  // Universal Robots
  if (hersteller === 'universal_robots') {
    if (typ === 'grundlagen') return 'ur-grundlagen';
    if (typ === 'praxis') return 'ur-praxis';
    return 'ur-sonstige';
  }
  
  // Default
  return 'robtec-standard';
}

/**
 * Formatiert Datum für Zertifikat (DD.MM.YYYY)
 */
export function formatCertificateDate(date: Date): string {
  return date.toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

/**
 * Berechnet Gültigkeitsdatum (Standard: +3 Jahre)
 */
export function calculateExpiryDate(issueDate: Date, years: number = 3): Date {
  const expiryDate = new Date(issueDate);
  expiryDate.setFullYear(expiryDate.getFullYear() + years);
  return expiryDate;
}

/**
 * Prüft ob Zertifikat noch gültig ist
 */
export function isCertificateValid(expiryDate: Date): boolean {
  return new Date() < expiryDate;
}

/**
 * Erstellt Zertifikat-Daten für PDF-Generierung
 */
export interface CertificateData {
  zertifikatNummer: string;
  teilnehmerName: string;
  firma?: string;
  schulungTitel: string;
  schulungTyp: string;
  hersteller: string;
  startDatum: string;
  endDatum: string;
  dauer: number;
  ausstellungsdatum: string;
  gueltigBis: string;
  trainer?: string;
  ort?: string;
  qrCodeURL: string;
  hash: string;
}

/**
 * Bereitet Zertifikat-Daten vor
 */
export function prepareCertificateData(
  zertifikat: any,
  schulung: any,
  teilnehmer: any
): CertificateData {
  const qrCodeURL = generateQRCodeURL(zertifikat.id, zertifikat.validierungsHash);
  
  return {
    zertifikatNummer: zertifikat.zertifikatNummer,
    teilnehmerName: `${teilnehmer.vorname} ${teilnehmer.nachname}`,
    firma: teilnehmer.firma || undefined,
    schulungTitel: schulung.titel,
    schulungTyp: getTypLabel(schulung.typ),
    hersteller: getHerstellerLabel(schulung.hersteller),
    startDatum: formatCertificateDate(new Date(schulung.startDatum)),
    endDatum: formatCertificateDate(new Date(schulung.endDatum)),
    dauer: schulung.dauer,
    ausstellungsdatum: formatCertificateDate(new Date(zertifikat.ausstellungsdatum)),
    gueltigBis: formatCertificateDate(new Date(zertifikat.gueltigBis)),
    trainer: schulung.trainer || undefined,
    ort: schulung.ort || undefined,
    qrCodeURL,
    hash: zertifikat.validierungsHash
  };
}

function getTypLabel(typ: string): string {
  const labels: Record<string, string> = {
    grundlagen: 'Grundlagen',
    praxis: 'Praxis',
    online: 'Online',
    sonstige: 'Sonstige'
  };
  return labels[typ] || typ;
}

function getHerstellerLabel(hersteller: string): string {
  const labels: Record<string, string> = {
    kuka: 'KUKA',
    abb: 'ABB',
    mitsubishi: 'Mitsubishi',
    universal_robots: 'Universal Robots',
    sonstige: 'Sonstige'
  };
  return labels[hersteller] || hersteller;
}
