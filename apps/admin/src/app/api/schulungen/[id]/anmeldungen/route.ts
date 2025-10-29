import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const anmeldungen = await prisma.anmeldung.findMany({
      where: {
        schulungId: params.id
      },
      include: {
        teilnehmer: {
          select: {
            id: true,
            vorname: true,
            nachname: true,
            email: true,
            telefon: true,
            firma: true
          }
        }
      },
      orderBy: {
        anmeldedatum: 'asc'
      }
    });

    return NextResponse.json(anmeldungen);
  } catch (error) {
    console.error('Error fetching anmeldungen:', error);
    return NextResponse.json(
      { error: 'Failed to fetch anmeldungen' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    // Validierung
    if (!body.teilnehmerId) {
      return NextResponse.json(
        { error: 'teilnehmerId ist erforderlich' },
        { status: 400 }
      );
    }

    // Prüfe ob Anmeldung bereits existiert
    const existing = await prisma.anmeldung.findUnique({
      where: {
        schulungId_teilnehmerId: {
          schulungId: params.id,
          teilnehmerId: body.teilnehmerId
        }
      }
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Teilnehmer ist bereits angemeldet' },
        { status: 400 }
      );
    }

    // Prüfe freie Plätze
    const schulung = await prisma.schulung.findUnique({
      where: { id: params.id },
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

    // Erstelle Anmeldung
    const anmeldung = await prisma.anmeldung.create({
      data: {
        schulungId: params.id,
        teilnehmerId: body.teilnehmerId,
        status: body.status || 'reserviert',
        bezahlstatus: body.bezahlstatus || 'offen',
        vermittler: body.vermittler,
        provisionRate: body.provisionRate
      },
      include: {
        teilnehmer: {
          select: {
            id: true,
            vorname: true,
            nachname: true,
            email: true,
            telefon: true,
            firma: true
          }
        }
      }
    });

    return NextResponse.json(anmeldung, { status: 201 });
  } catch (error) {
    console.error('Error creating anmeldung:', error);
    return NextResponse.json(
      { error: 'Failed to create anmeldung' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const anmeldungId = searchParams.get('anmeldungId');

    if (!anmeldungId) {
      return NextResponse.json(
        { error: 'anmeldungId ist erforderlich' },
        { status: 400 }
      );
    }

    await prisma.anmeldung.delete({
      where: { id: anmeldungId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting anmeldung:', error);
    return NextResponse.json(
      { error: 'Failed to delete anmeldung' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
