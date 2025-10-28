import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { generateCertificatePDF } from '@/lib/pdf-generator';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { schulungId, teilnehmerId } = body;

    console.log('🎓 Generating certificate for:', { schulungId, teilnehmerId });

    // Validierung
    if (!schulungId || !teilnehmerId) {
      return NextResponse.json(
        { error: 'schulungId und teilnehmerId sind erforderlich' },
        { status: 400 }
      );
    }

    // Schulung laden
    const schulung = await prisma.schulung.findUnique({
      where: { id: schulungId }
    });

    if (!schulung) {
      return NextResponse.json(
        { error: 'Schulung nicht gefunden' },
        { status: 404 }
      );
    }

    // Teilnehmer laden
    const teilnehmer = await prisma.teilnehmer.findUnique({
      where: { id: teilnehmerId }
    });

    if (!teilnehmer) {
      return NextResponse.json(
        { error: 'Teilnehmer nicht gefunden' },
        { status: 404 }
      );
    }

    // Prüfe ob bereits ein Zertifikat existiert
    const existingCert = await prisma.zertifikat.findUnique({
      where: {
        schulungId_teilnehmerId: {
          schulungId,
          teilnehmerId
        }
      }
    });

    if (existingCert) {
      console.log('Certificate already exists:', existingCert.zertifikatsnummer);
      
      // Generiere PDF für existierendes Zertifikat neu
      // WICHTIG: Prisma gibt uns gueltigBis (camelCase) zurück!
      const pdfData = await generateCertificatePDF({
        zertifikatNummer: existingCert.zertifikatsnummer,
        teilnehmer: {
          vorname: teilnehmer.vorname,
          nachname: teilnehmer.nachname,
          firma: teilnehmer.firma || ''
        },
        schulung: {
          titel: schulung.titel,
          hersteller: schulung.hersteller,
          typ: schulung.typ,
          startDatum: new Date(schulung.startDatum),
          endDatum: new Date(schulung.endDatum),
          dauer: schulung.dauer
        },
        ausstellungsdatum: existingCert.ausstellungsdatum,
        gueltigBis: existingCert.gueltigBis || new Date(Date.now() + 3 * 365 * 24 * 60 * 60 * 1000)  // camelCase!
      });

      return NextResponse.json({
        success: true,
        zertifikat: existingCert,
        pdf: pdfData.toString('base64')
      });
    }

    // Generiere neue Zertifikatsnummer
    const year = new Date().getFullYear();
    const count = await prisma.zertifikat.count({
      where: {
        zertifikatsnummer: {
          startsWith: `ROBT-${year}-`
        }
      }
    });
    
    const zertifikatNummer = `ROBT-${year}-${String(count + 1).padStart(5, '0')}`;
    
    // Generiere Validierungs-Hash (nach aktuellem Schema: qrCode)
    const crypto = require('crypto');
    const validierungsHash = crypto
      .createHash('sha256')
      .update(`${zertifikatNummer}-${teilnehmerId}-${schulungId}-${Date.now()}`)
      .digest('hex');

    // Validierungs-URL
    const baseUrl = process.env.NEXT_PUBLIC_VERIFY_URL || 'https://robtec-verify.vercel.app';
    const validierungsUrl = `${baseUrl}/verify/${validierungsHash}`;

    // Gültigkeitsdatum (3 Jahre)
    const gueltigBis = new Date();
    gueltigBis.setFullYear(gueltigBis.getFullYear() + 3);

    // Zertifikat in DB erstellen
    // WICHTIG: Der Error-Output zeigt uns die tatsächlichen Felder:
    // - qrCode (nicht validierungshash)
    // - validierungsUrl
    // - gueltigBis (wird intern zu camelCase)
    const zertifikat = await prisma.zertifikat.create({
      data: {
        schulungId,
        teilnehmerId,
        zertifikatsnummer: zertifikatNummer,
        qrCode: validierungsHash,             // Das Schema hat jetzt qrCode!
        validierungsUrl: validierungsUrl,     // Und validierungsUrl!
        gueltigBis: gueltigBis,               // camelCase für Prisma
        status: 'aktiv',
        ausstellungsdatum: new Date()
      }
    });

    console.log('✅ Certificate created:', zertifikat.zertifikatsnummer);

    // PDF generieren
    const pdfData = await generateCertificatePDF({
      zertifikatNummer,
      teilnehmer: {
        vorname: teilnehmer.vorname,
        nachname: teilnehmer.nachname,
        firma: teilnehmer.firma || ''
      },
      schulung: {
        titel: schulung.titel,
        hersteller: schulung.hersteller,
        typ: schulung.typ,
        startDatum: new Date(schulung.startDatum),
        endDatum: new Date(schulung.endDatum),
        dauer: schulung.dauer
      },
      ausstellungsdatum: new Date(),
      gueltigBis
    });

    console.log('📄 PDF generated successfully');

    return NextResponse.json({
      success: true,
      zertifikat,
      pdf: pdfData.toString('base64')
    });

  } catch (error) {
    console.error('❌ Error generating certificate:', error);
    return NextResponse.json(
      { error: 'Fehler beim Erstellen des Zertifikats: ' + (error as Error).message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
