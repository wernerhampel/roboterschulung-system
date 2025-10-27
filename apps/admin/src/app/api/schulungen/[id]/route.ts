import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    console.log(`[API] GET /api/schulungen/${id}`);

    const schulung = await prisma.schulung.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            anmeldungen: true,
            termine: true,
            zertifikate: true
          }
        }
      }
    });

    if (!schulung) {
      return NextResponse.json(
        { error: 'Schulung nicht gefunden' },
        { status: 404 }
      );
    }

    return NextResponse.json(schulung);

  } catch (error) {
    console.error('[API] Fehler beim Laden der Schulung:', error);
    
    return NextResponse.json(
      { 
        error: 'Fehler beim Laden der Schulung',
        details: error instanceof Error ? error.message : 'Unbekannter Fehler'
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    console.log(`[API] PATCH /api/schulungen/${id}`, body);

    const schulung = await prisma.schulung.update({
      where: { id },
      data: {
        titel: body.titel,
        beschreibung: body.beschreibung,
        typ: body.typ,
        hersteller: body.hersteller,
        startDatum: body.startDatum ? new Date(body.startDatum) : undefined,
        endDatum: body.endDatum ? new Date(body.endDatum) : undefined,
        dauer: body.dauer,
        maxTeilnehmer: body.maxTeilnehmer,
        preis: body.preis,
        status: body.status,
        ort: body.ort,
        raum: body.raum,
        trainer: body.trainer
      },
      include: {
        _count: {
          select: {
            anmeldungen: true
          }
        }
      }
    });

    return NextResponse.json(schulung);

  } catch (error) {
    console.error('[API] Fehler beim Aktualisieren:', error);
    
    return NextResponse.json(
      { 
        error: 'Fehler beim Aktualisieren',
        details: error instanceof Error ? error.message : 'Unbekannter Fehler'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    console.log(`[API] DELETE /api/schulungen/${id}`);

    await prisma.schulung.delete({
      where: { id }
    });

    return NextResponse.json({ success: true, message: 'Schulung gelöscht' });

  } catch (error) {
    console.error('[API] Fehler beim Löschen:', error);
    
    return NextResponse.json(
      { 
        error: 'Fehler beim Löschen',
        details: error instanceof Error ? error.message : 'Unbekannter Fehler'
      },
      { status: 500 }
    );
  }
}
