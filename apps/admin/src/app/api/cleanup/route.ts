import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    console.log('[API] DELETE Demo-Schulungen...');

    // Lösche alle Schulungen OHNE calendarEventId (= Demo-Daten)
    const deleted = await prisma.schulung.deleteMany({
      where: {
        calendarEventId: null
      }
    });

    console.log(`[API] ${deleted.count} Demo-Schulungen gelöscht`);

    return NextResponse.json({
      success: true,
      deleted: deleted.count,
      message: `${deleted.count} Demo-Schulungen wurden gelöscht`
    });

  } catch (error) {
    console.error('[API] Fehler beim Löschen:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unbekannter Fehler'
    }, { status: 500 });
  }
}
