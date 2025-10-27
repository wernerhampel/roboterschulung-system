import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    console.log(`[API] GET /api/schulungen/${id}/anmeldungen`);

    const anmeldungen = await prisma.anmeldung.findMany({
      where: {
        schulungId: id
      },
      include: {
        teilnehmer: {
          select: {
            id: true,
            vorname: true,
            nachname: true,
            email: true,
            telefon: true,
            firma: true,
            position: true
          }
        }
      },
      orderBy: {
        anmeldedatum: 'desc'
      }
    });

    console.log(`[API] ${anmeldungen.length} Anmeldungen gefunden`);

    return NextResponse.json(anmeldungen);

  } catch (error) {
    console.error('[API] Fehler beim Laden der Anmeldungen:', error);
    
    return NextResponse.json(
      { 
        error: 'Fehler beim Laden der Anmeldungen',
        details: error instanceof Error ? error.message : 'Unbekannter Fehler'
      },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    console.log(`[API] POST /api/schulungen/${id}/anmeldungen`, body);

    // Prüfe ob Schulung existiert und Plätze frei sind
    const schulung = await prisma.schulung.findUnique({
      where: { id },
      include: {
        _count: {
          select: { anmeldungen: true }
        }
      }
    });

    if (!schulung) {
      return NextResponse.json(
        { error: 'Schulung nicht gefunden' },
        { status: 404 }
      );
    }

    if (schulung._count.anmeldungen >= schulung.maxTeilnehmer) {
      return NextResponse.json(
        { error: 'Keine freien Plätze mehr verfügbar' },
        { status: 400 }
      );
    }

    // Prüfe ob Teilnehmer schon existiert oder erstelle neuen
    let teilnehmer = await prisma.teilnehmer.findUnique({
      where: { email: body.teilnehmer.email }
    });

    if (!teilnehmer) {
      teilnehmer = await prisma.teilnehmer.create({
        data: {
          vorname: body.teilnehmer.vorname,
          nachname: body.teilnehmer.nachname,
          email: body.teilnehmer.email,
          telefon: body.teilnehmer.telefon,
          firma: body.teilnehmer.firma,
          position: body.teilnehmer.position,
          strasse: body.teilnehmer.strasse,
          plz: body.teilnehmer.plz,
          ort: body.teilnehmer.ort,
          land: body.teilnehmer.land || 'DE'
        }
      });
    }

    // Erstelle Anmeldung
    const anmeldung = await prisma.anmeldung.create({
      data: {
        schulungId: id,
        teilnehmerId: teilnehmer.id,
        status: body.status || 'angemeldet',
        bezahlstatus: body.bezahlstatus || 'offen',
        bemerkungen: body.bemerkungen
      },
      include: {
        teilnehmer: true
      }
    });

    console.log(`[API] Anmeldung erstellt: ${anmeldung.id}`);

    return NextResponse.json(anmeldung, { status: 201 });

  } catch (error) {
    console.error('[API] Fehler beim Erstellen der Anmeldung:', error);
    
    return NextResponse.json(
      { 
        error: 'Fehler beim Erstellen der Anmeldung',
        details: error instanceof Error ? error.message : 'Unbekannter Fehler'
      },
      { status: 500 }
    );
  }
}
