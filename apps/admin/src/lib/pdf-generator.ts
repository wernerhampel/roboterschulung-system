/**
 * PDF Generator für ROBTEC Zertifikate
 * Verwendet PDFKit für serverside PDF-Generierung
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
        margins: { top: 50, bottom: 50, left: 50, right: 50 }
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

      // ROBTEC Logo Bereich (Text als Placeholder)
      doc
        .fontSize(24)
        .font('Helvetica-Bold')
        .fillColor(primaryColor)
        .text('ROBTEC GmbH', 70, 70, { align: 'left' });

      doc
        .fontSize(10)
        .font('Helvetica')
        .fillColor(textColor)
        .text('Roboterprogrammierung & Training', 70, 100, { align: 'left' });

      // Haupttitel "ZERTIFIKAT"
      doc
        .fontSize(40)
        .font('Helvetica-Bold')
        .fillColor(accentColor)
        .text('ZERTIFIKAT', 0, 150, { align: 'center', width: doc.page.width });

      // Untertitel
      doc
        .fontSize(14)
        .font('Helvetica')
        .fillColor(textColor)
        .text('Bescheinigung über erfolgreiche Teilnahme', 0, 200, { 
          align: 'center', 
          width: doc.page.width 
        });

      // Teilnehmer Name (groß und prominent)
      const fullName = `${data.teilnehmer.vorname} ${data.teilnehmer.nachname}`;
      doc
        .fontSize(28)
        .font('Helvetica-Bold')
        .fillColor(primaryColor)
        .text(fullName, 0, 250, { align: 'center', width: doc.page.width });

      // Firma (falls vorhanden)
      if (data.teilnehmer.firma) {
        doc
          .fontSize(14)
          .font('Helvetica')
          .fillColor(textColor)
          .text(data.teilnehmer.firma, 0, 290, { align: 'center', width: doc.page.width });
      }

      // Schulungsinformationen
      const yPos = data.teilnehmer.firma ? 330 : 310;
      
      doc
        .fontSize(12)
        .font('Helvetica')
        .fillColor(textColor)
        .text('hat erfolgreich an folgender Schulung teilgenommen:', 0, yPos, {
          align: 'center',
          width: doc.page.width
        });

      // Schulungstitel (hervorgehoben)
      doc
        .fontSize(18)
        .font('Helvetica-Bold')
        .fillColor(accentColor)
        .text(data.schulung.titel, 0, yPos + 40, { 
          align: 'center', 
          width: doc.page.width 
        });

      // Schulungsdetails in Box
      const boxY = yPos + 85;
      const boxHeight = 80;
      
      doc
        .roundedRect(150, boxY, doc.page.width - 300, boxHeight, 5)
        .fillAndStroke('#F5F5F5', primaryColor);

      doc
        .fontSize(11)
        .font('Helvetica')
        .fillColor(textColor)
        .text(`Hersteller: ${formatHersteller(data.schulung.hersteller)}`, 170, boxY + 15)
        .text(`Typ: ${formatTyp(data.schulung.typ)}`, 170, boxY + 35)
        .text(`Dauer: ${data.schulung.dauer} Tage`, 170, boxY + 55);

      doc
        .text(
          `Zeitraum: ${formatDate(data.schulung.startDatum)} - ${formatDate(data.schulung.endDatum)}`,
          doc.page.width / 2,
          boxY + 15,
          { width: doc.page.width / 2 - 170 }
        );

      // Zertifikatsnummer und Datum
      const footerY = doc.page.height - 120;
      
      doc
        .fontSize(10)
        .font('Helvetica')
        .fillColor(textColor)
        .text(`Zertifikat-Nr.: ${data.zertifikatNummer}`, 70, footerY, { align: 'left' })
        .text(`Ausgestellt am: ${formatDate(data.ausstellungsdatum)}`, 70, footerY + 20, { align: 'left' })
        .text(`Gültig bis: ${formatDate(data.gueltigBis)}`, 70, footerY + 40, { align: 'left' });

      // Unterschrift Bereich (rechts)
      const sigX = doc.page.width - 250;
      doc
        .moveTo(sigX, footerY + 30)
        .lineTo(sigX + 180, footerY + 30)
        .stroke(textColor);
      
      doc
        .fontSize(9)
        .text('ROBTEC GmbH', sigX, footerY + 35, { align: 'center', width: 180 })
        .text('Geschäftsführung', sigX, footerY + 48, { align: 'center', width: 180 });

      // Footer Info
      doc
        .fontSize(8)
        .fillColor('#999999')
        .text(
          'ROBTEC GmbH • Roboterprogrammierung & Training • Mainburg, Germany',
          0,
          doc.page.height - 40,
          { align: 'center', width: doc.page.width }
        );

      doc.end();

    } catch (error) {
      reject(error);
    }
  });
}

// Helper Functions
function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

function formatHersteller(hersteller: string): string {
  const map: Record<string, string> = {
    'kuka': 'KUKA',
    'abb': 'ABB',
    'mitsubishi': 'Mitsubishi',
    'universal_robots': 'Universal Robots',
    'sonstige': 'Sonstige'
  };
  return map[hersteller.toLowerCase()] || hersteller;
}

function formatTyp(typ: string): string {
  const map: Record<string, string> = {
    'grundlagen': 'Grundlagen',
    'praxis': 'Praxis Training',
    'online': 'Online Training',
    'sonstige': 'Sonstige'
  };
  return map[typ.toLowerCase()] || typ;
}
