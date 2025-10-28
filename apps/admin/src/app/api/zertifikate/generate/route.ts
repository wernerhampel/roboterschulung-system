import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { generateCertificatePDF } from '@/lib/pdf-generator';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { schulungId, teilnehmerId } = body;

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
      return NextResponse.json(
        { error: 'Zertifikat existiert bereits für diesen Teilnehmer' },
        { status: 409 }
      );
    }

    // Zertifikat-Nummer generieren (Format: ROBT-YYYY-XXXXX)
    const year = new Date().getFullYear();
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    const zertifikatNummer = `ROBT-${year}-${randomNum}`;

    // Validierungs-Hash generieren (für spätere Nutzung)
    const validierungsHash = await generateValidationHash(
      zertifikatNummer,
      teilnehmerId,
      schulungId
    );

    // Gültigkeitsdatum (z.B. 3 Jahre ab Ausstellungsdatum)
    const gueltigBis = new Date();
    gueltigBis.setFullYear(gueltigBis.getFullYear() + 3);

    // Template basierend auf Schulungstyp
    const template = `${schulung.hersteller.toLowerCase()}-${schulung.typ.toLowerCase()}`;

    // Zertifikat in DB erstellen
    const zertifikat = await prisma.zertifikat.create({
      data: {
        schulungId,
        teilnehmerId,
        zertifikatNummer,
        validierungsHash,
        gueltigBis,
        template,
        status: 'aktiv'
      }
    });

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
        startDatum: schulung.startDatum,
        endDatum: schulung.endDatum,
        dauer: schulung.dauer
      },
      ausstellungsdatum: new Date(),
      gueltigBis
    });

    // Filename
    const filename = `Zertifikat_${teilnehmer.nachname}_${teilnehmer.vorname}_${zertifikatNummer}.pdf`;

    return NextResponse.json({
      success: true,
      zertifikat: {
        id: zertifikat.id,
        nummer: zertifikatNummer,
        ausstellungsdatum: zertifikat.ausstellungsdatum,
        gueltigBis: zertifikat.gueltigBis
      },
      pdf: pdfData.toString('base64'),
      filename
    });

  } catch (error) {
    console.error('Fehler bei Zertifikat-Generierung:', error);
    return NextResponse.json(
      { error: 'Interner Serverfehler bei der Zertifikat-Generierung' },
      { status: 500 }
    );
  }
}

// Helper: Validierungs-Hash generieren
async function generateValidationHash(
  zertifikatNummer: string,
  teilnehmerId: string,
  schulungId: string
): Promise<string> {
  const crypto = require('crypto');
  const data = `${zertifikatNummer}-${teilnehmerId}-${schulungId}-${Date.now()}`;
  return crypto.createHash('sha256').update(data).digest('hex');
}
