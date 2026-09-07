import { NextRequest, NextResponse } from 'next/server';
import { LivePulseEngine } from '@/lib/engine/live-pulse-engine';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const status = LivePulseEngine.getStatus();
    const savedNiches = db.getSavedNiches();
    return NextResponse.json({
      success: true,
      status,
      saved: savedNiches,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { targetId } = body;

    if (targetId) {
      const result = LivePulseEngine.recalculateSingle(targetId);
      const savedNiches = db.getSavedNiches();
      return NextResponse.json({
        success: result.success,
        result: result.result,
        saved: savedNiches,
        status: LivePulseEngine.getStatus(),
      });
    }

    const output = LivePulseEngine.recalculateAll();
    const savedNiches = db.getSavedNiches();
    return NextResponse.json({
      success: output.success,
      results: output.results,
      saved: savedNiches,
      status: output.status,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
