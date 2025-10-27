# 🔍 Debug Route v1.3.4

## Problem:
Calendar Sync sagt "1 importiert" aber Schulungsliste zeigt nichts.

## Lösung:
Debug-Route die uns zeigt was wirklich in der Datenbank ist.

---

## Installation:

```bash
cd ~/roboterschulung-system
tar -xzf ~/Downloads/debug-route.tar.gz
git add . && git commit -m "Debug: DB Inspect Route" && git push
```

---

## Verwendung:

Nach dem Deployment öffne in deinem Browser:
```
https://robtec-admin.vercel.app/api/debug
```

Das zeigt dir:
- ✅ Anzahl Schulungen in der DB
- ✅ Alle Schulungen mit Details
- ✅ Letzte 5 Sync Logs
- ✅ Timestamps

---

## Was du sehen solltest:

```json
{
  "success": true,
  "anzahlSchulungen": 1,
  "schulungen": [
    {
      "id": "...",
      "titel": "KUKA KRC4 Grundlagen",
      "typ": "grundlagen",
      "hersteller": "kuka",
      "startDatum": "2024-11-15T00:00:00.000Z",
      "status": "geplant",
      "calendarEventId": "...",
      "createdAt": "2024-10-27T..."
    }
  ],
  "letzteSync": [...]
}
```

---

## Troubleshooting:

### anzahlSchulungen: 0
→ Import hat nicht funktioniert oder Schulung wurde gelöscht
→ Gehe zu /sync und importiere nochmal

### schulungen: []
→ API kann Schulungen nicht lesen
→ Prüfe Datenbankverbindung

### Error in Response
→ Schaue in Vercel Logs nach Details

---

Nach dem Test können wir gezielt das Problem fixen!
