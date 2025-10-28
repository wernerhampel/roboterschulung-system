import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { generateCertificateWithGoogleSlides } from '@/lib/google-slides-generator';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { schulungId, teilnehmerId } = body;

    console.log('🎓 Generating certificate with Google Slides for:', { schulungId, teilnehmerId });

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
      
      // Generiere PDF für existierendes Zertifikat neu mit Google Slides
      const pdfData = await generateCertificateWithGoogleSlides({
        zertifikatNummer: existingCert.zertifikatsnummer,
        teilnehmer: {
          vorname: teilnehmer.vorname,
          nachname: teilnehmer.nachname,
          firma: teilnehmer.firma || '',
          email: teilnehmer.email
        },
        schulung: {
          titel: schulung.titel,
          hersteller: schulung.hersteller,
          typ: schulung.typ,
          startDatum: new Date(schulung.startDatum),
          endDatum: new Date(schulung.endDatum),
          dauer: schulung.dauer,
          trainer: schulung.trainer || undefined,
          ort: schulung.ort || undefined
        },
        ausstellungsdatum: existingCert.ausstellungsdatum,
        gueltigBis: existingCert.gueltigBis || new Date(Date.now() + 3 * 365 * 24 * 60 * 60 * 1000)
      });

      return NextResponse.json({
        success: true,
        zertifikat: existingCert,
        pdf: pdfData.toString('base64')
      });
    }

    // Generiere neue Zertifikatsnummer (wie im Google Apps Script)
    const timestamp = new Date().getTime();
    const year = new Date().getFullYear();
    const zertifikatNummer = `CERT-${year}-${timestamp.toString().slice(-6)}`;
    
    // Generiere Validierungs-Hash
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
    const zertifikat = await prisma.zertifikat.create({
      data: {
        schulungId,
        teilnehmerId,
        zertifikatsnummer: zertifikatNummer,
        qrCode: validierungsHash,
        validierungsUrl: validierungsUrl,
        gueltigBis: gueltigBis,
        status: 'aktiv',
        ausstellungsdatum: new Date()
      }
    });

    console.log('✅ Certificate created in DB:', zertifikat.zertifikatsnummer);

    // PDF mit Google Slides generieren
    console.log('📑 Generating PDF with Google Slides...');
    const pdfData = await generateCertificateWithGoogleSlides({
      zertifikatNummer,
      teilnehmer: {
        vorname: teilnehmer.vorname,
        nachname: teilnehmer.nachname,
        firma: teilnehmer.firma || '',
        email: teilnehmer.email
      },
      schulung: {
        titel: schulung.titel,
        hersteller: schulung.hersteller,
        typ: schulung.typ,
        startDatum: new Date(schulung.startDatum),
        endDatum: new Date(schulung.endDatum),
        dauer: schulung.dauer,
        trainer: schulung.trainer || undefined,
        ort: schulung.ort || undefined
      },
      ausstellungsdatum: new Date(),
      gueltigBis
    });

    console.log('✅ PDF generated successfully with Google Slides');

    return NextResponse.json({
      success: true,
      zertifikat,
      pdf: pdfData.toString('base64'),
      message: 'Zertifikat erfolgreich mit Google Slides erstellt'
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
