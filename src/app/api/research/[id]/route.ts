import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { ResearchPipeline } from '@/lib/engine/research-pipeline';
import { NicheType, BusinessModel } from '@/lib/providers/types';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized. Please sign in.' }, { status: 401 });
    }
    const { id } = await params;
    const research = db.getResearchById(id, user.id);
    if (!research) {
      return NextResponse.json({ success: false, error: 'Research not found.' }, { status: 404 });
    }
    return NextResponse.json({ success: true, research });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized. Please sign in.' }, { status: 401 });
    }
    const { id } = await params;
    db.deleteResearch(id, user.id);
    return NextResponse.json({ success: true, message: 'Research deleted.' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized. Please sign in.' }, { status: 401 });
    }
    const { id } = await params;
    const research = db.getResearchById(id, user.id);

    if (!research) {
      return NextResponse.json({ success: false, error: 'Research not found.' }, { status: 404 });
    }

    // Refresh research run
    const refreshedReport = await ResearchPipeline.execute({
      seedKeyword: research.seedKeyword,
      nicheType: research.nicheType as NicheType,
      businessModel: research.businessModel as BusinessModel,
      targetCountry: research.targetCountry,
      language: research.language,
      userId: user?.id || research.userId,
    });

    const updated = {
      ...research,
      status: 'completed' as const,
      progress: 100,
      viabilityScore: refreshedReport.overallViabilityScore,
      verdict: refreshedReport.verdict,
      dataConfidence: refreshedReport.dataConfidenceScore,
      report: refreshedReport,
      updatedAt: new Date().toISOString(),
    };

    db.saveResearch(updated);

    // Also synchronize saved niche if present
    const saved = db.getSavedNiches().find((s) => s.researchId === updated.id);
    if (saved) {
      const oldScore = saved.viabilityScore;
      const newScore = updated.viabilityScore;
      const delta = newScore - oldScore;
      db.saveNiche({
        ...saved,
        previousScore: oldScore,
        viabilityScore: newScore,
        scoreDelta: delta,
        verdict: updated.verdict,
        lastRecalculatedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    return NextResponse.json({ success: true, research: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

