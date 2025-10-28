# 🎓 Zertifikat-System Installation

**Komplettes System basierend auf deinem Google Apps Script!**

---

## 📦 Was ist enthalten:

✅ **PDF Generierung** - Professionelle Zertifikate mit Hersteller-Branding
✅ **QR Code System** - Sichere Validierung mit SHA-256 Hash
✅ **Öffentliche Verifikation** - Jeder kann Zertifikate prüfen
✅ **GDPR-konform** - Nur notwendige Daten in Validierung
✅ **Multi-Teilnehmer** - Batch-Generierung für ganze Schulungen
✅ **Template-System** - KUKA, ABB, Mitsubishi, UR
✅ **Auto-Download** - PDFs werden direkt heruntergeladen

---

## 🚀 Installation (Schritt für Schritt):

### **Schritt 1: Dependencies installieren**

```bash
cd ~/roboterschulung-system/apps/admin

# Packages installieren
npm install pdfkit @types/pdfkit qrcode @types/qrcode canvas
```

### **Schritt 2: Environment Variables**

In `.env.local` hinzufügen:

```bash
# Zertifikat Secret (für Hash-Generierung)
CERTIFICATE_SECRET=dein-super-geheimer-key

# Public URL
NEXT_PUBLIC_APP_URL=https://robtec-admin.vercel.app
```

**WICHTIG:** Generiere sicheren Secret:
```bash
openssl rand -base64 32
```

### **Schritt 3: Dateien mit update.sh deployen**

```bash
cd ~/roboterschulung-system

# 1. Utility Functions
./update.sh certificate-utils.ts \
  apps/admin/src/lib/certificate-utils.ts \
  "Add: Zertifikat Utilities"

# 2. PDF Generator
./update.sh pdf-generator.ts \
  apps/admin/src/lib/pdf-generator.ts \
  "Add: PDF Generator für Zertifikate"

# 3. Generate API
./update.sh zertifikat-generate-api.ts \
  apps/admin/src/app/api/zertifikate/generate/route.ts \
  "Add: Zertifikat Generate API"

# 4. Verify API
./update.sh zertifikat-verify-api.ts \
  apps/admin/src/app/api/verify/[id]/route.ts \
  "Add: Zertifikat Verify API"

# 5. Generator Modal
./update.sh ZertifikatGeneratorModal.tsx \
  apps/admin/src/components/ZertifikatGeneratorModal.tsx \
  "Add: Zertifikat Generator Modal"

# 6. Verify Page
./update.sh verify-page.tsx \
  apps/admin/src/app/verify/[id]/page.tsx \
  "Add: Public Zertifikat Verification Page"
```

### **Schritt 4: Schulungsdetails Integration**

Die Schulungsdetails-Seite muss noch das Modal integrieren.
Ich bereite dir das separat vor!

---

## 🎯 Wie es funktioniert:

### **1. Zertifikat generieren:**

```
Schulungsdetails → Button "🎓 Zertifikat erstellen"
→ Modal öffnet sich
→ Teilnehmer auswählen (nur die ohne Zertifikat)
→ "Generieren" klicken
→ PDFs werden automatisch heruntergeladen!
```

### **2. QR Code scannen:**

```
Zertifikat PDF → QR Code scannen
→ Öffnet: /verify/[id]?hash=...
→ Zeigt Zertifikat-Details
→ Status: Gültig / Abgelaufen / Ungültig
```

### **3. Hash-System:**

```typescript
Hash = SHA256(schulungId + teilnehmerId + ausstellungsdatum + SECRET)
```

- **Sicher:** Ohne SECRET kann Hash nicht gefälscht werden
- **Eindeutig:** Jedes Zertifikat hat eigenen Hash
- **GDPR-konform:** Kein Name im QR Code

---

## 📄 PDF Features:

### **Design:**
- ✅ Rahmen mit Hersteller-Farben (KUKA Orange, ABB Rot, etc.)
- ✅ Große, lesbare Schrift
- ✅ Professionelles Layout
- ✅ QR Code eingebettet
- ✅ Zertifikat-Nummer
- ✅ Gültigkeitsdatum (3 Jahre)

### **Inhalt:**
- Teilnehmer Name & Firma
- Schulungstitel & Details
- Hersteller & Typ
- Zeitraum & Dauer
- Trainer & Ort
- Ausstellungsdatum
- QR Code zur Verifikation

---

## 🔐 Sicherheit:

### **Hash-Generierung:**
```typescript
SHA-256(
  schulungId +
  teilnehmerId +
  ausstellungsdatum +
  SECRET
)
```

### **Validierung:**
1. QR Code → URL mit Zertifikat-ID + Hash
2. Server prüft Hash
3. Wenn korrekt → Zertifikat gültig
4. Wenn falsch → Ungültig/Gefälscht

### **GDPR:**
- ❌ Kein Klartext-Name im QR Code
- ✅ Nur Hash + Zertifikat-ID
- ✅ Validierung zeigt nur notwendige Infos
- ✅ Keine Tracking-Daten

---

## 🧪 Testing:

### **Test 1: Zertifikat generieren**

1. Gehe zu Schulungsdetails
2. Klicke "🎓 Zertifikat erstellen"
3. Wähle Teilnehmer aus
4. Klicke "Generieren"
5. ✅ PDF wird heruntergeladen
6. ✅ In DB gespeichert

### **Test 2: QR Code scannen**

1. Öffne PDF
2. Scanne QR Code mit Handy
3. ✅ Öffnet Verify-Seite
4. ✅ Zeigt "Gültig" + Details

### **Test 3: Manipulation testen**

1. Ändere Hash in URL manuell
2. ✅ Zeigt "Ungültig"
3. Sicherheit funktioniert!

---

## 📊 Datenbank:

Das Zertifikat wird in DB gespeichert:

```typescript
{
  id: string,
  zertifikatNummer: "2025-01-0001",
  schulungId: string,
  teilnehmerId: string,
  ausstellungsdatum: Date,
  gueltigBis: Date,  // +3 Jahre
  template: "kuka-grundlagen",
  validierungsHash: "sha256...",
  status: "aktiv" | "widerrufen"
}
```

---

## 🎨 Templates:

Automatisch basierend auf Schulung:

- **KUKA Grundlagen** → Orange Design
- **KUKA Praxis** → Orange Design
- **ABB Grundlagen** → Rot Design
- **ABB Praxis** → Rot Design
- **Mitsubishi** → Rot Design
- **Universal Robots** → Blau Design
- **Sonstige** → ROBTEC Blau

---

## 🔧 Troubleshooting:

### **PDFs werden nicht generiert:**
```bash
# Canvas Package installieren
npm install canvas

# Build cache löschen
rm -rf .next
npm run build
```

### **QR Codes fehlen:**
```bash
npm install qrcode
```

### **Hash-Validierung schlägt fehl:**
- Prüfe `CERTIFICATE_SECRET` in Environment Variables
- Muss auf Server und lokal gleich sein!

---

## 📝 Environment Variables Checklist:

```bash
# .env.local (lokal)
CERTIFICATE_SECRET=xxx
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Vercel (production)
CERTIFICATE_SECRET=xxx  (gleicher Wert!)
NEXT_PUBLIC_APP_URL=https://robtec-admin.vercel.app
```

---

## 🚀 Nach Installation:

1. ✅ Dependencies installiert
2. ✅ Alle Dateien deployed
3. ✅ Environment Variables gesetzt
4. ✅ System getestet

**Dann kann los generiert werden!** 🎓

---

## 💡 Features für später:

- [ ] Zertifikat per E-Mail versenden
- [ ] Bulk-Download als ZIP
- [ ] Individuelle Templates pro Kunde
- [ ] Mehrsprachige Zertifikate
- [ ] Digitale Signatur
- [ ] Blockchain-Verifizierung (optional)

---

**Viel Erfolg! Bei Fragen einfach melden!** 🎉
