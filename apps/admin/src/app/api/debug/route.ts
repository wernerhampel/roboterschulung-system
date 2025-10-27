import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    console.log('[DEBUG] Prüfe Datenbank...');

    // Zähle alle Schulungen
    const count = await prisma.schulung.count();
    console.log(`[DEBUG] Anzahl Schulungen in DB: ${count}`);

    // Lade alle Schulungen (mit mehr Details)
    const schulungen = await prisma.schulung.findMany({
      select: {
        id: true,
        titel: true,
        typ: true,
        hersteller: true,
        startDatum: true,
        endDatum: true,
        status: true,
        calendarEventId: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log('[DEBUG] Gefundene Schulungen:', JSON.stringify(schulungen, null, 2));

    // Prüfe Sync Logs
    const syncLogs = await prisma.syncLog.findMany({
      orderBy: {
        startedAt: 'desc'
      },
      take: 5
    });

    console.log('[DEBUG] Letzte Sync Logs:', JSON.stringify(syncLogs, null, 2));

    return NextResponse.json({
      success: true,
      anzahlSchulungen: count,
      schulungen: schulungen,
      letzteSync: syncLogs,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('[DEBUG] Fehler:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unbekannter Fehler',
      stack: error instanceof Error ? error.stack : null
    }, { status: 500 });
  }
}
