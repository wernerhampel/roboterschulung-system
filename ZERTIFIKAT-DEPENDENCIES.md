# Zusätzliche Dependencies für Zertifikat-System

## Installation:

```bash
cd ~/roboterschulung-system/apps/admin

# PDF Generation
npm install pdfkit @types/pdfkit

# QR Code Generation  
npm install qrcode @types/qrcode

# Canvas Support (für QR Codes)
npm install canvas
```

## Packages:

- **pdfkit** (^0.14.0) - PDF Generierung
- **@types/pdfkit** (^0.13.0) - TypeScript Types
- **qrcode** (^1.5.3) - QR Code Generator
- **@types/qrcode** (^1.5.5) - TypeScript Types
- **canvas** (^2.11.2) - Canvas Support für Node.js

## In package.json eintragen:

```json
{
  "dependencies": {
    "pdfkit": "^0.14.0",
    "qrcode": "^1.5.3",
    "canvas": "^2.11.2"
  },
  "devDependencies": {
    "@types/pdfkit": "^0.13.0",
    "@types/qrcode": "^1.5.5"
  }
}
```

## Nach Installation:

```bash
npm install
```

## Environment Variable hinzufügen:

In `.env` oder `.env.local`:

```bash
# Zertifikat Secret (für Hash-Generierung)
CERTIFICATE_SECRET=your-super-secret-key-change-in-production

# Public URL (für QR Code Links)
NEXT_PUBLIC_APP_URL=https://robtec-admin.vercel.app
```

**WICHTIG:** `CERTIFICATE_SECRET` sollte ein langer, zufälliger String sein!

Generiere mit:
```bash
openssl rand -base64 32
```
