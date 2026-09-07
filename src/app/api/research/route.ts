import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { ResearchPipeline } from '@/lib/engine/research-pipeline';
import { NicheType, BusinessModel } from '@/lib/providers/types';

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    const researches = db.getResearches(user ? user.id : undefined);
    return NextResponse.json({ success: true, researches });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    const userId = user?.id || 'usr_demo_02';

    const body = await req.json();
    const {
      seedKeyword,
      nicheType = 'micro',
      businessModel = 'affiliate',
      targetCountry = 'United States',
      language = 'English',
      minSv = 500,
      maxKd = 45,
      optionalKeywords = [],
    } = body;

    if (!seedKeyword || typeof seedKeyword !== 'string' || !seedKeyword.trim()) {
      return NextResponse.json({ success: false, error: 'Seed keyword is required.' }, { status: 400 });
    }

    const researchId = `res_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // Create preliminary queued record
    db.saveResearch({
      id: researchId,
      userId,
      seedKeyword: seedKeyword.trim(),
      nicheType,
      businessModel,
      targetCountry,
      language,
      status: 'running',
      progress: 10,
      currentPhase: 1,
      viabilityScore: 0,
      verdict: 'Analyzing...',
      dataConfidence: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    db.addLog({
      userId,
      level: 'info',
      module: 'Pipeline',
      message: `Started 15-phase research for "${seedKeyword.trim()}" (${targetCountry})`,
    });

    // Execute 15-phase pipeline
    const report = await ResearchPipeline.execute({
      seedKeyword,
      nicheType: nicheType as NicheType,
      businessModel: businessModel as BusinessModel,
      targetCountry,
      language,
      minSv: Number(minSv),
      maxKd: Number(maxKd),
      optionalKeywords,
      userId,
    });

    // Save completed record with full dossier
    db.saveResearch({
      id: researchId,
      userId,
      seedKeyword: seedKeyword.trim(),
      nicheType,
      businessModel,
      targetCountry,
      language,
      status: 'completed',
      progress: 100,
      currentPhase: 15,
      viabilityScore: report.overallViabilityScore,
      verdict: report.verdict,
      dataConfidence: report.dataConfidenceScore,
      report,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Also auto-save to Saved Niches with initial 'researching' status
    db.saveNiche({
      id: `sn_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId,
      researchId,
      nicheName: report.nicheName,
      seedKeyword: report.seedKeyword,
      targetCountry: report.targetCountry,
      viabilityScore: report.overallViabilityScore,
      verdict: report.verdict,
      status: report.overallViabilityScore >= 80 ? 'strong_opportunity' : 'researching',
      tags: [report.nicheType, report.businessModel],
      notes: `Automated analysis score: ${report.overallViabilityScore}/100. ${report.keyReasons[0] || ''}`,
      pinned: report.overallViabilityScore >= 80,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    db.incrementApiUsage(userId);

    db.addLog({
      userId,
      level: 'info',
      module: 'Pipeline',
      message: `Completed research for "${seedKeyword.trim()}". Verdict: ${report.verdict} (${report.overallViabilityScore}/100)`,
    });

    return NextResponse.json({
      success: true,
      researchId,
      report,
    });
  } catch (error: any) {
    console.error('Research API Error:', error);
    db.addLog({
      level: 'error',
      module: 'Pipeline',
      message: `Research execution failed: ${error.message}`,
    });

    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to complete niche analysis.',
    }, { status: 500 });
  }
}
