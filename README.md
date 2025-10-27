# ROBTEC Training Management System

Ein modernes Schulungsverwaltungssystem für ROBTEC GmbH mit Zertifikatsgenerierung und -validierung.

## 🏗️ Architektur

Das Projekt ist als Monorepo organisiert mit zwei Next.js-Anwendungen:

- **Admin App** (`/apps/admin`): Verwaltung von Schulungen, Terminen, Teilnehmern und Zertifikaten
- **Verify App** (`/apps/verify`): Öffentliche Zertifikatsvalidierung via QR-Code

## 🚀 Tech Stack

- **Frontend & Backend:** Next.js 14 mit App Router
- **Sprache:** TypeScript
- **Datenbank:** Neon PostgreSQL (Serverless)
- **Styling:** Tailwind CSS
- **APIs:** Google Calendar, Google Drive, Google Slides
- **Deployment:** Vercel
- **Sicherheit:** SHA-256 Hashing für Zertifikatsvalidierung

## 📦 Projektstruktur

```
roboterschulung-system/
├── apps/
│   ├── admin/              # Admin-Interface
│   │   ├── src/
│   │   │   ├── app/       # Next.js App Router
│   │   │   ├── lib/       # Utilities (DB, Google APIs, etc.)
│   │   │   └── components/ # React Components
│   │   ├── package.json
│   │   └── next.config.js
│   │
│   └── verify/            # Zertifikats-Validierung
│       ├── src/
│       │   ├── app/       # Next.js App Router
│       │   └── lib/       # DB Utilities
│       ├── package.json
│       └── next.config.js
│
├── sql/
│   └── schema.sql         # PostgreSQL Schema
│
├── docs/
│   └── deployment.md      # Deployment-Anleitung
│
└── package.json           # Root Monorepo Config
```

## 🔧 Lokale Entwicklung

### Voraussetzungen

- Node.js 18+
- npm 9+
- PostgreSQL Zugang (Neon)
- Google Cloud Service Account

### Setup

1. **Repository klonen:**
```bash
git clone https://github.com/wernerhampel/roboterschulung-system.git
cd roboterschulung-system
```

2. **Dependencies installieren:**
```bash
npm install
```

3. **Environment Variables setzen:**

Erstelle `.env.local` in `apps/admin/`:
```env
# Database (von Vercel automatisch gesetzt)
DATABASE_URL=

# Google APIs
GOOGLE_SERVICE_ACCOUNT_EMAIL=roboterschulung-service@roboterschulung.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY=
GOOGLE_CALENDAR_ID=c_409d40ef7bf2589c7c7b3b90febc164a340d4cbbe8b638b58061fdcdfb199be0@group.calendar.google.com
GOOGLE_DRIVE_FOLDER_ID=1-BtFiHgweRXeTaSu0s84CEIADtXFoS4E

# Auth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=
ALLOWED_EMAIL=hampel@robtec.de

# App
NODE_ENV=development
```

Erstelle `.env.local` in `apps/verify/`:
```env
# Database
DATABASE_URL=

# App
NODE_ENV=development
NEXT_PUBLIC_SITE_URL=http://localhost:3001
```

4. **Datenbank-Schema importieren:**

Verbinde dich mit deiner Neon-Datenbank und führe aus:
```bash
psql "postgresql://..." < sql/schema.sql
```

5. **Development Server starten:**

```bash
# Admin App (Port 3000)
npm run dev:admin

# Verify App (Port 3001)
npm run dev:verify
```

## 🌐 Deployment

### Vercel Setup

Beide Apps sind bereits mit Vercel verbunden:

- **Admin:** https://vercel.com/werner-hampels-projects/robtec-admin
- **Verify:** https://vercel.com/werner-hampels-projects/robtec-verify

### Deployment-Prozess

1. **Code in GitHub pushen:**
```bash
git add .
git commit -m "Initial setup"
git push origin main
```

2. **Vercel deployt automatisch** beide Apps aus dem `main` Branch.

3. **Build Settings in Vercel:**

Für Admin (`robtec-admin`):
- **Root Directory:** `apps/admin`
- **Build Command:** `npm run build`
- **Output Directory:** `.next`

Für Verify (`robtec-verify`):
- **Root Directory:** `apps/verify`
- **Build Command:** `npm run build`
- **Output Directory:** `.next`

### Environment Variables

Alle erforderlichen Environment Variables sind bereits in Vercel gesetzt. Bei Änderungen:

1. Gehe zu Project Settings → Environment Variables
2. Füge/ändere die Variable
3. Redeploy das Projekt

## 📊 Features

### Admin Interface

- ✅ Dashboard mit Übersicht
- ✅ Schulungsverwaltung (CRUD)
- ✅ Terminplanung mit Google Calendar Sync
- ✅ Teilnehmerverwaltung
- ✅ Anmeldungen verwalten
- ✅ Zertifikate generieren (Google Slides)
- ✅ QR-Code Generierung für Validierung
- ✅ Berichte und Statistiken

### Verify Interface

- ✅ QR-Code Scanner
- ✅ Manuelle Code-Eingabe
- ✅ Echtzeit-Validierung
- ✅ Detaillierte Zertifikatsinfo
- ✅ Validierungs-Logging
- ✅ Print-Funktion

## 🔒 Sicherheit

- SHA-256 Hashing für Zertifikatsvalidierung
- HTTPS-Only in Production
- Environment Variables für sensible Daten
- Service Account für Google APIs
- Rate Limiting für Validierungs-Endpunkt (geplant)
- Audit Log für alle Änderungen

## 📝 Datenbank-Schema

Das vollständige Schema findest du in `sql/schema.sql`.

Haupttabellen:
- `schulungen` - Schulungskatalog
- `termine` - Konkrete Termine
- `teilnehmer` - Teilnehmerstammdaten
- `anmeldungen` - Anmeldungen zu Terminen
- `zertifikate` - Ausgestellte Zertifikate
- `validierungen` - Log aller Validierungen
- `audit_log` - System-Audit-Log

## 🤝 Kontakt

**ROBTEC GmbH**
- Email: hampel@robtec.de
- Web: https://robtec.de

## 📄 Lizenz

Proprietary - Alle Rechte vorbehalten © 2025 ROBTEC GmbH
