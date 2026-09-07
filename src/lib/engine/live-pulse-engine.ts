import { db, readDb, writeDb } from '../db';
import { ScoringEngine, ScoringInputs } from './scoring-engine';
import {
  SavedNicheItem,
  LivePulseStatus,
  RecalculationResult,
  ViabilityVerdict,
} from '../providers/types';

export class LivePulseEngine {
  private static totalRuns = 0;
  private static recentDeltas: LivePulseStatus['recentDeltas'] = [];

  /**
   * Recalculates all saved niches dynamically, simulating real-world SERP volatility,
   * keyword drift, competitor metric shifts, and SEBT-NEXT 15-phase scoring formula.
   */
  public static recalculateAll(): {
    success: boolean;
    results: RecalculationResult[];
    status: LivePulseStatus;
  } {
    const data = readDb();
    const savedNiches = data.savedNiches || [];
    const results: RecalculationResult[] = [];
    const now = new Date().toISOString();

    if (savedNiches.length === 0) {
      return {
        success: true,
        results: [],
        status: this.getStatus(),
      };
    }

    const settings = db.getSettings();
    const weights = settings.scoringWeights;
    const avoidList = settings.avoidList || [];

    for (const niche of savedNiches) {
      const research = data.researches.find((r) => r.id === niche.researchId);
      const report = research?.report;

      const oldScore = niche.viabilityScore;
      let newScore = oldScore;
      let newVerdict = niche.verdict;
      let serpVolatility: 'Low' | 'Moderate' | 'High' = 'Low';

      if (report) {
        // Apply controlled organic volatility to inputs (simulating live index crawl updates)
        // Deterministic drift with small temporal perturbation (-2 to +2 range)
        const timeSeed = Math.sin(Date.now() / 30000 + niche.id.charCodeAt(niche.id.length - 1));
        const driftFactor = Math.round(timeSeed * 2.5);

        // Adjust trend & competitor metrics slightly
        const currentTrend = Math.max(
          20,
          Math.min(100, (report.trends?.averageInterest || 60) + driftFactor)
        );
        const totalSv = Math.max(
          1000,
          (report.searchVolume?.totalNicheSv?.value || 10000) + driftFactor * 120
        );
        const seedSv = Math.max(
          500,
          (report.searchVolume?.seedSv?.value || 2500) + driftFactor * 50
        );

        // Competitor drift
        const competitors = (report.serp?.competitors || []).map((comp, idx) => {
          const compDrift = Math.round(Math.cos(Date.now() / 40000 + idx) * 1.5);
          return {
            ...comp,
            dr: Math.max(0, Math.min(100, comp.dr + compDrift)),
            organicTraffic: Math.max(100, comp.organicTraffic + compDrift * 80),
          };
        });

        const isBlacklisted = avoidList.some((bad) =>
          niche.seedKeyword.toLowerCase().includes(bad.toLowerCase())
        );

        const evalInputs: ScoringInputs = {
          seedSv,
          totalNicheSv: totalSv,
          nicheType: report.nicheType,
          businessModel: report.businessModel,
          trendClassification: report.trends?.classification || 'Evergreen',
          averageTrendInterest: currentTrend,
          growthPercentage: (report.trends?.growthPercentage || 10) + driftFactor,
          competitors,
          intentMismatchDetected: report.intentAnalysis?.intentMismatchDetected ?? true,
          dedicatedWebsiteExists: report.dedicatedPageAudit?.dedicatedWebsiteExists ?? false,
          dedicatedLandingPageExists: report.dedicatedPageAudit?.dedicatedLandingPageExists ?? false,
          exactIntentPageExists: report.dedicatedPageAudit?.exactIntentPageExists ?? false,
          aiOverviewPresent: report.serp?.aiOverviewPresent ?? false,
          aiOverviewImpact: report.serp?.aiOverviewImpact ?? 'None',
          monetizationScore: report.monetization?.monetizationScore || 85,
          scalabilityRating: report.scalability?.rating || 'HIGH',
          isYmyl: report.riskAnalysis?.isYmyl || false,
          isBlacklisted,
          weights,
        };

        const evalResult = ScoringEngine.evaluateNiche(evalInputs);
        newScore = evalResult.finalScore;
        newVerdict = evalResult.verdict;

        // Update research report in db
        research.viabilityScore = newScore;
        research.verdict = newVerdict;
        research.updatedAt = now;
        research.report = {
          ...report,
          overallViabilityScore: newScore,
          verdict: newVerdict,
          scoreBreakdown: evalResult.scoreBreakdown,
          serp: {
            ...report.serp,
            competitors,
            medians: evalResult.medians,
            weakCompetitorCount: evalResult.weakCompetitorCount,
          },
        };
      } else {
        // Fallback subtle oscillation if no deep report found
        const drift = Math.round(Math.sin(Date.now() / 25000) * 2);
        newScore = Math.max(40, Math.min(98, oldScore + drift));
      }

      const delta = newScore - oldScore;
      serpVolatility = Math.abs(delta) >= 3 ? 'High' : Math.abs(delta) >= 1 ? 'Moderate' : 'Low';
      const momentum = delta > 0 ? 'Rising' : delta < 0 ? 'Dip' : 'Stable';

      // Update saved niche
      niche.previousScore = oldScore;
      niche.viabilityScore = newScore;
      niche.scoreDelta = delta;
      niche.verdict = newVerdict;
      niche.lastRecalculatedAt = now;
      niche.serpVolatility = serpVolatility;
      niche.demandMomentum = momentum;
      niche.updatedAt = now;

      results.push({
        nicheId: niche.id,
        researchId: niche.researchId,
        nicheName: niche.nicheName,
        oldScore,
        newScore,
        delta,
        verdict: newVerdict,
        serpVolatility,
        recalculatedAt: now,
      });

      if (delta !== 0) {
        this.recentDeltas.unshift({
          nicheId: niche.id,
          nicheName: niche.nicheName,
          oldScore,
          newScore,
          delta,
          timestamp: now,
        });
      }
    }

    // Keep recent deltas bounded
    if (this.recentDeltas.length > 20) {
      this.recentDeltas = this.recentDeltas.slice(0, 20);
    }

    this.totalRuns += 1;

    const activeDeltas = results.filter((r) => r.delta !== 0);
    if (activeDeltas.length > 0) {
      if (!data.systemLogs) data.systemLogs = [];
      data.systemLogs.unshift({
        id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        level: 'info',
        module: 'LivePulseEngine',
        message: `Dynamic recalculation shifted ${activeDeltas.length} niche scores.`,
        timestamp: now,
      });
      if (data.systemLogs.length > 100) {
        data.systemLogs = data.systemLogs.slice(0, 100);
      }
    }

    writeDb(data);

    return {
      success: true,
      results,
      status: this.getStatus(),
    };
  }

  /**
   * Recalculates an individual niche by research ID or saved niche ID
   */
  public static recalculateSingle(id: string): {
    success: boolean;
    result?: RecalculationResult;
  } {
    const data = readDb();
    const niche = data.savedNiches.find((s) => s.id === id || s.researchId === id);
    if (!niche) {
      return { success: false };
    }

    const research = data.researches.find((r) => r.id === niche.researchId);
    const report = research?.report;
    const oldScore = niche.viabilityScore;
    const now = new Date().toISOString();

    let newScore = oldScore;
    let newVerdict = niche.verdict;

    if (report) {
      const settings = db.getSettings();
      const weights = settings.scoringWeights;
      const avoidList = settings.avoidList || [];

      // Minor randomized adjustment on demand
      const randDrift = Math.random() > 0.5 ? 1 : -1;
      const evalInputs: ScoringInputs = {
        seedSv: report.searchVolume?.seedSv?.value || 2500,
        totalNicheSv: report.searchVolume?.totalNicheSv?.value || 10000,
        nicheType: report.nicheType,
        businessModel: report.businessModel,
        trendClassification: report.trends?.classification || 'Evergreen',
        averageTrendInterest: (report.trends?.averageInterest || 60) + randDrift,
        growthPercentage: report.trends?.growthPercentage || 10,
        competitors: report.serp?.competitors || [],
        intentMismatchDetected: report.intentAnalysis?.intentMismatchDetected ?? true,
        dedicatedWebsiteExists: report.dedicatedPageAudit?.dedicatedWebsiteExists ?? false,
        dedicatedLandingPageExists: report.dedicatedPageAudit?.dedicatedLandingPageExists ?? false,
        exactIntentPageExists: report.dedicatedPageAudit?.exactIntentPageExists ?? false,
        aiOverviewPresent: report.serp?.aiOverviewPresent ?? false,
        aiOverviewImpact: report.serp?.aiOverviewImpact ?? 'None',
        monetizationScore: report.monetization?.monetizationScore || 85,
        scalabilityRating: report.scalability?.rating || 'HIGH',
        isYmyl: report.riskAnalysis?.isYmyl || false,
        isBlacklisted: avoidList.some((bad) =>
          niche.seedKeyword.toLowerCase().includes(bad.toLowerCase())
        ),
        weights,
      };

      const evalResult = ScoringEngine.evaluateNiche(evalInputs);
      newScore = evalResult.finalScore;
      newVerdict = evalResult.verdict;

      research.viabilityScore = newScore;
      research.verdict = newVerdict;
      research.updatedAt = now;
      if (research.report) {
        research.report.overallViabilityScore = newScore;
        research.report.verdict = newVerdict;
        research.report.scoreBreakdown = evalResult.scoreBreakdown;
      }
    }

    const delta = newScore - oldScore;
    const serpVolatility: 'Low' | 'Moderate' | 'High' =
      Math.abs(delta) >= 3 ? 'High' : Math.abs(delta) >= 1 ? 'Moderate' : 'Low';

    niche.previousScore = oldScore;
    niche.viabilityScore = newScore;
    niche.scoreDelta = delta;
    niche.verdict = newVerdict;
    niche.lastRecalculatedAt = now;
    niche.serpVolatility = serpVolatility;
    niche.demandMomentum = delta > 0 ? 'Rising' : delta < 0 ? 'Dip' : 'Stable';
    niche.updatedAt = now;

    writeDb(data);

    const result: RecalculationResult = {
      nicheId: niche.id,
      researchId: niche.researchId,
      nicheName: niche.nicheName,
      oldScore,
      newScore,
      delta,
      verdict: newVerdict,
      serpVolatility,
      recalculatedAt: now,
    };

    return { success: true, result };
  }

  /**
   * Returns current Live Pulse Engine health and statistics
   */
  public static getStatus(): LivePulseStatus {
    const data = readDb();
    const savedNiches = data.savedNiches || [];
    const lastCalculatedItem = [...savedNiches].sort(
      (a, b) =>
        new Date(b.lastRecalculatedAt || b.updatedAt).getTime() -
        new Date(a.lastRecalculatedAt || a.updatedAt).getTime()
    )[0];

    return {
      active: true,
      intervalSeconds: 20,
      lastRunAt: lastCalculatedItem?.lastRecalculatedAt || null,
      totalRecalculations: this.totalRuns,
      activeNichesCount: savedNiches.length,
      recentDeltas: this.recentDeltas,
    };
  }
}
