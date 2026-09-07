import {
  CompetitorResult,
  MedianCompetitorStats,
  NicheType,
  BusinessModel,
  ScoringWeights,
  ViabilityVerdict,
  TrendClassification,
} from '../providers/types';

export interface ScoringInputs {
  seedSv: number;
  totalNicheSv: number;
  nicheType: NicheType;
  businessModel: BusinessModel;
  trendClassification: TrendClassification;
  averageTrendInterest: number;
  growthPercentage: number;
  competitors: CompetitorResult[];
  intentMismatchDetected: boolean;
  dedicatedWebsiteExists: boolean;
  dedicatedLandingPageExists: boolean;
  exactIntentPageExists: boolean;
  aiOverviewPresent: boolean;
  aiOverviewImpact: 'High' | 'Medium' | 'Low' | 'None';
  monetizationScore: number;
  scalabilityRating: 'HIGH' | 'MEDIUM' | 'LOW';
  isYmyl: boolean;
  isBlacklisted: boolean;
  weights?: ScoringWeights;
}

export class ScoringEngine {
  /**
   * Calculates median, min, max values for array of numbers
   */
  public static calculateStats(values: number[]): { min: number; median: number; max: number } {
    if (values.length === 0) return { min: 0, median: 0, max: 0 };
    const sorted = [...values].sort((a, b) => a - b);
    const min = sorted[0];
    const max = sorted[sorted.length - 1];
    const mid = Math.floor(sorted.length / 2);
    const median = sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
    return {
      min: Math.round(min * 10) / 10,
      median: Math.round(median * 10) / 10,
      max: Math.round(max * 10) / 10,
    };
  }

  /**
   * Computes competitor median benchmark table
   */
  public static computeCompetitorMedians(competitors: CompetitorResult[]): MedianCompetitorStats {
    return {
      dr: this.calculateStats(competitors.map((c) => c.dr || 0)),
      da: this.calculateStats(competitors.map((c) => c.da || 0)),
      pa: this.calculateStats(competitors.map((c) => c.pa || 0)),
      rd: this.calculateStats(competitors.map((c) => c.rd || 0)),
      backlinks: this.calculateStats(competitors.map((c) => c.backlinks || 0)),
      traffic: this.calculateStats(competitors.map((c) => c.organicTraffic || 0)),
      domainAgeYears: this.calculateStats(competitors.map((c) => c.domainAgeYears || 0)),
      pages: this.calculateStats(competitors.map((c) => c.estimatedPages || 0)),
      rankingKeywords: this.calculateStats(competitors.map((c) => c.rankingKeywords || 0)),
    };
  }

  /**
   * Computes SEBT-NEXT Multi-Factor Viability Score and detailed breakdown
   */
  public static evaluateNiche(inputs: ScoringInputs) {
    const weights: ScoringWeights = inputs.weights || {
      demand: 15,
      searchVolume: 10,
      trend: 10,
      serpWeakness: 15,
      competition: 10,
      intentOpportunity: 10,
      dedicatedPage: 10,
      monetization: 10,
      scalability: 5,
      aiOverviewCtr: 5,
    };

    // 1. Demand Score (0-100)
    let demandScore = 70;
    if (inputs.totalNicheSv >= 20000) demandScore = 95;
    else if (inputs.totalNicheSv >= 8000) demandScore = 85;
    else if (inputs.totalNicheSv >= 2000) demandScore = 75;
    else demandScore = 55;

    // 2. Search Volume fit for niche type (0-100)
    let searchVolumeScore = 75;
    if (inputs.nicheType === 'micro' || inputs.nicheType === 'nano') {
      if (inputs.seedSv >= 500 && inputs.seedSv <= 8000) searchVolumeScore = 95;
      else if (inputs.seedSv > 8000) searchVolumeScore = 85;
      else searchVolumeScore = 60;
    } else if (inputs.nicheType === 'menu') {
      searchVolumeScore = inputs.seedSv >= 15000 ? 95 : inputs.seedSv >= 5000 ? 75 : 50;
    } else if (inputs.nicheType === 'e-commerce') {
      searchVolumeScore = inputs.seedSv >= 500 ? 90 : 60;
    } else if (inputs.nicheType === 'affiliate') {
      searchVolumeScore = inputs.seedSv >= 1000 ? 90 : 65;
    }

    // 3. Trend Score (0-100)
    let trendScore = 70;
    if (inputs.trendClassification === 'Growing') trendScore = 95;
    else if (inputs.trendClassification === 'Evergreen') trendScore = 90;
    else if (inputs.trendClassification === 'Stable') trendScore = 80;
    else if (inputs.trendClassification === 'Seasonal') trendScore = 65;
    else if (inputs.trendClassification === 'Declining') trendScore = 35;
    else trendScore = 50;

    if (inputs.averageTrendInterest < 30) {
      trendScore = Math.max(25, trendScore - 20);
    }

    // 4. SERP Weakness Score (0-100) -> Target: >= 3 beatable websites
    const weakCompetitorCount = inputs.competitors.filter((c) => c.isWeakCompetitor).length;
    let serpWeaknessScore = 40;
    if (weakCompetitorCount >= 5) serpWeaknessScore = 100;
    else if (weakCompetitorCount >= 4) serpWeaknessScore = 90;
    else if (weakCompetitorCount >= 3) serpWeaknessScore = 80;
    else if (weakCompetitorCount === 2) serpWeaknessScore = 60;
    else if (weakCompetitorCount === 1) serpWeaknessScore = 45;
    else serpWeaknessScore = 25;

    // 5. Competition & Median DR/RD (0-100)
    const medians = this.computeCompetitorMedians(inputs.competitors);
    let competitionScore = 50;
    if (medians.dr.median < 18) competitionScore = 95;
    else if (medians.dr.median < 25) competitionScore = 85;
    else if (medians.dr.median < 35) competitionScore = 70;
    else if (medians.dr.median < 50) competitionScore = 50;
    else competitionScore = 30;

    if (medians.rd.median < 20) competitionScore = Math.min(100, competitionScore + 10);

    // 6. Search Intent Opportunity (0-100)
    let intentOpportunityScore = 60;
    if (inputs.intentMismatchDetected) {
      intentOpportunityScore = 95; // Intent gap is a massive SEO ranking opportunity!
    } else {
      const forumCount = inputs.competitors.filter((c) => c.pageType === 'forum').length;
      if (forumCount >= 2) intentOpportunityScore = 90;
      else if (forumCount === 1) intentOpportunityScore = 80;
      else intentOpportunityScore = 65;
    }

    // 7. Dedicated Page Opportunity (0-100)
    let dedicatedPageScore = 60;
    if (!inputs.dedicatedWebsiteExists && !inputs.dedicatedLandingPageExists) {
      dedicatedPageScore = 95; // Huge opportunity for a focused site
    } else if (!inputs.exactIntentPageExists) {
      dedicatedPageScore = 85;
    } else if (inputs.dedicatedLandingPageExists && !inputs.dedicatedWebsiteExists) {
      dedicatedPageScore = 70;
    } else {
      dedicatedPageScore = 40; // Heavy exact match competitors already exist
    }

    // 8. Monetization Score (0-100)
    const monetizationScore = Math.min(100, Math.max(20, inputs.monetizationScore || 70));

    // 9. Scalability Score (0-100)
    let scalabilityScore = 70;
    if (inputs.scalabilityRating === 'HIGH') scalabilityScore = 95;
    else if (inputs.scalabilityRating === 'MEDIUM') scalabilityScore = 75;
    else scalabilityScore = 45;

    // 10. AI Overview & CTR Preservation (0-100)
    let aiOverviewCtrScore = 85;
    if (!inputs.aiOverviewPresent || inputs.aiOverviewImpact === 'None') {
      aiOverviewCtrScore = 95;
    } else if (inputs.aiOverviewImpact === 'Low') {
      aiOverviewCtrScore = 80;
    } else if (inputs.aiOverviewImpact === 'Medium') {
      aiOverviewCtrScore = 60;
    } else {
      aiOverviewCtrScore = 40;
    }

    // Apply SEBT-NEXT Rule: Calculate weighted composite
    const totalWeight =
      weights.demand +
      weights.searchVolume +
      weights.trend +
      weights.serpWeakness +
      weights.competition +
      weights.intentOpportunity +
      weights.dedicatedPage +
      weights.monetization +
      weights.scalability +
      weights.aiOverviewCtr;

    const weightedScore =
      (demandScore * weights.demand +
        searchVolumeScore * weights.searchVolume +
        trendScore * weights.trend +
        serpWeaknessScore * weights.serpWeakness +
        competitionScore * weights.competition +
        intentOpportunityScore * weights.intentOpportunity +
        dedicatedPageScore * weights.dedicatedPage +
        monetizationScore * weights.monetization +
        scalabilityScore * weights.scalability +
        aiOverviewCtrScore * weights.aiOverviewCtr) /
      (totalWeight || 100);

    let finalScore = Math.round(weightedScore);

    // Hard avoid for blacklisted niches
    if (inputs.isBlacklisted) {
      finalScore = Math.min(30, finalScore);
    }

    // Verdict assignment
    let verdict: ViabilityVerdict = 'MAYBE';
    if (inputs.isBlacklisted) {
      verdict = 'AVOID';
    } else if (finalScore >= 88) {
      verdict = 'STRONG GO';
    } else if (finalScore >= 78) {
      verdict = 'GO';
    } else if (finalScore >= 68) {
      verdict = 'MAYBE';
    } else if (finalScore >= 55) {
      verdict = 'RESEARCH MORE';
    } else {
      verdict = 'AVOID';
    }

    // Generate 3-7 Evidence-Based Reasons
    const keyReasons: string[] = [];
    if (weakCompetitorCount >= 3) {
      keyReasons.push(`Identified ${weakCompetitorCount} beatable competitors in top 10 positions.`);
    }
    if (medians.dr.median <= 24) {
      keyReasons.push(`Low median competitor DR (${medians.dr.median}), allowing new domains to rank faster.`);
    }
    if (!inputs.dedicatedWebsiteExists && !inputs.dedicatedLandingPageExists) {
      keyReasons.push('Zero dedicated exact-match websites or landing pages currently dominating the SERP.');
    }
    if (inputs.intentMismatchDetected) {
      keyReasons.push('Significant search intent gap: ranking pages fail to provide focused, specialized solutions.');
    }
    if (inputs.trendClassification === 'Evergreen' || inputs.trendClassification === 'Growing') {
      keyReasons.push(`Strong demand stability (${inputs.trendClassification} trend) with consistent monthly volume.`);
    }
    if (monetizationScore >= 80) {
      keyReasons.push('High monetization potential with multiple viable revenue streams.');
    }
    if (!inputs.aiOverviewPresent || inputs.aiOverviewImpact === 'Low') {
      keyReasons.push('Favorable organic CTR environment with minimal AI Overview click cannibalization.');
    }

    // Ensure at least 3 reasons
    if (keyReasons.length < 3) {
      keyReasons.push(`Total aggregate niche search demand reaches ${inputs.totalNicheSv.toLocaleString()} monthly searches.`);
      keyReasons.push(`Realistic opportunity for a topical authority site with ${inputs.scalabilityRating.toLowerCase()} scalability.`);
    }

    // Main Risks
    const mainRisks: string[] = [];
    if (medians.dr.median > 40) {
      mainRisks.push(`High authority competitors (Median DR ${medians.dr.median}) require superior topical authority.`);
    }
    if (inputs.trendClassification === 'Seasonal') {
      mainRisks.push('Seasonality may lead to revenue fluctuations during off-peak quarters.');
    }
    if (inputs.aiOverviewPresent && inputs.aiOverviewImpact === 'High') {
      mainRisks.push('Prominent AI Overview snapshot may compress top 3 organic CTR for generic informational queries.');
    }
    if (inputs.isYmyl) {
      mainRisks.push('YMYL classification requires high E-E-A-T credentials and author verification.');
    }
    if (mainRisks.length === 0) {
      mainRisks.push('Competitors may update thin content as niche awareness expands.');
      mainRisks.push('Requires building 15-20 specialized topical cluster pages to establish authority.');
    }

    // Next Validation Steps
    const whatToValidateNext: string[] = [
      'Perform manual content audit on top 3 ranking competitor URLs.',
      'Check affiliate program commission rates and merchant approval criteria.',
      'Draft initial 5-pillar topical cluster content outline.',
      'Inspect backlink acquisition velocity of youngest ranking competitor.',
    ];

    const rationale = `${verdict} with an overall viability score of ${finalScore}/100. ${
      keyReasons.slice(0, 3).join(' ')
    }`;

    return {
      finalScore,
      verdict,
      rationale,
      keyReasons,
      mainRisks,
      whatToValidateNext,
      medians,
      weakCompetitorCount,
      scoreBreakdown: {
        demandScore,
        searchVolumeScore,
        trendScore,
        serpWeaknessScore,
        competitionScore,
        intentOpportunityScore,
        dedicatedPageScore,
        monetizationScore,
        scalabilityScore,
        aiOverviewCtrScore,
      },
    };
  }
}
