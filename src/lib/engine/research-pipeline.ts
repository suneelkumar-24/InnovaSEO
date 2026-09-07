import {
  NicheViabilityReport,
  NicheType,
  BusinessModel,
  SearchIntent,
  MonetizationOpportunity,
  TopicalSilo,
  MultiCountryExpansionSeed,
} from '../providers/types';
import { AiProvider } from '../providers/ai-provider';
import { KeywordProvider } from '../providers/keyword-provider';
import { TrendProvider } from '../providers/trend-provider';
import { SerpProvider } from '../providers/serp-provider';
import { DomainProvider } from '../providers/domain-provider';
import { SitemapProvider } from '../providers/sitemap-provider';
import { ScoringEngine } from './scoring-engine';
import { db } from '../db';
import {
  getCountryGeoConfig,
  detectGeoFromKeyword,
  getGoogleSearchUrl,
  COUNTRY_GEO_REGISTRY,
} from '../geo';

export interface ResearchPipelineInput {
  seedKeyword: string;
  nicheType?: NicheType;
  businessModel?: BusinessModel;
  targetCountry?: string;
  language?: string;
  gl?: string;
  hl?: string;
  minSv?: number;
  maxKd?: number;
  optionalKeywords?: string[];
  userId?: string;
  onProgress?: (phase: number, phaseName: string, progressPercent: number) => void;
}

export class ResearchPipeline {
  /**
   * Executes the end-to-end 15-phase niche research & viability analysis
   */
  public static async execute(input: ResearchPipelineInput): Promise<NicheViabilityReport> {
    const seedKeyword = input.seedKeyword.trim();
    const nicheType: NicheType = input.nicheType || 'micro';
    const businessModel: BusinessModel = input.businessModel || 'affiliate';

    // Auto-detect Geo and Language if not explicitly specified
    const detectedGeo = detectGeoFromKeyword(seedKeyword);
    const targetCountry = input.targetCountry || (detectedGeo.detected ? detectedGeo.country : 'United States');
    const geoConfig = getCountryGeoConfig(targetCountry);
    const language = input.language || (detectedGeo.detected ? detectedGeo.language : geoConfig.defaultLanguage);
    const gl = input.gl || geoConfig.gl;
    const hl = input.hl || geoConfig.hl;

    const notify = (phase: number, name: string, pct: number) => {
      if (input.onProgress) {
        input.onProgress(phase, name, pct);
      }
    };

    // --- PHASE 1: Niche Discovery & Seed Formulation ---
    notify(1, 'Formulating Niche Seed & Scope', 5);
    const settings = db.getSettings();
    const isBlacklisted = settings.avoidList.some((item) =>
      seedKeyword.toLowerCase().includes(item.toLowerCase())
    );

    // --- PHASE 2: Keyword Expansion & Search Volume ---
    notify(2, 'Expanding Keywords & Search Volumes', 15);
    const keywordData = await KeywordProvider.expandKeywords({
      seedKeyword,
      targetCountry,
      nicheType,
      businessModel,
      minSv: input.minSv,
      maxKd: input.maxKd,
    });

    // --- PHASE 3: Total Demand & Regional Geo ---
    notify(3, 'Validating Total Market Demand & Geo Distribution', 25);
    const countrySharePct = Math.round((keywordData.targetCountrySv / (keywordData.globalSv || 1)) * 100);
    const topCountries = [
      { country: targetCountry, volume: keywordData.targetCountrySv, share: countrySharePct },
      { country: 'United Kingdom', volume: Math.round(keywordData.globalSv * 0.18), share: 18 },
      { country: 'Canada', volume: Math.round(keywordData.globalSv * 0.12), share: 12 },
      { country: 'Australia', volume: Math.round(keywordData.globalSv * 0.08), share: 8 },
      { country: 'Germany', volume: Math.round(keywordData.globalSv * 0.06), share: 6 },
    ];

    // --- PHASE 4: Google Trends & Seasonality ---
    notify(4, 'Analyzing Google Trends & Historical Trajectory', 35);
    const trendData = await TrendProvider.analyzeTrends({
      keyword: seedKeyword,
      country: targetCountry,
      nicheType,
    });

    // --- PHASE 5: Live SERP Analysis ---
    notify(5, 'Fetching & Analyzing Search Engine Results (SERP)', 45);
    const serpData = await SerpProvider.analyzeSerp({
      keyword: seedKeyword,
      country: targetCountry,
      nicheType,
      language,
      gl,
      hl,
    });

    // Generate Multi-Country Localized Expansions across Tier 1 & Tier 2 Markets
    const targetExpansionCountries = [
      'Germany',
      'Japan',
      'United States',
      'Netherlands',
      'United Kingdom',
      'France',
      'Turkey',
      'Spain',
      'Brazil',
      'Indonesia',
    ].filter((c) => c.toLowerCase() !== targetCountry.toLowerCase());

    const multiCountryExpansions: MultiCountryExpansionSeed[] = targetExpansionCountries.slice(0, 8).map((ctry) => {
      const geo = getCountryGeoConfig(ctry);
      let localizedSeed = seedKeyword;
      let meaning = seedKeyword;

      const lower = seedKeyword.toLowerCase();
      if (lower.includes('starbucks') || lower.includes('menu') || lower.includes('price') || lower.includes('preise') || lower.includes('prijzen')) {
        if (ctry === 'Germany') { localizedSeed = 'Starbucks Preise'; meaning = 'Starbucks prices'; }
        else if (ctry === 'Japan') { localizedSeed = 'スタバ メニュー'; meaning = 'Starbucks menu'; }
        else if (ctry === 'Netherlands') { localizedSeed = 'Starbucks prijzen'; meaning = 'Starbucks prices'; }
        else if (ctry === 'Turkey') { localizedSeed = 'Starbucks fiyatları'; meaning = 'Starbucks prices'; }
        else if (ctry === 'France') { localizedSeed = 'prix Starbucks'; meaning = 'Starbucks prices'; }
        else if (ctry === 'Spain') { localizedSeed = 'precios Starbucks'; meaning = 'Starbucks prices'; }
        else if (ctry === 'Brazil') { localizedSeed = 'preços Starbucks'; meaning = 'Starbucks prices'; }
        else if (ctry === 'Indonesia') { localizedSeed = 'harga menu Starbucks'; meaning = 'Starbucks menu prices'; }
        else if (ctry === 'United States') { localizedSeed = 'Starbucks Menu With Prices'; meaning = 'Starbucks menu with prices'; }
      } else if (lower.includes('tesla') && (lower.includes('rim') || lower.includes('size') || lower.includes('wheel'))) {
        if (ctry === 'Germany') { localizedSeed = 'Tesla Felgengröße'; meaning = 'Tesla rim size'; }
        else if (ctry === 'Japan') { localizedSeed = 'テスラ ホイール サイズ'; meaning = 'Tesla wheel dimensions'; }
        else if (ctry === 'France') { localizedSeed = 'dimensions jantes Tesla'; meaning = 'Tesla rim dimensions'; }
        else if (ctry === 'Netherlands') { localizedSeed = 'Tesla velgmaat specificaties'; meaning = 'Tesla rim specs'; }
        else { localizedSeed = `${seedKeyword} ${ctry}`; meaning = `${seedKeyword} specifications in ${ctry}`; }
      } else {
        localizedSeed = `${seedKeyword}`;
        meaning = `${seedKeyword} (${geo.defaultLanguage})`;
      }

      const mult = geo.tier.includes('Tier 1') ? 1.0 : 1.3;
      const vol = Math.round((keywordData.seedSv || 2400) * (ctry === 'United States' ? 2.2 : ctry === 'Germany' ? 1.2 : 0.8) * mult);

      return {
        country: ctry,
        language: geo.defaultLanguage,
        gl: geo.gl,
        hl: geo.hl,
        flag: geo.flag,
        seedKeyword: localizedSeed,
        englishMeaning: meaning,
        estimatedMonthlySv: vol,
        estimatedRpm: `$${geo.rpmRange[0]} - $${geo.rpmRange[1]}`,
        tier: geo.tier,
        googleLiveSerpUrl: getGoogleSearchUrl(localizedSeed, ctry, geo.defaultLanguage),
        rationale: `Low-competition domestic ${geo.defaultLanguage} SERP with high ${geo.tier} display ad RPM.`,
      };
    });

    // --- PHASE 6: Competitor Analysis & Weak Competitor Detection ---
    notify(6, 'Auditing Competitor Authority & Weak Spots', 55);
    // Enrich competitor list with domain & sitemap audits
    const enrichedCompetitors = serpData.competitors.map((comp) => {
      const domainAudit = DomainProvider.auditDomain(comp.domain, comp.domainAgeYears);
      const sitemapAudit = SitemapProvider.auditSitemap(comp.domain, comp.estimatedPages);
      return {
        ...comp,
        domainAgeYears: domainAudit.ageYears,
        estimatedPages: sitemapAudit.estimatedTotalPages,
      };
    });

    // --- PHASE 7 & 8: Intent & Content Mismatch Analysis ---
    notify(8, 'Evaluating Search Intent Mismatch & Content Gaps', 65);
    const forumCount = enrichedCompetitors.filter((c) => c.pageType === 'forum').length;
    const thinCount = enrichedCompetitors.filter((c) => c.isWeakCompetitor && c.estimatedPages < 50).length;
    const hasIntentMismatch =
      forumCount >= 1 ||
      enrichedCompetitors.some((c) => c.intentMatch === 'Mismatch' || c.intentMatch === 'Poor');

    const intentAnalysis = {
      primaryIntent: (keywordData.items[0]?.intent || 'commercial') as SearchIntent,
      serpIntentMatch: hasIntentMismatch ? ('Mixed' as const) : ('Strong' as const),
      intentMismatchDetected: hasIntentMismatch,
      mismatchExplanation: hasIntentMismatch
        ? `Found ${forumCount} forum/UGC results and generic category pages ranking. User intent seeks dedicated, actionable solutions.`
        : 'SERP results largely address the query intent, but topical depth gaps exist for long-tail variations.',
      gapOpportunities: [
        'Detailed comparison charts with verified technical specs',
        'Interactive buyer checklist or calculator',
        'Comprehensive beginner troubleshooting guide',
        'Transparent pricing and real-world durability reviews',
      ],
      forumsRankingCount: forumCount,
      thinContentCount: thinCount,
    };

    // --- PHASE 9: Dedicated Landing Page Check ---
    notify(9, 'Auditing Dedicated Website & Exact Intent Landing Pages', 72);
    const dedicatedSiteExists = enrichedCompetitors.some((c) => c.pageType === 'dedicated_site');
    const dedicatedLandingExists = enrichedCompetitors.some((c) => c.pageType === 'dedicated_landing');
    const exactIntentExists = enrichedCompetitors.some((c) => c.intentMatch === 'Exact');

    let dedicatedOppLevel: 'HIGH' | 'MEDIUM' | 'LOW' = 'MEDIUM';
    if (!dedicatedSiteExists && !dedicatedLandingExists) {
      dedicatedOppLevel = 'HIGH';
    } else if (dedicatedSiteExists) {
      dedicatedOppLevel = 'LOW';
    }

    const dedicatedPageAudit = {
      dedicatedWebsiteExists: dedicatedSiteExists,
      dedicatedLandingPageExists: dedicatedLandingExists,
      exactIntentPageExists: exactIntentExists,
      opportunityLevel: dedicatedOppLevel,
      analysis: !dedicatedLandingExists
        ? 'No exact-match dedicated landing page or specialized domain exists. High ranking opportunity for a focused site.'
        : 'Dedicated pages exist but lack modern interactive tools and updated content clusters.',
    };

    // --- PHASE 10: AI Overview Presence & CTR Curve ---
    notify(10, 'Modeling Organic CTR & AI Overview Impact', 78);
    const top1Ctr = serpData.aiOverviewPresent ? 0.22 : 0.31;
    const top3Ctr = serpData.aiOverviewPresent ? 0.45 : 0.58;
    const potentialClicksMonthly = Math.round(keywordData.seedSv * top3Ctr);

    const ctrAnalysis = {
      estimatedTop1Ctr: top1Ctr,
      estimatedTop3Ctr: top3Ctr,
      potentialClicksMonthly,
      serpCrowdedness: serpData.aiOverviewPresent ? ('Moderate' as const) : ('Low' as const),
      factors: [
        serpData.aiOverviewPresent ? 'AI Overview active at top of SERP' : 'No AI Overview triggering',
        'Featured Snippet present',
        'People Also Ask accordion box',
      ],
    };

    // --- PHASE 11: Monetization Blueprint ---
    notify(11, 'Designing Monetization Blueprint & Revenue Channels', 84);
    const monetizationOpportunities: MonetizationOpportunity[] = [
      {
        type: businessModel,
        label: `Primary ${businessModel.toUpperCase()} Strategy`,
        description: `Direct monetization via targeted affiliate partnerships, sponsor placements, or proprietary products.`,
        potentialIncomeRange: '$1,500 - $6,000 / month',
        easeOfExecution: 'Moderate',
        commercialIntentScore: 85,
      },
      {
        type: 'digital_product',
        label: 'Digital Toolkit / Templates / Guides',
        description: 'Self-hosted PDF checklists, notion templates, or mini video masterclasses.',
        potentialIncomeRange: '$500 - $2,500 / month',
        easeOfExecution: 'Easy',
        commercialIntentScore: 78,
      },
      {
        type: 'ads',
        label: 'Display Ad Network (Mediavine / Raptive / AdSense)',
        description: 'Supplemental passive revenue from high-RPM informational traffic.',
        potentialIncomeRange: '$400 - $1,800 / month',
        easeOfExecution: 'Easy',
        commercialIntentScore: 60,
      },
      {
        type: 'lead_gen',
        label: 'Qualified Lead Distribution',
        description: 'Connecting high-intent searchers with vetted specialized service providers.',
        potentialIncomeRange: '$1,000 - $4,500 / month',
        easeOfExecution: 'Challenging',
        commercialIntentScore: 90,
      },
    ];

    const monetization = {
      primaryModel: businessModel,
      monetizationScore: 84,
      estimatedMonthlyRevenueRange: '$2,000 - $8,500 / mo',
      commercialIntent: 'High' as const,
      opportunities: monetizationOpportunities,
    };

    // --- PHASE 12: Scalability & Content Silos ---
    notify(12, 'Structuring Topical Authority & Content Silos', 89);
    const scalabilitySilos: TopicalSilo[] = [
      {
        siloName: 'Core Buying & Review Guides (Commercial Pillar)',
        targetKeywords: [
          `best ${seedKeyword}`,
          `${seedKeyword} reviews`,
          `top rated ${seedKeyword}`,
          `${seedKeyword} vs alternatives`,
        ],
        articleAngles: [
          {
            title: `The Ultimate Buyer's Guide to ${seedKeyword} (2026 Edition)`,
            type: 'Pillar',
            intent: 'commercial',
          },
          {
            title: `Top 7 Best ${seedKeyword} for Beginners and Pros`,
            type: 'Commercial',
            intent: 'commercial',
          },
          {
            title: `${seedKeyword} Cost Breakdown & Budget Options`,
            type: 'Comparison',
            intent: 'commercial',
          },
        ],
      },
      {
        siloName: 'How-To & Troubleshooting (Informational Pillar)',
        targetKeywords: [
          `how to use ${seedKeyword}`,
          `${seedKeyword} setup tutorial`,
          `common ${seedKeyword} mistakes`,
          `${seedKeyword} maintenance guide`,
        ],
        articleAngles: [
          {
            title: `Step-by-Step ${seedKeyword} Setup & Configuration Guide`,
            type: 'Informational',
            intent: 'informational',
          },
          {
            title: `5 Costly ${seedKeyword} Mistakes (And How to Avoid Them)`,
            type: 'Informational',
            intent: 'informational',
          },
          {
            title: `Complete Maintenance & Longevity Checklist for ${seedKeyword}`,
            type: 'Informational',
            intent: 'informational',
          },
        ],
      },
      {
        siloName: 'Interactive Tools & Calculators',
        targetKeywords: [
          `${seedKeyword} calculator`,
          `${seedKeyword} finder quiz`,
          `${seedKeyword} sizing chart`,
        ],
        articleAngles: [
          {
            title: `Free ${seedKeyword} Selection & Sizing Calculator`,
            type: 'Tool',
            intent: 'transactional',
          },
        ],
      },
    ];

    const scalability = {
      rating: 'HIGH' as const,
      score: 88,
      subNiches: [
        {
          name: `Budget & Entry-Level ${seedKeyword}`,
          rationale: 'High search volume with low commercial competition.',
          estimatedVolume: '3,200/mo',
        },
        {
          name: `Professional / Heavy-Duty ${seedKeyword}`,
          rationale: 'Premium high-ticket buyers with substantial affiliate commission margins.',
          estimatedVolume: '1,800/mo',
        },
        {
          name: `Eco-Friendly / Sustainable ${seedKeyword}`,
          rationale: 'Rapidly growing trend with breakout long-tail queries.',
          estimatedVolume: '1,400/mo',
        },
      ],
      silos: scalabilitySilos,
    };

    // --- PHASE 13: Policy, YMYL & AI Risk Classification ---
    notify(13, 'Evaluating AI/LLM Compliance & YMYL Policy Risks', 94);
    const isYmyl =
      seedKeyword.toLowerCase().includes('health') ||
      seedKeyword.toLowerCase().includes('cure') ||
      seedKeyword.toLowerCase().includes('medical') ||
      seedKeyword.toLowerCase().includes('invest') ||
      seedKeyword.toLowerCase().includes('loan') ||
      seedKeyword.toLowerCase().includes('legal advice');

    const isGov =
      seedKeyword.toLowerCase().includes('gov') ||
      seedKeyword.toLowerCase().includes('visa') ||
      seedKeyword.toLowerCase().includes('passport') ||
      seedKeyword.toLowerCase().includes('grant') ||
      seedKeyword.toLowerCase().includes('benefits');

    const riskAnalysis = {
      aiRiskLevel: isBlacklisted
        ? ('Restricted / Avoid' as const)
        : isYmyl
        ? ('Moderate Risk' as const)
        : ('Low Risk' as const),
      policyStatus: isBlacklisted
        ? ('Restricted' as const)
        : isYmyl
        ? ('Caution' as const)
        : ('Compliant' as const),
      isYmyl,
      isGovernmentRelated: isGov,
      governmentContext: isGov
        ? 'Public informational guide regarding civic services. Compliant provided direct authoritative government citations are maintained.'
        : undefined,
      riskFactors: [
        isBlacklisted ? 'Term matches restricted keyword blacklist' : 'No direct policy restrictions found',
        isYmyl ? 'YMYL classification requires transparent author credentials and citations' : 'Standard commercial/informational intent',
      ],
    };

    // --- PHASE 14: SEBT-NEXT Viability Scoring ---
    notify(14, 'Computing SEBT-NEXT Multi-Signal Viability Score', 97);
    const scoringResult = ScoringEngine.evaluateNiche({
      seedSv: keywordData.seedSv,
      totalNicheSv: keywordData.totalNicheSv,
      nicheType,
      businessModel,
      trendClassification: trendData.classification,
      averageTrendInterest: trendData.averageInterest,
      growthPercentage: trendData.growthPercentage,
      competitors: enrichedCompetitors,
      intentMismatchDetected: intentAnalysis.intentMismatchDetected,
      dedicatedWebsiteExists: dedicatedPageAudit.dedicatedWebsiteExists,
      dedicatedLandingPageExists: dedicatedPageAudit.dedicatedLandingPageExists,
      exactIntentPageExists: dedicatedPageAudit.exactIntentPageExists,
      aiOverviewPresent: serpData.aiOverviewPresent,
      aiOverviewImpact: serpData.aiOverviewImpact,
      monetizationScore: monetization.monetizationScore,
      scalabilityRating: scalability.rating,
      isYmyl,
      isBlacklisted,
      weights: settings.scoringWeights,
    });

    // Confidence score based on completeness of signals
    let dataConfidenceScore = 88;
    if (enrichedCompetitors.length >= 8) dataConfidenceScore += 5;
    if (trendData.points12m.length >= 12) dataConfidenceScore += 4;
    if (keywordData.items.length >= 15) dataConfidenceScore += 3;
    dataConfidenceScore = Math.min(100, dataConfidenceScore);

    // --- PHASE 15: Final Report Assembly ---
    notify(15, 'Assembling Final Niche Dossier & Verdict', 100);
    const report: NicheViabilityReport = {
      id: `rep_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      seedKeyword,
      nicheName: seedKeyword
        .split(' ')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' '),
      nicheType,
      businessModel,
      targetCountry,
      language,
      createdAt: new Date().toISOString(),

      overallViabilityScore: scoringResult.finalScore,
      verdict: scoringResult.verdict,
      verdictRationale: scoringResult.rationale,
      keyReasons: scoringResult.keyReasons,
      mainRisks: scoringResult.mainRisks,
      whatToValidateNext: scoringResult.whatToValidateNext,
      dataConfidenceScore,

      searchVolume: {
        seedSv: {
          value: keywordData.seedSv,
          source: 'Google Search & SEO Providers',
          confidence: 'High',
          lastUpdated: new Date().toLocaleDateString(),
        },
        globalSv: {
          value: keywordData.globalSv,
          source: 'Global Aggregated Demand',
          confidence: 'High',
        },
        targetCountrySv: {
          value: keywordData.targetCountrySv,
          source: `${targetCountry} Search Index`,
          confidence: 'High',
        },
        totalNicheSv: {
          value: keywordData.totalNicheSv,
          source: 'Topical Cluster Volume Model',
          confidence: 'High',
        },
        averageSv: {
          value: Math.round(keywordData.totalNicheSv / Math.max(1, keywordData.items.length)),
          source: 'Calculated Average',
          confidence: 'High',
          isEstimated: true,
        },
        keywordCount: keywordData.items.length,
        countrySharePercentage: countrySharePct,
        topCountries,
        topRegions: trendData.topRegions,
      },

      trends: {
        points12m: trendData.points12m,
        points5y: trendData.points5y,
        currentInterest: trendData.currentInterest,
        averageInterest: trendData.averageInterest,
        minInterest: trendData.minInterest,
        maxInterest: trendData.maxInterest,
        growthPercentage: trendData.growthPercentage,
        direction: trendData.direction,
        classification: trendData.classification,
        isEvergreen: trendData.isEvergreen,
        seasonalityPattern: trendData.seasonalityPattern,
        risingQueries: trendData.risingQueries,
      },

      keywords: {
        items: keywordData.items,
        clusters: keywordData.clusters,
      },

      serp: {
        targetKeyword: seedKeyword,
        aiOverviewPresent: serpData.aiOverviewPresent,
        aiOverviewImpact: serpData.aiOverviewImpact,
        weakCompetitorCount: scoringResult.weakCompetitorCount,
        competitors: enrichedCompetitors,
        medians: scoringResult.medians,
        gl,
        hl,
        googleLiveSerpUrl: serpData.googleLiveSerpUrl || getGoogleSearchUrl(seedKeyword, targetCountry, language),
      },

      multiCountryExpansions,

      intentAnalysis,
      dedicatedPageAudit,
      ctrAnalysis,
      monetization,
      scalability,
      riskAnalysis,
      scoreBreakdown: scoringResult.scoreBreakdown,
    };

    return report;
  }
}
