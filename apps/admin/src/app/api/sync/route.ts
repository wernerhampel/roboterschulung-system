import { NextRequest, NextResponse } from 'next/server';
import { syncFromCalendar, syncToCalendar, fullSync } from '@/lib/calendar-sync';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    let result;

    switch (action) {
      case 'from':
        result = await syncFromCalendar();
        break;
      case 'to':
        result = await syncToCalendar();
        break;
      case 'full':
        result = await fullSync();
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid action. Use "from", "to", or "full"' },
          { status: 400 }
        );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Sync error:', error);
    return NextResponse.json(
      { 
        error: 'Sync failed', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Calendar Sync API',
    endpoints: {
      POST: 'Trigger sync with body: { "action": "from" | "to" | "full" }',
    },
  });
}
