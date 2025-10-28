import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';
import { CertificateData } from './certificate-utils';

/**
 * Generiert ein Zertifikat als PDF
 */
export async function generateCertificatePDF(data: CertificateData): Promise<Buffer> {
  return new Promise(async (resolve, reject) => {
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

      // Farben basierend auf Hersteller
      const colors = getHerstellerColors(data.hersteller);

      // Header mit Rahmen
      drawBorder(doc, colors.primary);

      // Logo-Bereich (optional - hier Platzhalter)
      doc.fontSize(24)
        .fillColor(colors.primary)
        .font('Helvetica-Bold')
        .text('ROBTEC GmbH', 50, 60, { align: 'left' });

      doc.fontSize(10)
        .fillColor('#666666')
        .font('Helvetica')
        .text('Schulungszentrum für Roboterprogrammierung', 50, 90);

      // Zertifikat-Nummer (rechts oben)
      doc.fontSize(10)
        .fillColor('#666666')
        .text(`Zertifikat-Nr.: ${data.zertifikatNummer}`, 50, 60, { align: 'right' });

      // Titel "ZERTIFIKAT" - zentriert und groß
      doc.fontSize(40)
        .fillColor(colors.primary)
        .font('Helvetica-Bold')
        .text('ZERTIFIKAT', 0, 150, { align: 'center', width: doc.page.width });

      // Untertitel
      doc.fontSize(16)
        .fillColor('#333333')
        .font('Helvetica')
        .text('über die erfolgreiche Teilnahme', 0, 200, { align: 'center', width: doc.page.width });

      // Teilnehmer Name - hervorgehoben
      doc.fontSize(28)
        .fillColor(colors.accent)
        .font('Helvetica-Bold')
        .text(data.teilnehmerName, 0, 240, { align: 'center', width: doc.page.width });

      // Firma (wenn vorhanden)
      if (data.firma) {
        doc.fontSize(14)
          .fillColor('#666666')
          .font('Helvetica-Oblique')
          .text(data.firma, 0, 275, { align: 'center', width: doc.page.width });
      }

      // "hat erfolgreich teilgenommen an"
      const yAfterFirma = data.firma ? 310 : 285;
      doc.fontSize(14)
        .fillColor('#333333')
        .font('Helvetica')
        .text('hat erfolgreich teilgenommen an der Schulung', 0, yAfterFirma, { 
          align: 'center', 
          width: doc.page.width 
        });

      // Schulungstitel - hervorgehoben
      doc.fontSize(20)
        .fillColor(colors.primary)
        .font('Helvetica-Bold')
        .text(data.schulungTitel, 0, yAfterFirma + 35, { 
          align: 'center', 
          width: doc.page.width 
        });

      // Schulungsdetails in Box
      const boxY = yAfterFirma + 75;
      const boxHeight = 80;
      
      // Box mit Hintergrund
      doc.rect(150, boxY, doc.page.width - 300, boxHeight)
        .fillAndStroke(colors.lightBg, colors.primary);

      // Details in Box
      const detailsY = boxY + 15;
      const col1X = 180;
      const col2X = 450;

      doc.fontSize(11)
        .fillColor('#333333')
        .font('Helvetica-Bold');

      // Spalte 1
      doc.text('Hersteller:', col1X, detailsY);
      doc.text('Typ:', col1X, detailsY + 20);
      doc.text('Zeitraum:', col1X, detailsY + 40);

      doc.font('Helvetica');
      doc.text(data.hersteller, col1X + 80, detailsY);
      doc.text(data.schulungTyp, col1X + 80, detailsY + 20);
      doc.text(`${data.startDatum} - ${data.endDatum}`, col1X + 80, detailsY + 40);

      // Spalte 2
      doc.font('Helvetica-Bold');
      doc.text('Dauer:', col2X, detailsY);
      if (data.ort) {
        doc.text('Ort:', col2X, detailsY + 20);
      }
      if (data.trainer) {
        doc.text('Trainer:', col2X, detailsY + 40);
      }

      doc.font('Helvetica');
      doc.text(`${data.dauer} Tag${data.dauer !== 1 ? 'e' : ''}`, col2X + 80, detailsY);
      if (data.ort) {
        doc.text(data.ort, col2X + 80, detailsY + 20);
      }
      if (data.trainer) {
        doc.text(data.trainer, col2X + 80, detailsY + 40);
      }

      // QR-Code generieren
      const qrCodeDataURL = await QRCode.toDataURL(data.qrCodeURL, {
        width: 120,
        margin: 1,
        color: {
          dark: colors.primary,
          light: '#FFFFFF'
        }
      });

      // QR-Code einfügen (rechts unten)
      const qrSize = 100;
      const qrX = doc.page.width - qrSize - 70;
      const qrY = doc.page.height - qrSize - 90;

      doc.image(qrCodeDataURL, qrX, qrY, { width: qrSize, height: qrSize });

      // QR-Code Text
      doc.fontSize(8)
        .fillColor('#666666')
        .font('Helvetica')
        .text('Scan zum Verifizieren', qrX - 10, qrY + qrSize + 5, { 
          width: qrSize + 20, 
          align: 'center' 
        });

      // Ausstellungsdatum und Gültigkeit (links unten)
      const footerY = doc.page.height - 90;
      doc.fontSize(10)
        .fillColor('#333333')
        .font('Helvetica-Bold')
        .text('Ausgestellt am:', 70, footerY);
      
      doc.font('Helvetica')
        .text(data.ausstellungsdatum, 70, footerY + 15);

      doc.font('Helvetica-Bold')
        .text('Gültig bis:', 70, footerY + 35);
      
      doc.font('Helvetica')
        .text(data.gueltigBis, 70, footerY + 50);

      // Unterschrift-Bereich (mittig unten)
      const sigY = doc.page.height - 100;
      const sigX = doc.page.width / 2 - 100;

      doc.moveTo(sigX, sigY)
        .lineTo(sigX + 200, sigY)
        .stroke(colors.primary);

      doc.fontSize(9)
        .fillColor('#666666')
        .font('Helvetica')
        .text('Geschäftsführung ROBTEC GmbH', sigX, sigY + 10, {
          width: 200,
          align: 'center'
        });

      // Finalize PDF
      doc.end();

    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Rahmen um das Zertifikat zeichnen
 */
function drawBorder(doc: PDFKit.PDFDocument, color: string) {
  const margin = 40;
  doc.rect(margin, margin, doc.page.width - (margin * 2), doc.page.height - (margin * 2))
    .lineWidth(3)
    .stroke(color);
  
  // Innerer Rahmen
  doc.rect(margin + 5, margin + 5, doc.page.width - (margin * 2) - 10, doc.page.height - (margin * 2) - 10)
    .lineWidth(1)
    .stroke(color);
}

/**
 * Farbschema basierend auf Hersteller
 */
function getHerstellerColors(hersteller: string): {
  primary: string;
  accent: string;
  lightBg: string;
} {
  const schemes: Record<string, any> = {
    'KUKA': {
      primary: '#FF6600',  // KUKA Orange
      accent: '#333333',
      lightBg: '#FFF5E6'
    },
    'ABB': {
      primary: '#FF0000',  // ABB Rot
      accent: '#333333',
      lightBg: '#FFE6E6'
    },
    'Mitsubishi': {
      primary: '#CC0000',  // Mitsubishi Rot
      accent: '#333333',
      lightBg: '#FFE6E6'
    },
    'Universal Robots': {
      primary: '#0066CC',  // UR Blau
      accent: '#333333',
      lightBg: '#E6F2FF'
    }
  };

  return schemes[hersteller] || {
    primary: '#2563EB',  // ROBTEC Blau
    accent: '#333333',
    lightBg: '#EFF6FF'
  };
}

/**
 * Generiert Zertifikat und gibt Base64 zurück
 */
export async function generateCertificateBase64(data: CertificateData): Promise<string> {
  const pdfBuffer = await generateCertificatePDF(data);
  return pdfBuffer.toString('base64');
}
