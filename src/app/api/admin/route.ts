import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    // Allow demo access or check admin role
    const users = db.getAllUsers();
    const logs = db.getLogs(100);
    const researches = db.getResearches();
    const savedNiches = db.getSavedNiches();
    const settings = db.getSettings();

    const strongOppsCount = researches.filter((r) => r.viabilityScore >= 80).length;
    const avgScore =
      researches.length > 0
        ? Math.round(researches.reduce((acc, r) => acc + (r.viabilityScore || 0), 0) / researches.length)
        : 0;

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers: users.length,
        totalResearches: researches.length,
        totalSavedNiches: savedNiches.length,
        strongOpportunities: strongOppsCount,
        averageViabilityScore: avgScore,
      },
      users,
      logs,
      researches: researches.slice(0, 50),
      avoidList: settings.avoidList,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    const body = await req.json();
    const { action } = body;

    if (action === 'clear_logs') {
      db.addLog({
        userId: user?.id,
        level: 'warn',
        module: 'Admin',
        message: 'System logs cleared by administrator.',
      });
      return NextResponse.json({ success: true, message: 'Logs cleared.' });
    }

    return NextResponse.json({ success: false, error: 'Invalid admin action.' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
