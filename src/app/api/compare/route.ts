import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { NicheViabilityReport } from '@/lib/providers/types';
import { getUserFromRequest } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized. Please log in.' }, { status: 401 });
    }

    const { researchIds } = await req.json();

    if (!Array.isArray(researchIds) || researchIds.length < 2) {
      return NextResponse.json({ success: false, error: 'Please select at least 2 niches to compare.' }, { status: 400 });
    }

    const reports: NicheViabilityReport[] = [];
    for (const id of researchIds) {
      const item = db.getResearchById(id, user.id);
      if (item && item.report) {
        reports.push(item.report);
      }
    }

    if (reports.length < 2) {
      return NextResponse.json({ success: false, error: 'Could not find complete reports for selected niches.' }, { status: 404 });
    }

    // Determine Winner based on Viability Score & SEBT-NEXT criteria
    let winner = reports[0];
    for (const rep of reports) {
      if (rep.overallViabilityScore > winner.overallViabilityScore) {
        winner = rep;
      }
    }

    const winnerReasons = [
      `Highest overall viability score (${winner.overallViabilityScore}/100) with ${winner.verdict} verdict.`,
      `Identified ${winner.serp.weakCompetitorCount} beatable ranking competitors with low median DR (${winner.serp.medians.dr.median}).`,
      `Strong demand: ${winner.searchVolume.totalNicheSv.value.toLocaleString()} monthly aggregate search volume with ${winner.trends.classification} trajectory.`,
    ];

    return NextResponse.json({
      success: true,
      reports,
      winnerId: winner.id,
      winnerName: winner.nicheName,
      winnerReasons,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
