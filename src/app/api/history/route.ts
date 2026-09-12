import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { SearchOrigin } from '@/lib/providers/types';

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized. Please sign in.' }, { status: 401 });
    }
    const userId = user.id;

    const { searchParams } = new URL(req.url);
    const origin = (searchParams.get('origin') as SearchOrigin | 'all') || 'all';
    const query = searchParams.get('query') || undefined;
    const verdict = searchParams.get('verdict') || undefined;
    const limit = searchParams.get('limit') ? Number(searchParams.get('limit')) : undefined;

    const result = db.getHistory({
      userId,
      origin,
      query,
      verdict,
      limit,
    });

    return NextResponse.json({
      success: true,
      history: result.history,
      stats: result.stats,
    });
  } catch (error: any) {
    console.error('History API GET error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized. Please sign in.' }, { status: 401 });
    }
    const userId = user.id;

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const origin = searchParams.get('origin') as SearchOrigin | 'all' | null;
    const clearAll = searchParams.get('clearAll') === 'true';

    if (id) {
      db.deleteResearch(id, userId);
      db.addLog({
        userId,
        level: 'info',
        module: 'History',
        message: `Deleted research record ${id} from history.`,
      });
      return NextResponse.json({ success: true, message: 'Record deleted from history.' });
    }

    if (clearAll || origin) {
      db.clearHistory(userId, origin || 'all');
      db.addLog({
        userId,
        level: 'info',
        module: 'History',
        message: `Cleared search history (origin: ${origin || 'all'}).`,
      });
      return NextResponse.json({ success: true, message: 'History cleared successfully.' });
    }

    return NextResponse.json(
      { success: false, error: 'Provide id or clearAll/origin to delete.' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('History API DELETE error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
