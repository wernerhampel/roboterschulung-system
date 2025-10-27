# ROBTEC Training Management - Version 1.3.0

## 🎯 Was ist neu?

### ✨ Schulungsliste (Hauptfeature)
- **Übersichtliche Tabelle** mit allen Schulungen
- **Intelligente Filter**: Typ, Hersteller, Status, Suche
- **Statistik-Dashboard**: Schneller Überblick über alle Zahlen
- **Teilnehmer-Anzeige**: Sehe wie voll jede Schulung ist
- **Google Calendar Integration**: Markierung importierter Events
- **Responsive Design**: Funktioniert auf allen Geräten

### 📊 Features im Detail:

#### Filter
- Suche nach Titel oder Ort
- Filter nach Schulungstyp (Grundlagen, Praxis, Online)
- Filter nach Hersteller (KUKA, ABB, Mitsubishi, etc.)
- Filter nach Status (Geplant, Bestätigt, Laufend, etc.)
- Kombinierbare Filter
- Filter zurücksetzen

#### Statistiken
- Gesamtanzahl Schulungen
- Geplante Schulungen
- Bestätigte Schulungen
- Laufende Schulungen

#### Tabelle
- Sortiert nach Startdatum
- Zeigt Titel, Typ, Hersteller, Datum, Dauer, Teilnehmer, Status
- Link zu Details (kommt in v1.4)
- Markierung für Google Calendar Events
- Prozentuale Auslastung

---

## 🚀 Installation

### Automatisch (empfohlen):
```bash
cd ~/roboterschulung-system
tar -xzf ~/Downloads/schulungsliste-v1.3.0.tar.gz
git add .
git commit -m "v1.3.0: Schulungsliste mit Filter und Übersicht"
git push origin main
```

### Mit Update-Script:
```bash
cd ~/roboterschulung-system
./update.sh
# Wähle: schulungsliste-v1.3.0.tar.gz
```

---

## 📋 Neue Dateien

```
apps/admin/src/app/
  ├── schulungen/
  │   └── page.tsx          ← Neue Schulungsliste
  └── api/
      └── schulungen/
          └── route.ts      ← Neue API für Schulungen
```

---

## 🧪 Nach dem Deployment testen:

1. **Öffne die Schulungsliste:**
   ```
   https://robtec-admin.vercel.app/schulungen
   ```

2. **Teste die Filter:**
   - Suche nach einem Schulungsnamen
   - Filtere nach KUKA oder ABB
   - Filtere nach Status "Geplant"
   - Kombiniere mehrere Filter

3. **Prüfe die Daten:**
   - Siehst du die importierten Schulungen?
   - Stimmen die Teilnehmerzahlen?
   - Sind die Datumsangaben korrekt?

4. **Navigation testen:**
   - Vom Dashboard → Schulungen
   - Von Schulungen → zurück zum Dashboard

---

## 🔧 API Endpoints

### GET /api/schulungen
Lädt alle Schulungen mit Teilnehmerzahlen.

**Response:**
```json
[
  {
    "id": "...",
    "titel": "KUKA KRC4 Grundlagen",
    "typ": "grundlagen",
    "hersteller": "kuka",
    "startDatum": "2024-11-15T00:00:00.000Z",
    "endDatum": "2024-11-19T00:00:00.000Z",
    "dauer": 5,
    "maxTeilnehmer": 6,
    "status": "geplant",
    "_count": {
      "anmeldungen": 3
    }
  }
]
```

### POST /api/schulungen
Erstellt eine neue Schulung.

**Request Body:**
```json
{
  "titel": "ABB IRC5 Praxis",
  "typ": "praxis",
  "hersteller": "abb",
  "startDatum": "2024-12-01",
  "endDatum": "2024-12-03",
  "dauer": 3,
  "maxTeilnehmer": 4,
  "status": "geplant"
}
```

---

## 🐛 Troubleshooting

### Schulungen werden nicht angezeigt
- Prüfe ob der Calendar-Sync erfolgreich war
- Öffne Browser-Konsole und suche nach Fehlern
- Prüfe API Logs in Vercel

### 404 Fehler
- Stelle sicher dass das Deployment abgeschlossen ist
- Clear Browser Cache
- Prüfe ob die Dateien im korrekten Verzeichnis sind

### Leere Tabelle trotz Sync
- Gehe zu /sync und führe Import erneut aus
- Prüfe ob Schulungen in der Datenbank sind:
  ```sql
  SELECT * FROM "Schulung";
  ```

---

## 🎯 Nächste Schritte (v1.4.0)

- [ ] Schulungsdetails-Seite
- [ ] Teilnehmerverwaltung
- [ ] Schulung bearbeiten/löschen
- [ ] Anmeldungen verwalten
- [ ] Zertifikate generieren

---

## 📝 Changelog

### Version 1.3.0 (2024-10-27)
- ✅ Neue Schulungsliste mit Tabelle
- ✅ Filter für Typ, Hersteller, Status, Suche
- ✅ Statistik-Dashboard
- ✅ API Endpoint für Schulungen
- ✅ Responsive Design
- ✅ Google Calendar Integration Markierung

### Version 1.2.0 (2024-10-27)
- ✅ Version im Header
- ✅ Debug-Modus für Calendar-Sync
- ✅ Support für ganztägige Events

### Version 1.1.0 (2024-10-26)
- ✅ Google Calendar Sync (Import/Export)
- ✅ Dashboard mit Navigation
- ✅ Datenbank-Schema

---

**Bei Fragen oder Problemen:** Öffne die Browser-Konsole und schau nach Fehlermeldungen!
