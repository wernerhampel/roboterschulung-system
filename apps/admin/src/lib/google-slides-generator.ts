/**
 * Google Slides Certificate Generator für ROBTEC
 * Basiert auf der existierenden Google Apps Script Lösung
 */

import { google } from 'googleapis';

interface CertificateData {
  zertifikatNummer: string;
  teilnehmer: {
    vorname: string;
    nachname: string;
    firma: string;
    email: string;
  };
  schulung: {
    titel: string;
    hersteller: string;
    typ: string;
    startDatum: Date;
    endDatum: Date;
    dauer: number;
    trainer?: string;
    ort?: string;
  };
  ausstellungsdatum: Date;
  gueltigBis: Date;
}

// Template IDs (aus der code.gs)
const CERTIFICATE_TEMPLATES: Record<string, string> = {
  'Grundlagen': '1rxSaWl9ZYXC0jTVySCjkwQkgwkFQvO-vif86vZKnAyo',
  'Fortgeschritten': '', // TODO: Template ID eintragen
  'Wartung': '', // TODO: Template ID eintragen
  'Individualschulung': '' // TODO: Template ID eintragen
};

// Zertifikate Ordner in Google Drive
const CERTIFICATE_FOLDER_ID = '1-BtFiHgweRXeTaSu0s84CEIADtXFoS4E';

export async function generateCertificateWithGoogleSlides(data: CertificateData): Promise<Buffer> {
  try {
    // Google Auth Setup (nutzt Service Account)
    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(
        Buffer.from(process.env.GOOGLE_SERVICE_ACCOUNT_JSON || '', 'base64').toString()
      ),
      scopes: [
        'https://www.googleapis.com/auth/drive',
        'https://www.googleapis.com/auth/presentations'
      ]
    });

    const authClient = await auth.getClient();
    const drive = google.drive({ version: 'v3', auth: authClient as any });
    const slides = google.slides({ version: 'v1', auth: authClient as any });

    // Template auswählen basierend auf Schulungstyp
    let templateId = CERTIFICATE_TEMPLATES[data.schulung.typ] || CERTIFICATE_TEMPLATES['Grundlagen'];
    
    if (!templateId) {
      throw new Error('Kein Zertifikats-Template konfiguriert');
    }

    // 1. Template kopieren
    console.log('📄 Kopiere Google Slides Template...');
    const copyResponse = await drive.files.copy({
      fileId: templateId,
      requestBody: {
        name: `Zertifikat_${data.teilnehmer.vorname}_${data.teilnehmer.nachname}_${Date.now()}`,
        parents: [CERTIFICATE_FOLDER_ID]
      }
    });

    const presentationId = copyResponse.data.id;
    if (!presentationId) {
      throw new Error('Konnte Template nicht kopieren');
    }

    // 2. Platzhalter definieren
    const replacements = {
      '{{TEILNEHMER_NAME}}': `${data.teilnehmer.vorname} ${data.teilnehmer.nachname}`,
      '{{TEILNEHMER_FIRMA}}': data.teilnehmer.firma || '',
      '{{KURS_NAME}}': data.schulung.titel,
      '{{CONTROLLER}}': data.schulung.hersteller,
      '{{KURS_TYP}}': data.schulung.typ,
      '{{START_DATUM}}': data.schulung.startDatum.toLocaleDateString('de-DE'),
      '{{END_DATUM}}': data.schulung.endDatum.toLocaleDateString('de-DE'),
      '{{DAUER}}': `${data.schulung.dauer} Tage`,
      '{{TRAINER}}': data.schulung.trainer || 'ROBTEC Team',
      '{{ORT}}': data.schulung.ort || 'ROBTEC GmbH, Mainburg',
      '{{ZERTIFIKAT_NR}}': data.zertifikatNummer,
      '{{AUSSTELLUNGSDATUM}}': data.ausstellungsdatum.toLocaleDateString('de-DE'),
      '{{GUELTIG_BIS}}': data.gueltigBis.toLocaleDateString('de-DE')
    };

    // 3. Batch-Updates für Platzhalter erstellen
    console.log('🔄 Ersetze Platzhalter in Slides...');
    const requests: any[] = [];
    
    // Text-Ersetzungen
    Object.entries(replacements).forEach(([placeholder, value]) => {
      if (placeholder !== '{{QR_CODE}}') { // QR_CODE wird separat als Bild eingefügt
        requests.push({
          replaceAllText: {
            containsText: {
              text: placeholder,
              matchCase: false
            },
            replaceText: value || ''
          }
        });
      }
    });

    // 4. QR-Code generieren (später)
    // Für jetzt: Platzhalter-Text für QR-Code
    requests.push({
      replaceAllText: {
        containsText: {
          text: '{{QR_CODE}}',
          matchCase: false
        },
        replaceText: `QR: ${data.zertifikatNummer}` // Temporär, später echtes QR-Bild
      }
    });

    // Updates ausführen
    await slides.presentations.batchUpdate({
      presentationId,
      requestBody: {
        requests
      }
    });

    console.log('✅ Platzhalter ersetzt');

    // 5. Als PDF exportieren
    console.log('📑 Exportiere als PDF...');
    const pdfResponse = await drive.files.export({
      fileId: presentationId,
      mimeType: 'application/pdf'
    }, {
      responseType: 'arraybuffer'
    });

    // 6. Temporäre Slides-Datei löschen (optional)
    // await drive.files.delete({ fileId: presentationId });

    console.log('✅ PDF erfolgreich generiert');
    
    return Buffer.from(pdfResponse.data as ArrayBuffer);

  } catch (error) {
    console.error('❌ Fehler bei Google Slides Zertifikat-Generierung:', error);
    throw error;
  }
}

// Helper: QR-Code Validierungs-Hash generieren
export function generateCertificateHash(name: string, endDate: Date): string {
  const crypto = require('crypto');
  const salt = process.env.CERTIFICATE_SALT || 'ROBTEC-2025';
  
  const dataString = `${name}-${endDate.toISOString()}-${salt}`;
  return crypto
    .createHash('sha256')
    .update(dataString)
    .digest('hex')
    .substring(0, 16); // Kürzen für QR-Code
}
