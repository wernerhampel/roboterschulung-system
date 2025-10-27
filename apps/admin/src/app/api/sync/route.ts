import { NextRequest, NextResponse } from 'next/server';
import { importFromGoogleCalendar, exportToGoogleCalendar } from '@/lib/calendar-sync';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    console.log(`[Sync API] Action: ${action}`);

    if (action === 'import') {
      const result = await importFromGoogleCalendar();
      return NextResponse.json(result);
    }

    if (action === 'export') {
      const result = await exportToGoogleCalendar();
      return NextResponse.json(result);
    }

    if (action === 'full') {
      // Erst Import, dann Export
      const importResult = await importFromGoogleCalendar();
      
      if (!importResult.success) {
        return NextResponse.json(importResult);
      }

      const exportResult = await exportToGoogleCalendar();
      
      return NextResponse.json({
        success: importResult.success && exportResult.success,
        import: importResult,
        export: exportResult
      });
    }

    return NextResponse.json(
      { error: 'Unbekannte Aktion. Nutze: import, export, oder full' },
      { status: 400 }
    );

  } catch (error) {
    console.error('[Sync API] Fehler:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unbekannter Fehler'
      },
      { status: 500 }
    );
  }
}
