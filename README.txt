╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║         🎓 ROBTEC ZERTIFIKAT-SYSTEM v2.0.0 🎓                ║
║                                                               ║
║   Komplettes System basierend auf Google Apps Script         ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝

📦 INHALT:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ certificate-utils.ts         - Hash & Utilities
✅ pdf-generator.ts              - PDF Generierung
✅ zertifikat-generate-api.ts   - Generate API Route
✅ zertifikat-verify-api.ts     - Verify API Route
✅ ZertifikatGeneratorModal.tsx - Frontend Modal
✅ verify-page.tsx               - Public Verification

📚 DOKUMENTATION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📄 SCHNELLSTART.txt              - Quick Start Guide
📄 ZERTIFIKAT-INSTALL.md         - Vollständige Anleitung  
📄 ZERTIFIKAT-DEPENDENCIES.md    - NPM Packages
📄 INTEGRATION.txt               - Schulungsdetails Integration

🚀 SCHNELLSTART:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Dependencies installieren:
   cd ~/roboterschulung-system/apps/admin
   npm install pdfkit @types/pdfkit qrcode @types/qrcode canvas

2. Environment Variables:
   - CERTIFICATE_SECRET=<generierter-secret>
   - NEXT_PUBLIC_APP_URL=https://robtec-admin.vercel.app

3. Dateien deployen mit update.sh:
   Siehe SCHNELLSTART.txt

4. In Vercel Environment Variables eintragen!

5. Testen & Zertifikate generieren! 🎉

✨ FEATURES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ PDF Generierung mit Hersteller-Branding
✅ QR Code mit SHA-256 Hash
✅ Öffentliche Verifikation
✅ GDPR-konform
✅ Multi-Teilnehmer Batch-Generierung
✅ Template-System (KUKA, ABB, Mitsubishi, UR)
✅ Auto-Download
✅ 3 Jahre Gültigkeit
✅ Zertifikat-Nummer (YYYY-MM-XXXX)

🎯 WIE ES FUNKTIONIERT:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Schulungsdetails → "🎓 Zertifikat erstellen"
2. Teilnehmer auswählen
3. Generieren → PDFs werden heruntergeladen
4. QR Code scannen → Validierung auf /verify

🔐 SICHERHEIT:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

- SHA-256 Hash mit SECRET
- Kein Klartext-Name im QR Code
- GDPR-konforme Validierung
- Fälschungssicher

📞 SUPPORT:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Bei Fragen siehe ZERTIFIKAT-INSTALL.md

Viel Erfolg! 🚀

