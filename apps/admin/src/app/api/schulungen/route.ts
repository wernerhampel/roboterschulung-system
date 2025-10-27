import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    console.log('[API] GET /api/schulungen - Lade Schulungen...');

    const schulungen = await prisma.schulung.findMany({
      include: {
        _count: {
          select: {
            anmeldungen: true
          }
        }
      },
      orderBy: {
        startDatum: 'asc'
      }
    });

    console.log(`[API] ${schulungen.length} Schulungen geladen`);

    return NextResponse.json(schulungen);

  } catch (error) {
    console.error('[API] Fehler beim Laden der Schulungen:', error);
    
    return NextResponse.json(
      { 
        error: 'Fehler beim Laden der Schulungen',
        details: error instanceof Error ? error.message : 'Unbekannter Fehler'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('[API] POST /api/schulungen - Erstelle neue Schulung:', body);

    // Validierung
    if (!body.titel || !body.typ || !body.hersteller || !body.startDatum) {
      return NextResponse.json(
        { error: 'Fehlende Pflichtfelder' },
        { status: 400 }
      );
    }

    // Erstelle Schulung
    const schulung = await prisma.schulung.create({
      data: {
        titel: body.titel,
        beschreibung: body.beschreibung,
        typ: body.typ,
        hersteller: body.hersteller,
        startDatum: new Date(body.startDatum),
        endDatum: new Date(body.endDatum || body.startDatum),
        dauer: body.dauer || 1,
        maxTeilnehmer: body.maxTeilnehmer || 12,
        preis: body.preis || 0,
        status: body.status || 'geplant',
        ort: body.ort,
        raum: body.raum,
        trainer: body.trainer,
        calendarEventId: body.calendarEventId
      },
      include: {
        _count: {
          select: {
            anmeldungen: true
          }
        }
      }
    });

    console.log('[API] Schulung erstellt:', schulung.id);

    return NextResponse.json(schulung, { status: 201 });

  } catch (error) {
    console.error('[API] Fehler beim Erstellen der Schulung:', error);
    
    return NextResponse.json(
      { 
        error: 'Fehler beim Erstellen der Schulung',
        details: error instanceof Error ? error.message : 'Unbekannter Fehler'
      },
      { status: 500 }
    );
  }
}
