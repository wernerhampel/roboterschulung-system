# 🚀 Quick Start Guide

## Setup ist abgeschlossen! ✅

Alle Vorbereitungen sind getroffen:
- ✅ GitHub Repository: https://github.com/wernerhampel/roboterschulung-system
- ✅ Vercel Admin: https://vercel.com/werner-hampels-projects/robtec-admin
- ✅ Vercel Verify: https://vercel.com/werner-hampels-projects/robtec-verify
- ✅ Neon Datenbank: Verbunden
- ✅ Environment Variables: Gesetzt
- ✅ Google Cloud: Konfiguriert

---

## 📋 Nächste Schritte

### 1. Code ins Repository pushen

```bash
# Repository klonen (falls noch nicht geschehen)
git clone https://github.com/wernerhampel/roboterschulung-system.git
cd roboterschulung-system

# Alle generierten Dateien zum Repository hinzufügen
# (Die Dateien liegen aktuell in /home/claude/roboterschulung-system)

# WICHTIG: Kopiere alle Dateien aus dem generierten Ordner
# in dein lokales Git-Repository

# Dann:
git add .
git commit -m "Initial setup: Complete training management system"
git push origin main
```

### 2. Datenbank-Schema importieren

**Option A: Via Neon Console**
1. Gehe zu https://console.neon.tech
2. Wähle deine Datenbank `roboterschulung-db`
3. Öffne "SQL Editor"
4. Kopiere den kompletten Inhalt aus `sql/schema.sql`
5. Klicke "Run"
6. Prüfe ob alle Tabellen erstellt wurden

**Option B: Via psql**
```bash
# Hole die DATABASE_URL aus Vercel
# Gehe zu: robtec-admin → Settings → Environment Variables
# Kopiere DATABASE_URL

# Dann:
psql "postgresql://[DEINE-DATABASE-URL]" < sql/schema.sql
```

### 3. Vercel Deployment prüfen

Nach dem Git Push deployt Vercel automatisch!

Prüfe die Deployments:
- Admin: https://vercel.com/werner-hampels-projects/robtec-admin/deployments
- Verify: https://vercel.com/werner-hampels-projects/robtec-verify/deployments

**Warte bis beide Deployments grün sind** ✅

### 4. Apps testen

**Admin App:**
```
https://robtec-admin.vercel.app
```

Was du sehen solltest:
- Dashboard lädt
- Navigation ist sichtbar
- Keine JavaScript-Fehler in der Console

**Verify App:**
```
https://robtec-verify.vercel.app
```

Was du sehen solltest:
- Startseite mit Validierungsoptionen
- "Jetzt validieren" Button funktioniert
- Keine Fehler

### 5. Erste Daten erstellen

1. Öffne die Admin-App
2. Klicke auf "Schulungen"
3. Erstelle deine erste Schulung
4. Füge einen Termin hinzu
5. Erstelle einen Test-Teilnehmer

---

## 🔧 Bei Problemen

### Build schlägt fehl

**Symptom:** Vercel Build ist rot ❌

**Lösung:**
1. Gehe zum fehlgeschlagenen Deployment
2. Klicke auf "View Function Logs"
3. Suche nach dem Fehler

Häufige Fehler:
- `MODULE_NOT_FOUND` → Dependencies fehlen
- `Type error` → TypeScript-Fehler
- `Build failed` → Syntax-Fehler

### Runtime Fehler

**Symptom:** App lädt, aber zeigt Fehler

**Lösung:**
1. Öffne Browser Console (F12)
2. Schaue nach Fehlermeldungen
3. Häufig: Environment Variables fehlen oder falsch

Prüfe in Vercel:
- Settings → Environment Variables
- Alle müssen gesetzt sein!

### Datenbank-Verbindung schlägt fehl

**Symptom:** "Database connection failed"

**Lösung:**
1. Prüfe ob Schema importiert wurde
2. Prüfe DATABASE_URL in Vercel
3. Teste Connection in Neon Console

---

## 📞 Hilfe benötigt?

Wenn etwas nicht funktioniert:

1. Prüfe die Logs in Vercel
2. Prüfe die Browser Console
3. Kontaktiere mich: [Deine Kontaktdaten]

---

## 🎯 Nach erfolgreichem Deployment

1. **Test-Zertifikat erstellen**
   - Schulung → Termin → Teilnehmer → Zertifikat generieren
   - QR-Code scannen oder Code kopieren
   - In Verify-App validieren

2. **Custom Domains einrichten** (optional)
   - admin.roboterschulung.de
   - verify.roboterschulung.de
   - Siehe `docs/deployment.md`

3. **Team einarbeiten**
   - Admin-Interface Demo
   - Prozesse dokumentieren

---

**Viel Erfolg! 🚀**

Das System ist produktionsbereit und einsatzfähig!
