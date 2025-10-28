import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateCertificateHash, isCertificateValid } from '@/lib/certificate-utils';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const hash = searchParams.get('hash');

    console.log(`[API] GET /api/verify/${id}`, { hash });

    if (!hash) {
      return NextResponse.json(
        { 
          valid: false,
          error: 'Hash fehlt'
        },
        { status: 400 }
      );
    }

    // Lade Zertifikat
    const zertifikat = await prisma.zertifikat.findUnique({
      where: { id },
      select: {
        id: true,
        zertifikatsnummer: true,
        schulungId: true,
        teilnehmerId: true,
        ausstellungsdatum: true,
        gueltigBis: true,
        status: true,
        schulung: {
          select: {
            titel: true,
            typ: true,
            hersteller: true,
            startDatum: true,
            endDatum: true,
            dauer: true
          }
        },
        teilnehmer: {
          select: {
            vorname: true,
            nachname: true,
            firma: true
          }
        }
      }
    });

    if (!zertifikat) {
      return NextResponse.json(
        { 
          valid: false,
          error: 'Zertifikat nicht gefunden'
        },
        { status: 404 }
      );
    }

    // Validiere Hash
    const isHashValid = validateCertificateHash(
      hash,
      zertifikat.schulungId,
      zertifikat.teilnehmerId,
      zertifikat.ausstellungsdatum
    );

    if (!isHashValid) {
      return NextResponse.json(
        { 
          valid: false,
          error: 'Ungültiger Validierungscode'
        },
        { status: 400 }
      );
    }

    // Prüfe Status
    if (zertifikat.status === 'widerrufen') {
      return NextResponse.json({
        valid: false,
        revoked: true,
        message: 'Dieses Zertifikat wurde widerrufen'
      });
    }

    // Prüfe Gültigkeit
    const isStillValid = isCertificateValid(zertifikat.gueltigBis);

    // GDPR-konform: Nur notwendige Infos zurückgeben
    return NextResponse.json({
      valid: true,
      expired: !isStillValid,
      zertifikat: {
        zertifikatNummer: zertifikat.zertifikatsnummer,
        ausstellungsdatum: zertifikat.ausstellungsdatum,
        gueltigBis: zertifikat.gueltigBis,
        // Teilnehmer-Info (pseudonymisiert falls gewünscht)
        teilnehmer: {
          name: `${zertifikat.teilnehmer.vorname} ${zertifikat.teilnehmer.nachname}`,
          firma: zertifikat.teilnehmer.firma
        },
        schulung: {
          titel: zertifikat.schulung.titel,
          typ: getTypLabel(zertifikat.schulung.typ),
          hersteller: getHerstellerLabel(zertifikat.schulung.hersteller),
          startDatum: zertifikat.schulung.startDatum,
          endDatum: zertifikat.schulung.endDatum,
          dauer: zertifikat.schulung.dauer
        }
      }
    });

  } catch (error) {
    console.error('[API] Fehler bei Validierung:', error);
    
    return NextResponse.json(
      { 
        valid: false,
        error: 'Fehler bei der Validierung',
        details: error instanceof Error ? error.message : 'Unbekannter Fehler'
      },
      { status: 500 }
    );
  }
}

function getTypLabel(typ: string): string {
  const labels: Record<string, string> = {
    grundlagen: 'Grundlagen',
    praxis: 'Praxis',
    online: 'Online',
    sonstige: 'Sonstige'
  };
  return labels[typ] || typ;
}

function getHerstellerLabel(hersteller: string): string {
  const labels: Record<string, string> = {
    kuka: 'KUKA',
    abb: 'ABB',
    mitsubishi: 'Mitsubishi',
    universal_robots: 'Universal Robots',
    sonstige: 'Sonstige'
  };
  return labels[hersteller] || hersteller;
}
