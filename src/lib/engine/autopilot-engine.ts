import { db, readDb, writeDb } from '../db';
import { ResearchPipeline } from './research-pipeline';
import { AiProvider } from '../providers/ai-provider';
import {
  AutopilotConfig,
  AutopilotDiscoveredItem,
  AutopilotSector,
  AutopilotStatus,
  NicheType,
  BusinessModel,
  getCountryTierInfo,
} from '../providers/types';

interface CandidateSeedTemplate {
  seed: string;
  nicheName: string;
  sector: AutopilotSector;
  sectorLabel: string;
  nicheType: NicheType;
  businessModel: BusinessModel;
  country: string;
  rpmRange: string;
  whyUntapped: string;
  recommendedAsset: string;
}

const AUTOPILOT_CANDIDATE_BANK: CandidateSeedTemplate[] = [
  // 1. Challenger Brands (Fast $500/mo, zero AI overview, low DR anomalies)
  {
    seed: 'popeyes nutrition and allergen menu',
    nicheName: 'Popeyes Nutrition & Allergen Specs',
    sector: 'challenger_brands',
    sectorLabel: 'Challenger Brand Menus',
    nicheType: 'menu',
    businessModel: 'ads',
    country: 'United States',
    rpmRange: '$38 - $52 RPM',
    whyUntapped: 'DR 0-5 fan blogs rank above official slow PDF menus. High search demand for low-sodium and gluten-free fast food breakdowns.',
    recommendedAsset: 'Programmatic Menu & Calorie Database (500+ items)',
  },
  {
    seed: 'starbucks preise und speisekarte',
    nicheName: 'Starbucks Preise & Kalorien',
    sector: 'challenger_brands',
    sectorLabel: 'Challenger Brand Menus',
    nicheType: 'menu',
    businessModel: 'ads',
    country: 'Germany',
    rpmRange: '$32 - $48 RPM',
    whyUntapped: 'Official German site lacks unified price tables. DR 8 micro-site captures 35k monthly visits without AI Overview compression.',
    recommendedAsset: 'Programmatic Price Matrix with Size Switcher',
  },
  {
    seed: 'little caesars calories and pizza sizes',
    nicheName: 'Little Caesars Pizza Calories & Dimensions',
    sector: 'challenger_brands',
    sectorLabel: 'Challenger Brand Menus',
    nicheType: 'menu',
    businessModel: 'ads',
    country: 'United States',
    rpmRange: '$34 - $46 RPM',
    whyUntapped: 'Low competition for exact slice-by-slice calorie calculators; massive search volume in US Tier 1 states.',
    recommendedAsset: 'Single-Page Interactive Slice Calculator',
  },
  {
    seed: 'tim hortons drink nutrition and syrup calories',
    nicheName: 'Tim Hortons Drink Customizer Calories',
    sector: 'challenger_brands',
    sectorLabel: 'Challenger Brand Menus',
    nicheType: 'menu',
    businessModel: 'ads',
    country: 'Canada',
    rpmRange: '$30 - $44 RPM',
    whyUntapped: 'Massive Canadian search volume with only outdated Reddit threads and slow corporate PDF tables ranking.',
    recommendedAsset: 'Custom Drink Builder & Calorie Estimator',
  },
  {
    seed: 'culvers flavor of the day calendar and calories',
    nicheName: "Culver's Custard Flavor Tracker & Nutrition",
    sector: 'challenger_brands',
    sectorLabel: 'Challenger Brand Menus',
    nicheType: 'menu',
    businessModel: 'ads',
    country: 'United States',
    rpmRange: '$32 - $45 RPM',
    whyUntapped: 'Midwest US cult following searching daily for flavor rotations with thin local competitor pages.',
    recommendedAsset: 'Daily Flavor Push Tracker & Nutri-Guide',
  },

  // 2. Programmatic Data & Specs (Zero AI Overview risk, high ad RPM)
  {
    seed: 'tesla model 3 rim dimensions and offset',
    nicheName: 'Tesla Rim Dimensions & Bolt Patterns',
    sector: 'programmatic_data',
    sectorLabel: 'Programmatic Specs',
    nicheType: 'utility',
    businessModel: 'ads',
    country: 'United States',
    rpmRange: '$36 - $52 RPM',
    whyUntapped: 'Forum threads rank #1-#3. Users want instant search filter for aftermarket wheel clearance without scrolling threads.',
    recommendedAsset: 'Programmatic EV Wheel Fitment Matrix (300+ models)',
  },
  {
    seed: 'ford f150 bolt pattern and lug torque specs',
    nicheName: 'Ford F-150 Lug Torque & Bolt Guide',
    sector: 'programmatic_data',
    sectorLabel: 'Programmatic Specs',
    nicheType: 'utility',
    businessModel: 'ads',
    country: 'United States',
    rpmRange: '$38 - $50 RPM',
    whyUntapped: 'High intent DIY truck owners seeking exact torque specs by year. Clean table layout beats bloated auto blogs.',
    recommendedAsset: 'Year-by-Year Torque Spec Database',
  },
  {
    seed: 'shipping container interior dimensions and tare weight',
    nicheName: 'Shipping Container Dimension Specs',
    sector: 'programmatic_data',
    sectorLabel: 'Programmatic Specs',
    nicheType: 'utility',
    businessModel: 'lead_gen',
    country: 'United Kingdom',
    rpmRange: '$35 - $48 RPM',
    whyUntapped: 'High-ticket B2B container modification lead gen combined with programmatic high-CTR spec queries.',
    recommendedAsset: 'Interactive Container Mod Sizing Hub',
  },
  {
    seed: 'lego weight specifications and piece sorter',
    nicheName: 'Lego Weight & Sorting Dimensions',
    sector: 'programmatic_data',
    sectorLabel: 'Programmatic Specs',
    nicheType: 'utility',
    businessModel: 'ads',
    country: 'United Kingdom',
    rpmRange: '$28 - $42 RPM',
    whyUntapped: 'Resellers buy bulk Lego by weight. Zero dedicated clean calculators exist; only obscure 2012 forum posts.',
    recommendedAsset: 'Programmatic Bulk Brick Weight Calculator',
  },

  // 3. Micro Utility Calculators & Converters
  {
    seed: 'fasting calories and autophagy window calculator',
    nicheName: 'Intermittent Fasting & Autophagy Calculator',
    sector: 'micro_calculators',
    sectorLabel: 'Micro Utility Calculators',
    nicheType: 'utility',
    businessModel: 'ads',
    country: 'United States',
    rpmRange: '$40 - $55 RPM',
    whyUntapped: 'Zero AI Overview risk due to user input requirements. High repeat usage and display ad RPMs in wellness tier.',
    recommendedAsset: 'Single-Page Responsive Fasting App',
  },
  {
    seed: 'epoxy resin mix ratio and coverage calculator',
    nicheName: 'Epoxy Resin Mix Ratio & SqFt Calculator',
    sector: 'micro_calculators',
    sectorLabel: 'Micro Utility Calculators',
    nicheType: 'utility',
    businessModel: 'affiliate',
    country: 'Australia',
    rpmRange: '$34 - $48 RPM',
    whyUntapped: 'Woodworkers and crafters need exact ounce/gram mix ratios. High affiliate conversions on resin kits and pigments.',
    recommendedAsset: 'Interactive Epoxy & Mold Casting Hub',
  },
  {
    seed: 'concrete slab yardage and bag calculator',
    nicheName: 'Concrete Slab Yardage & Bag Estimator',
    sector: 'micro_calculators',
    sectorLabel: 'Micro Utility Calculators',
    nicheType: 'utility',
    businessModel: 'lead_gen',
    country: 'United States',
    rpmRange: '$42 - $58 RPM',
    whyUntapped: 'High-value home improvement traffic. Generates high-paying local concrete delivery leads ($50-$120 per lead).',
    recommendedAsset: 'Interactive Yardage Calculator with Contractor Leads',
  },

  // 4. High-Margin Nano-Affiliate & Low-DR Anomalies
  {
    seed: 'inflatable kayak fishing rigging guide',
    nicheName: 'Inflatable Kayak Fishing & Motor Mounts',
    sector: 'nano_affiliate',
    sectorLabel: 'Nano-Affiliate Gear',
    nicheType: 'affiliate',
    businessModel: 'affiliate',
    country: 'United States',
    rpmRange: '$35 - $48 RPM',
    whyUntapped: 'High ticket boat setups ($600-$1,500) with 6-8% affiliate commissions. DR 14 site ranks #2 with 3.2k visits.',
    recommendedAsset: 'Buyer Review Hub & DIY Rigging Silos',
  },
  {
    seed: 'manual lever espresso machine mods and maintenance',
    nicheName: 'Lever Espresso Machine Mods & Parts',
    sector: 'nano_affiliate',
    sectorLabel: 'Nano-Affiliate Gear',
    nicheType: 'affiliate',
    businessModel: 'affiliate',
    country: 'United States',
    rpmRange: '$38 - $52 RPM',
    whyUntapped: 'Enthusiast home baristas purchasing $200+ brass pistons and pressure gauges. Very low DR competitor presence.',
    recommendedAsset: 'Specialized Modding Guide & Part Directory',
  },
  {
    seed: 'cold plunge chiller diy conversion kit',
    nicheName: 'DIY Cold Plunge & Chiller Setups',
    sector: 'nano_affiliate',
    sectorLabel: 'Nano-Affiliate Gear',
    nicheType: 'affiliate',
    businessModel: 'affiliate',
    country: 'United States',
    rpmRange: '$45 - $60 RPM',
    whyUntapped: 'Massive viral wellness trend. High ticket water chillers ($800-$2,000) with 8-10% merchant affiliate payouts.',
    recommendedAsset: 'DIY Cold Plunge Blueprint & Parts Matrix',
  },

  // 5. Marketplace Pattern Replication (Flippa / Empire Flippers)
  {
    seed: 'commercial coffee machine wattage and breaker size',
    nicheName: 'Commercial Appliance Power & Wattage Specs',
    sector: 'marketplace_templates',
    sectorLabel: 'Marketplace Blueprint',
    nicheType: 'utility',
    businessModel: 'ads',
    country: 'United States',
    rpmRange: '$38 - $50 RPM',
    whyUntapped: 'Direct replication of a $42k Flippa exit site. High programmatic search density across commercial restaurant gear.',
    recommendedAsset: '500+ Page Programmatic Wattage Database',
  },
  {
    seed: 'trailer tire pressure and load capacity chart',
    nicheName: 'Trailer Tire PSI & Axle Load Matrix',
    sector: 'marketplace_templates',
    sectorLabel: 'Marketplace Blueprint',
    nicheType: 'utility',
    businessModel: 'affiliate',
    country: 'United States',
    rpmRange: '$36 - $48 RPM',
    whyUntapped: 'RV, boat, and utility trailer haulers checking exact PSI specs before road trips. Bulletproof against AI Overview.',
    recommendedAsset: 'Tire Capacity Matrix & Replacement Buyer Guide',
  },
];

export class AutopilotEngine {
  private static liveLogs: Array<{ id: string; timestamp: string; message: string; level: 'info' | 'success' | 'warn' }> = [
    {
      id: 'log_ap_init',
      timestamp: new Date().toISOString(),
      message: 'Autonomous Autopilot Radar Engine initialized. Scouting Tier 1 markets for DR 0-15 anomalies.',
      level: 'info',
    },
  ];

  public static addLiveLog(message: string, level: 'info' | 'success' | 'warn' = 'info') {
    this.liveLogs.unshift({
      id: `ap_log_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      timestamp: new Date().toISOString(),
      message,
      level,
    });
    if (this.liveLogs.length > 50) {
      this.liveLogs = this.liveLogs.slice(0, 50);
    }
  }

  /**
   * Generates dynamic candidate seeds using AI or curations
   */
  public static async scoutCandidates(count = 3, sector?: AutopilotSector): Promise<CandidateSeedTemplate[]> {
    const config = db.getAutopilotConfig();
    const activeSectors = sector ? [sector] : config.selectedSectors;
    const candidates: CandidateSeedTemplate[] = [];

    // Filter available bank templates
    const pool = AUTOPILOT_CANDIDATE_BANK.filter((item) =>
      activeSectors.includes(item.sector)
    );

    // Shuffle pool
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    candidates.push(...shuffled.slice(0, count));

    // If more requested or looking for AI generation:
    if (candidates.length < count) {
      try {
        const prompt = `You are an elite Autonomous Micro-Niche Scout discovering low-competition, high-RPM niche opportunities.
Generate ${count - candidates.length} unique, untapped micro-niche ideas targeting Tier 1 countries (US, UK, Germany, Canada, Australia).
Focus on: Challenger Brand Menus, Programmatic Spec Databases, Micro Utility Calculators, or Low DR Anomalies.

Return valid JSON format:
[
  {
    "seed": "exact seed keyword",
    "nicheName": "Clean Name",
    "sector": "challenger_brands",
    "sectorLabel": "Readable Sector Name",
    "nicheType": "menu",
    "businessModel": "ads",
    "country": "United States",
    "rpmRange": "$32 - $50 RPM",
    "whyUntapped": "Specific competitor weakness and why DR 0-10 sites can rank",
    "recommendedAsset": "Recommended digital asset type"
  }
]`;

        const aiCandidates = await AiProvider.generateJson<CandidateSeedTemplate[]>(prompt);
        if (Array.isArray(aiCandidates)) {
          candidates.push(...aiCandidates);
        }
      } catch (e: any) {
        console.warn('AI Scout generation fallback to candidate bank:', e.message);
      }
    }

    return candidates.slice(0, count);
  }

  /**
   * Runs an autonomous hunting batch without requiring any human seed or URL.
   */
  public static async runAutonomousBatch(options: {
    batchSize?: number;
    sector?: AutopilotSector;
    tier?: 'tier1' | 'tier2';
    userId?: string;
  } = {}): Promise<{
    success: boolean;
    discoveredItems: AutopilotDiscoveredItem[];
    summary: string;
  }> {
    const config = db.getAutopilotConfig();
    const batchSize = options.batchSize || 3;
    const userId = options.userId || 'usr_admin_01';

    this.addLiveLog(`Autonomous Radar Cycle launched. Scouting ${batchSize} fresh micro-niche candidates...`, 'info');

    // 1. Scout Candidate Seeds Autonomously
    const candidatePool = await this.scoutCandidates(batchSize, options.sector);
    const discoveredItems: AutopilotDiscoveredItem[] = [];

    this.addLiveLog(`Scouted ${candidatePool.length} candidate seeds across Tier 1 markets. Executing 15-phase SEBT-NEXT analysis...`, 'info');

    // 2. Process each candidate through the 15-phase validation pipeline
    for (const candidate of candidatePool) {
      try {
        this.addLiveLog(`[Deep Scan] Analyzing candidate: "${candidate.seed}" (${candidate.country})...`, 'info');

        // Execute full 15-phase pipeline
        const report = await ResearchPipeline.execute({
          seedKeyword: candidate.seed,
          nicheType: candidate.nicheType,
          businessModel: candidate.businessModel,
          targetCountry: candidate.country,
          language: candidate.country === 'Germany' ? 'German' : 'English',
          minSv: 400,
          maxKd: 40,
          userId,
        });

        const tierInfo = getCountryTierInfo(candidate.country);
        const weakComps = report.serp.competitors.filter((c) => c.isWeakCompetitor || c.dr < 20);
        const lowestWeakDr = weakComps.length > 0 ? Math.min(...weakComps.map((c) => c.dr)) : 18;

        // Save research run to database
        const researchRecord = {
          id: `res_ap_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          userId,
          seedKeyword: candidate.seed,
          nicheType: candidate.nicheType,
          businessModel: candidate.businessModel,
          targetCountry: candidate.country,
          language: candidate.country === 'Germany' ? 'German' : 'English',
          status: 'completed' as const,
          progress: 100,
          currentPhase: 15,
          viabilityScore: report.overallViabilityScore,
          verdict: report.verdict,
          dataConfidence: report.dataConfidenceScore,
          report,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        db.saveResearch(researchRecord);

        // Auto-save to Vault if meets threshold
        let autoSaved = false;
        if (config.autoSaveToVault && report.overallViabilityScore >= config.minViabilityScore) {
          db.saveNiche({
            id: `sn_ap_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            userId,
            researchId: researchRecord.id,
            nicheName: report.nicheName,
            seedKeyword: candidate.seed,
            targetCountry: candidate.country,
            viabilityScore: report.overallViabilityScore,
            verdict: report.verdict,
            status: 'strong_opportunity',
            tags: [candidate.sector, candidate.nicheType, 'autopilot-gem'],
            notes: `Auto-discovered by Autopilot Radar: ${weakComps.length} weak competitors (Lowest DR ${lowestWeakDr}). Estimated ${candidate.rpmRange}.`,
            pinned: report.overallViabilityScore >= 88,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
          autoSaved = true;
        }

        const discoveredItem: AutopilotDiscoveredItem = {
          id: `ap_item_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          researchId: researchRecord.id,
          seedKeyword: candidate.seed,
          nicheName: report.nicheName,
          sector: candidate.sector,
          sectorLabel: candidate.sectorLabel,
          nicheType: candidate.nicheType,
          businessModel: candidate.businessModel,
          targetCountry: candidate.country,
          countryTier: tierInfo.tier,
          estimatedRpm: candidate.rpmRange || `$${tierInfo.rpmRange[0]} - $${tierInfo.rpmRange[1]} RPM`,
          viabilityScore: report.overallViabilityScore,
          verdict: report.verdict,
          weakCompetitorCount: weakComps.length,
          standoutWeakDr: lowestWeakDr,
          monthlySearchVolume: report.searchVolume.totalNicheSv.value,
          estimatedMonthlyRevenue: report.monetization.estimatedMonthlyRevenueRange,
          recommendedAssetType: candidate.recommendedAsset,
          aiOverviewPresent: report.serp.aiOverviewPresent,
          whyItIsUntapped: candidate.whyUntapped,
          discoveredAt: new Date().toISOString(),
          autoSaved,
        };

        db.saveAutopilotDiscovered(discoveredItem);
        discoveredItems.push(discoveredItem);

        this.addLiveLog(
          `✓ Validated: "${report.nicheName}" (${candidate.country}) -> Score: ${report.overallViabilityScore}/100 [${report.verdict}]. ${weakComps.length} low DR competitors detected.`,
          report.overallViabilityScore >= 80 ? 'success' : 'info'
        );
      } catch (err: any) {
        console.error('Error running candidate pipeline:', err);
        this.addLiveLog(`⚠ Candidate "${candidate.seed}" encountered evaluation error: ${err.message}`, 'warn');
      }
    }

    // Update config telemetry
    db.updateAutopilotConfig({
      lastAutoRunAt: new Date().toISOString(),
    });

    const summary = `Autopilot cycle completed: ${discoveredItems.length} validated micro-niches discovered and cataloged.`;
    this.addLiveLog(summary, 'success');

    return {
      success: true,
      discoveredItems,
      summary,
    };
  }

  /**
   * Returns complete Autopilot status, config, and discovery history
   */
  public static getStatus(): AutopilotStatus {
    const config = db.getAutopilotConfig();
    const discovered = db.getAutopilotDiscovered();

    const highViability = discovered.filter((d) => d.viabilityScore >= 80);
    const lowDrAnomalies = discovered.filter((d) => d.standoutWeakDr <= 15);
    const avgScore =
      discovered.length > 0
        ? Math.round(discovered.reduce((sum, d) => sum + d.viabilityScore, 0) / discovered.length)
        : 0;

    return {
      active: config.enabled,
      config,
      totalDiscovered: discovered.length,
      highViabilityCount: highViability.length,
      lowDrAnomalyCount: lowDrAnomalies.length,
      averageDiscoveredScore: avgScore,
      recentDiscoveries: discovered,
      liveLogs: this.liveLogs,
    };
  }
}
