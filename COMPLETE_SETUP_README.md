# 🎯 KOMPLETTES Prisma Setup v1.3.3

## Was dieses Paket enthält:

✅ **prisma/schema.prisma** - Komplettes Datenbankschema
✅ **src/lib/prisma.ts** - Prisma Client Singleton
✅ **package.json** - Dependencies für Prisma
✅ **.env.example** - Umgebungsvariablen Template

---

## 📦 Installation:

```bash
cd ~/roboterschulung-system
tar -xzf ~/Downloads/prisma-full-setup.tar.gz
git add .
git commit -m "Setup: Komplettes Prisma mit Schema"
git push
```

---

## 📋 Datenbankschema Übersicht:

### Haupttabellen:
- **Schulung** - Schulungen & Kurse
- **Teilnehmer** - Teilnehmerdaten
- **Anmeldung** - Schulungsanmeldungen
- **Termin** - Einzelne Termine
- **Zertifikat** - Ausgestellte Zertifikate
- **SyncLog** - Google Calendar Sync Logs

### Enums:
- SchulungsTyp: grundlagen, praxis, online, sonstige
- Hersteller: kuka, abb, mitsubishi, universal_robots, sonstige
- SchulungsStatus: geplant, bestaetigt, laufend, abgeschlossen, abgesagt
- AnmeldungsStatus: angemeldet, bestaetigt, teilgenommen, nicht_erschienen, storniert
- BezahlStatus: offen, bezahlt, erstattet

---

## 🔧 Nach dem Deployment:

Vercel wird automatisch:
1. ✅ `npm install` - Installiert @prisma/client
2. ✅ `prisma generate` - Generiert Prisma Client
3. ✅ Build läuft durch

---

## 🧪 Schema Features:

### Google Calendar Integration
```prisma
calendarEventId   String?      @unique
lastSyncedAt      DateTime?
```

### Zertifikate mit QR-Code Validierung
```prisma
qrCode            String       @unique
validierungsUrl   String
```

### Soft Deletes & Timestamps
```prisma
createdAt         DateTime     @default(now())
updatedAt         DateTime     @updatedAt
```

### Optimierte Indizes
- ✅ startDatum für schnelle Datumssuchen
- ✅ status für Filterung
- ✅ calendarEventId für Sync
- ✅ email für Teilnehmersuche

---

## 🔐 Umgebungsvariablen:

In Vercel müssen folgende Variablen gesetzt sein:

```env
DATABASE_URL="postgresql://..."
GOOGLE_SERVICE_ACCOUNT_JSON="..."
GOOGLE_CALENDAR_ID="..."
```

Prüfe unter: https://vercel.com/projekt/settings/environment-variables

---

## 🎯 Dann Schulungsliste deployen:

Nach diesem Setup:
```bash
cd ~/roboterschulung-system
tar -xzf ~/Downloads/schulungsliste-v1.3.0.tar.gz
git add .
git commit -m "v1.3.0: Schulungsliste"
git push
```

---

## 📊 Datenbankstruktur:

```
Schulung (1) ──┬── (*) Anmeldung
               ├── (*) Termin
               └── (*) Zertifikat
               
Teilnehmer (1) ─┬── (*) Anmeldung
                └── (*) Zertifikat
                
SyncLog - Standalone Logging Tabelle
```

---

## 🔍 Troubleshooting:

### "Prisma Schema not found"
→ Dieser Fix löst das Problem! ✅

### "Environment variable not found: DATABASE_URL"
→ Setze in Vercel Environment Variables

### "Table does not exist"
→ Führe Migration aus:
```bash
npx prisma db push
```

### Build Error nach Schema-Änderung
→ Regeneriere Client:
```bash
npx prisma generate
```

---

## 📚 Nützliche Prisma Befehle:

```bash
# Client neu generieren
npx prisma generate

# Schema zur DB pushen (Development)
npx prisma db push

# Prisma Studio öffnen (GUI)
npx prisma studio

# Migration erstellen (Production)
npx prisma migrate dev --name init
```

---

## ✅ Success Checklist:

Nach erfolgreichem Deployment solltest du sehen:

1. ✅ Build completed successfully
2. ✅ Keine Prisma Fehler im Log
3. ✅ `/api/schulungen` funktioniert
4. ✅ `/schulungen` Seite lädt

---

**Jetzt sollte ALLES funktionieren!** 🎉
