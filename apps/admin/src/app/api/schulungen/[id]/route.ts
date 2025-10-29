import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const schulung = await prisma.schulung.findUnique({
      where: { id: params.id },
      include: {
        anmeldungen: {
          include: {
            teilnehmer: true
          }
        },
        zertifikate: true,
        rechnungen: true,
        pruefungen: true,
        _count: {
          select: {
            anmeldungen: true,
            zertifikate: true
          }
        }
      }
    });

    if (!schulung) {
      return NextResponse.json(
        { error: 'Schulung not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(schulung);
  } catch (error) {
    console.error('Error fetching schulung:', error);
    return NextResponse.json(
      { error: 'Failed to fetch schulung' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    const schulung = await prisma.schulung.update({
      where: { id: params.id },
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
        trainer: body.trainer,
        customContent: body.customContent
      },
      include: {
        anmeldungen: {
          include: {
            teilnehmer: true
          }
        },
        _count: {
          select: {
            anmeldungen: true,
            zertifikate: true
          }
        }
      }
    });

    return NextResponse.json(schulung);
  } catch (error) {
    console.error('Error updating schulung:', error);
    return NextResponse.json(
      { error: 'Failed to update schulung' },
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
    await prisma.schulung.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting schulung:', error);
    return NextResponse.json(
      { error: 'Failed to delete schulung' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
