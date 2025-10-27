# 🔧 Version 1.3.5 - Calendar Sync Fix + Cleanup

## 🐛 Behobene Probleme:

1. **Calendar Sync speichert jetzt richtig**
   - Besseres Error Handling
   - Detaillierteres Logging
   - Ganztägige Events werden korrekt verarbeitet

2. **Demo-Daten Cleanup**
   - Neue API Route zum Löschen von Demo-Schulungen
   - Nur Schulungen OHNE calendarEventId werden gelöscht

---

## 📦 Installation:

```bash
cd ~/roboterschulung-system
tar -xzf ~/Downloads/calendar-sync-fix-v1.3.5.tar.gz
git add .
git commit -m "v1.3.5: Calendar Sync Fix + Cleanup"
git push
```

---

## 🧪 Nach dem Deployment:

### Schritt 1: Demo-Daten löschen
```bash
curl -X POST https://robtec-admin.vercel.app/api/cleanup
```

Oder im Browser öffnen (POST Request wird ausgeführt):
```
https://robtec-admin.vercel.app/api/cleanup
```

### Schritt 2: Calendar Sync neu ausführen
1. Gehe zu: https://robtec-admin.vercel.app/sync
2. Klicke "Importieren"
3. Warte auf Erfolg-Meldung

### Schritt 3: Schulungsliste prüfen
```
https://robtec-admin.vercel.app/schulungen
→ Jetzt sollte die Schulung aus dem Calendar erscheinen! 🎉
```

---

## 🔍 Was wurde verbessert:

### Calendar Sync (`calendar-sync.ts`):
- ✅ Besseres Parsing von Event-Titeln
- ✅ Automatische Erkennung von Hersteller & Typ
- ✅ Korrekte Behandlung ganztägiger Events
- ✅ Detailliertes Console Logging
- ✅ Error Handling pro Event
- ✅ SyncLog wird in DB gespeichert

### Cleanup Route (`/api/cleanup`):
- ✅ Löscht nur Demo-Daten (calendarEventId = null)
- ✅ Echte Calendar-Events bleiben erhalten
- ✅ Gibt Anzahl gelöschter Einträge zurück

---

## 📊 Erwartetes Ergebnis:

Nach den 3 Schritten:
```
Schulungsliste:
┌─────────────────────────────────────────────────────┐
│ Gesamt: 1    Geplant: 1    Bestätigt: 0    Läuft: 0│
└─────────────────────────────────────────────────────┘

Tabelle:
┌────────────────────┬──────┬───────────┬────────┬───────┐
│ Titel              │ Typ  │Hersteller │ Datum  │Status │
├────────────────────┼──────┼───────────┼────────┼───────┤
│ KUKA KRC4 Grund... │Grund │ KUKA      │15.11.24│Geplant│
│ 🗓️ Aus Google Cal... │      │           │        │       │
└────────────────────┴──────┴───────────┴────────┴───────┘
```

---

## 🐛 Troubleshooting:

### Schulung erscheint immer noch nicht
→ Prüfe Debug Route: `/api/debug`
→ Schaue Vercel Logs für Fehler

### "Invalid start time" Fehler bleibt
→ Das Event im Calendar hat ungültiges Datumsformat
→ Prüfe das Event im Google Calendar

### Cleanup löscht nichts
→ Alle Schulungen haben bereits calendarEventId
→ Das ist okay, bedeutet Demo-Daten wurden schon gelöscht

---

## 📝 Console Logs:

Nach Import solltest du in Vercel Logs sehen:
```
[Calendar Sync] Starte Import...
[Calendar Sync] Zeitraum: ...
[Calendar Sync] 1 Events gefunden
[Calendar Sync] Verarbeite: KUKA KRC4 Grundlagen
[Calendar Sync] Datum: ...
[Calendar Sync] Erkannt: Hersteller=kuka, Typ=grundlagen, Dauer=5
[Calendar Sync] Erstelle neue Schulung
[Calendar Sync] ✅ Erstellt mit ID: ...
[Calendar Sync] ✅ Import abgeschlossen: 1 neu, 0 aktualisiert
```

---

**Viel Erfolg!** 🚀
