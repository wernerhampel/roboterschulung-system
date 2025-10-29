import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const templates = await prisma.schulungsTemplate.findMany({
      orderBy: [
        { hersteller: 'asc' },
        { typ: 'asc' },
        { name: 'asc' }
      ]
    });
    
    return NextResponse.json(templates);
  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validierung
    if (!body.name || !body.typ || !body.hersteller) {
      return NextResponse.json(
        { error: 'Name, Typ und Hersteller sind erforderlich' },
        { status: 400 }
      );
    }
    
    const template = await prisma.schulungsTemplate.create({
      data: {
        name: body.name,
        typ: body.typ,
        hersteller: body.hersteller,
        beschreibung: body.beschreibung || '',
        lernziele: body.lernziele || [],
        agenda: body.agenda || [],
        materialien: body.materialien || [],
        standardFragen: body.standardFragen || null
      }
    });
    
    return NextResponse.json(template, { status: 201 });
  } catch (error) {
    console.error('Error creating template:', error);
    return NextResponse.json(
      { error: 'Failed to create template' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
