/**
 * PDF Generator für ROBTEC Zertifikate
 * Verwendet PDFKit für serverside PDF-Generierung
 * FIXED: Keine externen Font-Files benötigt
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
      // WICHTIG: autoFirstPage: false verhindert Font-Probleme
      const doc = new PDFDocument({
        size: 'A4',
        layout: 'landscape',
        margins: { top: 50, bottom: 50, left: 50, right: 50 },
        autoFirstPage: false
      });

      // Seite manuell hinzufügen
      doc.addPage();

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
        .strokeColor(primaryColor)
        .stroke();

      // Innerer Rand
      doc
        .rect(30, 30, doc.page.width - 60, doc.page.height - 60)
        .lineWidth(1)
        .strokeColor(accentColor)
        .stroke();

      // Logo-Bereich (Text statt Bild)
      doc
        .fontSize(36)
        .fillColor(primaryColor)
        .text('ROBTEC', 0, 60, { align: 'center' });
      
      doc
        .fontSize(12)
        .fillColor(textColor)
        .text('Roboterschulung & Automation', 0, 100, { align: 'center' });

      // Titel
      doc
        .fontSize(28)
        .fillColor(primaryColor)
        .text('ZERTIFIKAT', 0, 150, { align: 'center' });

      // Trennlinie
      doc
        .moveTo(200, 190)
        .lineTo(doc.page.width - 200, 190)
        .lineWidth(2)
        .strokeColor(accentColor)
        .stroke();

      // Teilnehmer
      doc
        .fontSize(14)
        .fillColor(textColor)
        .text('Hiermit wird bestätigt, dass', 0, 220, { align: 'center' });

      doc
        .fontSize(24)
        .fillColor(primaryColor)
        .text(`${data.teilnehmer.vorname} ${data.teilnehmer.nachname}`, 0, 250, { align: 'center' });

      if (data.teilnehmer.firma) {
        doc
          .fontSize(16)
          .fillColor(textColor)
          .text(data.teilnehmer.firma, 0, 280, { align: 'center' });
      }

      // Schulung
      doc
        .fontSize(14)
        .fillColor(textColor)
        .text('erfolgreich an der Schulung', 0, 320, { align: 'center' });

      doc
        .fontSize(20)
        .fillColor(primaryColor)
        .text(data.schulung.titel, 0, 350, { align: 'center' });

      doc
        .fontSize(16)
        .fillColor(textColor)
        .text(`${data.schulung.hersteller} - ${data.schulung.typ}`, 0, 380, { align: 'center' });

      // Datum
      const startDate = new Date(data.schulung.startDatum).toLocaleDateString('de-DE');
      const endDate = new Date(data.schulung.endDatum).toLocaleDateString('de-DE');
      
      doc
        .fontSize(14)
        .fillColor(textColor)
        .text(`vom ${startDate} bis ${endDate}`, 0, 420, { align: 'center' });

      doc
        .text(`(${data.schulung.dauer} Tage)`, 0, 440, { align: 'center' });

      // Teilnahme-Text
      doc
        .fontSize(14)
        .text('teilgenommen hat.', 0, 470, { align: 'center' });

      // Footer-Bereich
      const footerY = doc.page.height - 120;

      // Zertifikatsnummer links
      doc
        .fontSize(10)
        .fillColor(textColor)
        .text(`Zertifikat-Nr: ${data.zertifikatNummer}`, 50, footerY);

      doc
        .text(`Ausgestellt: ${new Date(data.ausstellungsdatum).toLocaleDateString('de-DE')}`, 50, footerY + 15);

      doc
        .text(`Gültig bis: ${new Date(data.gueltigBis).toLocaleDateString('de-DE')}`, 50, footerY + 30);

      // Unterschrift-Bereich rechts
      doc
        .moveTo(doc.page.width - 250, footerY)
        .lineTo(doc.page.width - 50, footerY)
        .lineWidth(1)
        .strokeColor(textColor)
        .stroke();

      doc
        .fontSize(10)
        .text('Schulungsleiter', doc.page.width - 250, footerY + 5, {
          width: 200,
          align: 'center'
        });

      // QR-Code Platzhalter (Text statt tatsächlichem QR-Code)
      const qrX = (doc.page.width - 100) / 2;
      const qrY = footerY - 20;
      
      doc
        .rect(qrX, qrY, 100, 20)
        .lineWidth(1)
        .strokeColor(textColor)
        .stroke();
      
      doc
        .fontSize(8)
        .fillColor(textColor)
        .text('[QR-Code Validierung]', qrX, qrY + 6, {
          width: 100,
          align: 'center'
        });

      // Dokument beenden
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}
