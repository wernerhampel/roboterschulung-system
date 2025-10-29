// Utility Functions für ROBTEC Schulungssystem

/**
 * Formatiert ein Datum im deutschen Format
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(d);
}

/**
 * Formatiert Datum und Uhrzeit
 */
export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(d);
}

/**
 * Formatiert einen Geldbetrag in Euro
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount);
}

/**
 * Formatiert Dauer in Tagen
 */
export function formatDuration(days: number): string {
  if (days === 1) return '1 Tag';
  return `${days} Tage`;
}

/**
 * Gibt das Label für einen Schulungstyp zurück
 */
export function getSchulungsTypLabel(typ: string): string {
  const labels: Record<string, string> = {
    grundlagen: 'Grundlagenschulung',
    fortgeschritten: 'Fortgeschrittene Schulung',
    wartung: 'Wartungsschulung',
    individualschulung: 'Individualschulung'
  };
  return labels[typ] || typ;
}

/**
 * Gibt das Label für einen Hersteller zurück
 */
export function getHerstellerLabel(hersteller: string): string {
  const labels: Record<string, string> = {
    kuka: 'KUKA',
    abb: 'ABB',
    fanuc: 'FANUC',
    siemens: 'Siemens',
    yaskawa: 'Yaskawa',
    'universal-robots': 'Universal Robots',
    staeubli: 'Stäubli',
    kawasaki: 'Kawasaki',
    denso: 'DENSO'
  };
  return labels[hersteller] || hersteller;
}

/**
 * Gibt die Tailwind CSS Klassen für einen Status zurück
 */
export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    geplant: 'bg-blue-100 text-blue-800',
    aktiv: 'bg-green-100 text-green-800',
    abgeschlossen: 'bg-gray-100 text-gray-800',
    abgesagt: 'bg-red-100 text-red-800'
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}

/**
 * Gibt die Tailwind CSS Klassen für einen Bezahlstatus zurück
 */
export function getBezahlstatusColor(status: string): string {
  const colors: Record<string, string> = {
    offen: 'bg-yellow-100 text-yellow-800',
    bezahlt: 'bg-green-100 text-green-800',
    erstattet: 'bg-gray-100 text-gray-800'
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}

/**
 * Berechnet die Auslastung in Prozent
 */
export function calculateAuslastung(anmeldungen: number, maxTeilnehmer: number): number {
  if (maxTeilnehmer === 0) return 0;
  return Math.round((anmeldungen / maxTeilnehmer) * 100);
}

/**
 * Berechnet die Anzahl freier Plätze
 */
export function getFreiePlaetze(anmeldungen: number, maxTeilnehmer: number): number {
  return Math.max(0, maxTeilnehmer - anmeldungen);
}

/**
 * Generiert eine Zertifikatsnummer
 * Format: ROBT-YYYY-XXXXX
 */
export function generateZertifikatsnummer(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
  return `ROBT-${year}-${random}`;
}

/**
 * Berechnet die Anzahl der Tage bis zu einem Datum
 */
export function calculateTagesBis(date: Date | string): number {
  const d = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);
  
  const diffTime = d.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}

/**
 * Prüft ob eine Schulung bereits vorbei ist
 */
export function isSchulungVorbei(endDatum: Date | string): boolean {
  const d = typeof endDatum === 'string' ? new Date(endDatum) : endDatum;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);
  
  return d < today;
}

/**
 * Prüft ob eine Schulung gerade aktiv ist
 */
export function isSchulungAktiv(startDatum: Date | string, endDatum: Date | string): boolean {
  const start = typeof startDatum === 'string' ? new Date(startDatum) : startDatum;
  const end = typeof endDatum === 'string' ? new Date(endDatum) : endDatum;
  const today = new Date();
  
  today.setHours(0, 0, 0, 0);
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  
  return today >= start && today <= end;
}

/**
 * Generiert einen QR-Code Hash für Zertifikatsvalidierung
 */
export function generateQRCodeHash(
  zertifikatsnummer: string,
  teilnehmerId: string,
  salt: string
): string {
  // In Production würde hier eine echte Hash-Funktion verwendet (crypto)
  // Für Development: Einfache Kombination
  const data = `${zertifikatsnummer}-${teilnehmerId}-${salt}`;
  
  // Base64 Encoding als einfacher Hash
  if (typeof btoa !== 'undefined') {
    return btoa(data);
  }
  
  // Node.js Fallback
  return Buffer.from(data).toString('base64');
}

/**
 * Erstellt eine Validierungs-URL für ein Zertifikat
 */
export function createValidierungsUrl(qrCodeHash: string, baseUrl: string = 'https://verify.roboterschulung.de'): string {
  return `${baseUrl}?cert=${encodeURIComponent(qrCodeHash)}`;
}

/**
 * Formatiert eine Telefonnummer
 */
export function formatPhoneNumber(phone: string): string {
  // Entferne alle Nicht-Ziffern außer +
  const cleaned = phone.replace(/[^\d+]/g, '');
  
  // Deutsche Nummer?
  if (cleaned.startsWith('+49') || cleaned.startsWith('0049')) {
    const number = cleaned.replace(/^(\+49|0049)/, '0');
    // Format: 0123 456789 oder 0123 45678-90
    if (number.length === 11) {
      return `${number.substr(0, 4)} ${number.substr(4, 6)}-${number.substr(10)}`;
    }
    if (number.length === 10) {
      return `${number.substr(0, 4)} ${number.substr(4)}`;
    }
  }
  
  return phone;
}

/**
 * Validiert eine E-Mail-Adresse
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Kürzt einen Text auf eine maximale Länge
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substr(0, maxLength - 3) + '...';
}

/**
 * Berechnet die Provision für eine Vermittlung
 */
export function calculateProvision(betrag: number, provisionRate: number): number {
  return Math.round((betrag * provisionRate) * 100) / 100;
}

/**
 * Erstellt einen Slug aus einem Text
 */
export function createSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Gruppiert ein Array nach einer Eigenschaft
 */
export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((result, item) => {
    const groupKey = String(item[key]);
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
    return result;
  }, {} as Record<string, T[]>);
}

/**
 * Sortiert ein Array nach Datum
 */
export function sortByDate<T>(
  array: T[],
  dateKey: keyof T,
  order: 'asc' | 'desc' = 'asc'
): T[] {
  return [...array].sort((a, b) => {
    const dateA = new Date(a[dateKey] as any).getTime();
    const dateB = new Date(b[dateKey] as any).getTime();
    return order === 'asc' ? dateA - dateB : dateB - dateA;
  });
}

/**
 * Prüft ob ein Datum in einem bestimmten Zeitraum liegt
 */
export function isDateInRange(
  date: Date | string,
  startDate: Date | string,
  endDate: Date | string
): boolean {
  const d = typeof date === 'string' ? new Date(date) : date;
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
  
  return d >= start && d <= end;
}

/**
 * Formatiert einen Zeitstempel als "vor X Minuten/Stunden/Tagen"
 */
export function formatTimeAgo(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'gerade eben';
  if (diffMins === 1) return 'vor 1 Minute';
  if (diffMins < 60) return `vor ${diffMins} Minuten`;
  if (diffHours === 1) return 'vor 1 Stunde';
  if (diffHours < 24) return `vor ${diffHours} Stunden`;
  if (diffDays === 1) return 'gestern';
  if (diffDays < 7) return `vor ${diffDays} Tagen`;
  if (diffDays < 30) return `vor ${Math.floor(diffDays / 7)} Wochen`;
  if (diffDays < 365) return `vor ${Math.floor(diffDays / 30)} Monaten`;
  return `vor ${Math.floor(diffDays / 365)} Jahren`;
}
