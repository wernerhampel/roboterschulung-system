/**
 * PDF Generator für ROBTEC Zertifikate
 * Verwendet PDFKit für serverside PDF-Generierung
 * FIXED: Keine externen Font-Dependencies für Vercel
 */

import PDFDocument from 'pdfkit';

interface CertificateData {
  zertifikatNummer: string;
  teilnehmer: {
    vorname: string;
    nachname: string;
    firma: string;
  };
  schulung: {
    titel: string;
    hersteller: string;
    typ: string;
    startDatum: Date;
    endDatum: Date;
    dauer: number;
  };
  ausstellungsdatum: Date;
  gueltigBis: Date;
}

export async function generateCertificatePDF(data: CertificateData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        layout: 'landscape',
        margins: { top: 50, bottom: 50, left: 50, right: 50 },
        // WICHTIG: Keine Font-Registrierung hier!
      });

      const chunks: Buffer[] = [];
      
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Farben
      const primaryColor = '#003366';  // ROBTEC Dunkelblau
      const accentColor = '#0066CC';   // ROBTEC Hellblau
      const textColor = '#333333';

      // Header mit Rand
      doc
        .rect(20, 20, doc.page.width - 40, doc.page.height - 40)
        .lineWidth(3)
        .stroke(primaryColor);

      // Innerer Rand (dekorativ)
      doc
        .rect(30, 30, doc.page.width - 60, doc.page.height - 60)
        .lineWidth(1)
        .stroke(accentColor);

      // Logo-Bereich (Text statt Bild)
      doc
        .fontSize(32)
        .fillColor(primaryColor)
        .text('ROBTEC', 50, 60, { align: 'center' });
      
      doc
        .fontSize(12)
        .fillColor(textColor)
        .text('Roboterschulung & Training', 50, 100, { align: 'center' });

      // Titel
      doc
        .fontSize(28)
        .fillColor(primaryColor)
        .text('ZERTIFIKAT', 50, 160, { align: 'center' });

      // Zertifikatsnummer
      doc
        .fontSize(10)
        .fillColor(textColor)
        .text(`Zertifikatsnummer: ${data.zertifikatNummer}`, 50, 200, { align: 'center' });

      // Haupttext
      doc
        .fontSize(14)
        .fillColor(textColor)
        .text('Hiermit wird bestätigt, dass', 50, 250, { align: 'center' });

      // Teilnehmer Name
      doc
        .fontSize(24)
        .fillColor(primaryColor)
        .text(`${data.teilnehmer.vorname} ${data.teilnehmer.nachname}`, 50, 280, { align: 'center' });

      // Firma (falls vorhanden)
      if (data.teilnehmer.firma) {
        doc
          .fontSize(14)
          .fillColor(textColor)
          .text(data.teilnehmer.firma, 50, 315, { align: 'center' });
      }

      // Teilnahmetext
      doc
        .fontSize(14)
        .fillColor(textColor)
        .text('erfolgreich an der Schulung', 50, 350, { align: 'center' });

      // Schulungsdetails
      doc
        .fontSize(18)
        .fillColor(primaryColor)
        .text(data.schulung.titel, 50, 380, { align: 'center' });

      doc
        .fontSize(12)
        .fillColor(textColor)
        .text(`${data.schulung.hersteller} - ${data.schulung.typ}`, 50, 410, { align: 'center' });

      // Datum und Dauer
      const startStr = data.schulung.startDatum.toLocaleDateString('de-DE');
      const endStr = data.schulung.endDatum.toLocaleDateString('de-DE');
      
      doc
        .fontSize(12)
        .fillColor(textColor)
        .text(`vom ${startStr} bis ${endStr}`, 50, 440, { align: 'center' })
        .text(`(${data.schulung.dauer} Tage)`, 50, 460, { align: 'center' });

      // Teilnahme bestätigung
      doc
        .fontSize(12)
        .fillColor(textColor)
        .text('teilgenommen hat.', 50, 490, { align: 'center' });

      // Footer mit Ausstellungsdatum und Gültigkeit
      const ausstellungStr = data.ausstellungsdatum.toLocaleDateString('de-DE');
      const gueltigStr = data.gueltigBis.toLocaleDateString('de-DE');

      // Signatur-Bereich
      doc
        .moveTo(100, 540)
        .lineTo(250, 540)
        .stroke(textColor);

      doc
        .moveTo(doc.page.width - 250, 540)
        .lineTo(doc.page.width - 100, 540)
        .stroke(textColor);

      doc
        .fontSize(10)
        .fillColor(textColor)
        .text('Ort, Datum', 100, 545, { width: 150, align: 'center' })
        .text('Unterschrift', doc.page.width - 250, 545, { width: 150, align: 'center' });

      // Ausstellungsdatum und Gültigkeit unten
      doc
        .fontSize(8)
        .fillColor(textColor)
        .text(`Ausgestellt am: ${ausstellungStr}`, 50, doc.page.height - 80, { align: 'left' })
        .text(`Gültig bis: ${gueltigStr}`, 50, doc.page.height - 65, { align: 'left' });

      // QR-Code Platzhalter (rechts unten)
      doc
        .rect(doc.page.width - 150, doc.page.height - 150, 100, 100)
        .stroke(textColor);
      
      doc
        .fontSize(8)
        .text('QR-Code', doc.page.width - 150, doc.page.height - 50, { 
          width: 100, 
          align: 'center' 
        });

      // Copyright
      doc
        .fontSize(8)
        .fillColor(textColor)
        .text('© 2025 ROBTEC GmbH - www.robtec.de', 50, doc.page.height - 40, { 
          align: 'center',
          width: doc.page.width - 100
        });

      // PDF beenden
      doc.end();

    } catch (error) {
      console.error('PDF Generation Error:', error);
      reject(error);
    }
  });
}
