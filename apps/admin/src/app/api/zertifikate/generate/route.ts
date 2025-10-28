import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { 
  generateCertificateHash, 
  generateCertificateNumber,
  calculateExpiryDate,
  determineTemplate,
  prepareCertificateData
} from '@/lib/certificate-utils';
import { generateCertificatePDF } from '@/lib/pdf-generator';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { schulungId, teilnehmerId } = body;

    console.log('[API] POST /api/zertifikate/generate', { schulungId, teilnehmerId });

    if (!schulungId || !teilnehmerId) {
      return NextResponse.json(
        { error: 'schulungId und teilnehmerId erforderlich' },
        { status: 400 }
      );
    }

    // Lade Schulung
    const schulung = await prisma.schulung.findUnique({
      where: { id: schulungId }
    });

    if (!schulung) {
      return NextResponse.json(
        { error: 'Schulung nicht gefunden' },
        { status: 404 }
      );
    }

    // Lade Teilnehmer
    const teilnehmer = await prisma.teilnehmer.findUnique({
      where: { id: teilnehmerId }
    });

    if (!teilnehmer) {
      return NextResponse.json(
        { error: 'Teilnehmer nicht gefunden' },
        { status: 404 }
      );
    }

    // Prüfe ob Anmeldung existiert
    const anmeldung = await prisma.anmeldung.findFirst({
      where: {
        schulungId,
        teilnehmerId
      }
    });

    if (!anmeldung) {
      return NextResponse.json(
        { error: 'Keine Anmeldung für diese Schulung gefunden' },
        { status: 404 }
      );
    }

    // Prüfe ob bereits Zertifikat existiert
    const existing = await prisma.zertifikat.findFirst({
      where: {
        schulungId,
        teilnehmerId
      }
    });

    if (existing) {
      return NextResponse.json(
        { 
          error: 'Zertifikat bereits vorhanden',
          zertifikatId: existing.id
        },
        { status: 400 }
      );
    }

    // Zähle Zertifikate für Nummer-Generierung
    const count = await prisma.zertifikat.count();
    const ausstellungsdatum = new Date();
    
    // Generiere Hash
    const validierungsHash = generateCertificateHash(
      schulungId,
      teilnehmerId,
      ausstellungsdatum
    );

    // Generiere Zertifikat-Nummer
    const zertifikatNummer = generateCertificateNumber(count + 1, ausstellungsdatum);

    // Template bestimmen
    const template = determineTemplate(schulung.hersteller, schulung.typ);

    // Gültigkeitsdatum berechnen (3 Jahre)
    const gueltigBis = calculateExpiryDate(ausstellungsdatum);

    // Erstelle Zertifikat in DB
    const zertifikat = await prisma.zertifikat.create({
      data: {
        schulungId,
        teilnehmerId,
        zertifikatNummer,
        ausstellungsdatum,
        gueltigBis,
        template,
        validierungsHash,
        status: 'aktiv'
      }
    });

    console.log(`[API] Zertifikat erstellt: ${zertifikat.id}`);

    // Bereite Daten für PDF vor
    const certificateData = prepareCertificateData(zertifikat, schulung, teilnehmer);

    // Generiere PDF
    const pdfBuffer = await generateCertificatePDF(certificateData);

    // Optional: PDF in Object Storage speichern
    // const pdfUrl = await uploadToStorage(pdfBuffer, zertifikat.id);

    // Update Zertifikat mit PDF URL (falls gespeichert)
    // await prisma.zertifikat.update({
    //   where: { id: zertifikat.id },
    //   data: { pdfUrl }
    // });

    // Rückgabe: Zertifikat Info + PDF als Base64
    return NextResponse.json({
      success: true,
      zertifikat: {
        id: zertifikat.id,
        zertifikatNummer: zertifikat.zertifikatNummer,
        ausstellungsdatum: zertifikat.ausstellungsdatum,
        gueltigBis: zertifikat.gueltigBis,
        validierungsHash: zertifikat.validierungsHash
      },
      pdf: pdfBuffer.toString('base64'),
      filename: `Zertifikat_${zertifikat.zertifikatNummer}.pdf`
    });

  } catch (error) {
    console.error('[API] Fehler beim Generieren:', error);
    
    return NextResponse.json(
      { 
        error: 'Fehler beim Generieren des Zertifikats',
        details: error instanceof Error ? error.message : 'Unbekannter Fehler'
      },
      { status: 500 }
    );
  }
}
