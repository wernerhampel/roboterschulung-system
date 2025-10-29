export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount);
}

export function formatDuration(days: number): string {
  if (days === 1) return '1 Tag';
  return `${days} Tage`;
}

export function getSchulungsTypLabel(typ: string): string {
  const labels: Record<string, string> = {
    'grundlagen': 'Grundlagen',
    'fortgeschritten': 'Fortgeschritten',
    'wartung': 'Wartung & Instandhaltung',
    'individualschulung': 'Individualschulung'
  };
  return labels[typ] || typ;
}

export function getHerstellerLabel(hersteller: string): string {
  const labels: Record<string, string> = {
    'kuka': 'KUKA',
    'abb': 'ABB',
    'fanuc': 'FANUC',
    'siemens': 'Siemens',
    'yaskawa': 'Yaskawa Motoman',
    'universal_robots': 'Universal Robots',
    'staubli': 'Stäubli',
    'kawasaki': 'Kawasaki',
    'denso': 'DENSO'
  };
  return labels[hersteller] || hersteller.toUpperCase();
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    'geplant': 'yellow',
    'aktiv': 'green',
    'abgeschlossen': 'gray',
    'abgesagt': 'red'
  };
  return colors[status] || 'gray';
}

export function getBezahlstatusColor(status: string): string {
  const colors: Record<string, string> = {
    'offen': 'yellow',
    'bezahlt': 'green',
    'teilweise': 'orange',
    'erstattet': 'gray'
  };
  return colors[status] || 'gray';
}

export function calculateAuslastung(anmeldungen: number, maxTeilnehmer: number): number {
  return Math.round((anmeldungen / maxTeilnehmer) * 100);
}

export function getFreiePlaetze(anmeldungen: number, maxTeilnehmer: number): number {
  return Math.max(0, maxTeilnehmer - anmeldungen);
}

export function generateZertifikatsnummer(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `ROBTEC-${year}${month}-${random}`;
}

export function calculateTagesBis(datum: Date | string): number {
  const zielDatum = typeof datum === 'string' ? new Date(datum) : datum;
  const heute = new Date();
  const differenz = zielDatum.getTime() - heute.getTime();
  return Math.ceil(differenz / (1000 * 60 * 60 * 24));
}

export function isSchulungVorbei(endDatum: Date | string): boolean {
  const ende = typeof endDatum === 'string' ? new Date(endDatum) : endDatum;
  return ende < new Date();
}

export function isSchulungAktiv(startDatum: Date | string, endDatum: Date | string): boolean {
  const start = typeof startDatum === 'string' ? new Date(startDatum) : startDatum;
  const ende = typeof endDatum === 'string' ? new Date(endDatum) : endDatum;
  const jetzt = new Date();
  return jetzt >= start && jetzt <= ende;
}
