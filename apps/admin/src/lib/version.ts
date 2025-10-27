export const APP_VERSION = '1.2.0';
export const BUILD_DATE = new Date().toISOString();

export const CHANGELOG = {
  '1.2.0': [
    'Fix: Ganztägige Events werden jetzt unterstützt',
    'Feature: Versions-Anzeige im Header',
    'Feature: Debug-Modus für Calendar-Sync',
  ],
  '1.1.0': [
    'Feature: Google Calendar bidirektionaler Sync',
    'Feature: Sync-UI mit detaillierten Statistiken',
  ],
  '1.0.0': [
    'Initial Release',
    'Dashboard mit Navigation',
    'Datenbank-Integration',
  ],
};
