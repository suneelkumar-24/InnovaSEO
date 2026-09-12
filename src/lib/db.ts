import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { Redis } from '@upstash/redis';
import {
  User,
  NicheViabilityReport,
  SavedNicheItem,
  ApiKeyConfig,
  SystemLog,
  ScoringWeights,
  AutopilotConfig,
  AutopilotDiscoveredItem,
  ResearchRecord,
  SearchOrigin,
  ResearchDeductions,
  getCountryTierInfo,
} from './providers/types';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_PATH = path.join(DATA_DIR, 'db.json');

export interface DatabaseSchema {
  users: Array<User & { passwordHash: string }>;
  researches: ResearchRecord[];
  savedNiches: SavedNicheItem[];
  apiKeys: Array<{
    id: string;
    userId: string;
    provider: string;
    keyHash: string;
    isActive: boolean;
    status: 'valid' | 'invalid' | 'untested';
    lastTestedAt?: string;
  }>;
  autopilotConfig?: AutopilotConfig;
  autopilotDiscovered?: AutopilotDiscoveredItem[];
  systemSettings: {
    scoringWeights: ScoringWeights;
    avoidList: string[];
    featureFlags: {
      enableAiOverviewCheck: boolean;
      enableWhoisLookup: boolean;
      enableSitemapAudit: boolean;
    };
  };
  systemLogs: SystemLog[];
}

const DEFAULT_SCORING_WEIGHTS: ScoringWeights = {
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

const DEFAULT_AVOID_LIST: string[] = [
  'gambling',
  'casino',
  'betting',
  'pornography',
  'adult content',
  'piracy',
  'warez',
  'cracks',
  'illegal software downloads',
  'exe downloads',
  'movie downloads',
  'mp3 downloads',
  'copyright infringement',
  'malware',
  'hack tools',
  'voter manipulation',
  'political microtargeting',
  'high-stakes medical diagnosis',
  'high-stakes legal advice',
  'predatory loans',
];

export const DEFAULT_AUTOPILOT_CONFIG: AutopilotConfig = {
  enabled: true,
  scanIntervalMinutes: 15,
  targetTiers: ['tier1', 'tier2'],
  selectedSectors: [
    'challenger_brands',
    'programmatic_data',
    'micro_calculators',
    'nano_affiliate',
    'marketplace_templates',
    'high_rpm_info',
  ],
  minViabilityScore: 80,
  maxCompetitorDr: 20,
  autoSaveToVault: true,
  lastAutoRunAt: null,
  totalAutopilotDiscovered: 0,
};

const SEED_REPORT_KAYAK: NicheViabilityReport = {
  id: 'rep_seed_kayak_01',
  seedKeyword: 'inflatable kayak fishing',
  nicheName: 'Inflatable Kayak Fishing',
  nicheType: 'micro',
  businessModel: 'affiliate',
  targetCountry: 'United States',
  language: 'English',
  createdAt: new Date().toISOString(),

  overallViabilityScore: 92,
  verdict: 'STRONG GO',
  verdictRationale: 'STRONG GO with an overall viability score of 92/100. Identified 4 weak beatable competitors in top positions, median DR is 14.5, and zero exact-match dedicated landing pages exist.',
  keyReasons: [
    'Identified 4 beatable competitors (DR < 18, low referring domains) ranking in top 10 positions.',
    'Low median competitor DR (14.5), allowing a focused niche site to outrank generic portals quickly.',
    'Zero dedicated exact-match websites or landing pages currently dominating the query.',
    'Significant search intent gap: ranking pages are generic kayak stores or forum threads without specialized angler setups.',
    'Strong demand stability (Evergreen trend) with 14,800 monthly aggregate search volume.',
    'High monetization potential with premium affiliate commissions on $400-$1,200 inflatable rigs.',
    'Favorable organic CTR environment with minimal AI Overview click cannibalization.',
  ],
  mainRisks: [
    'Seasonal peak during Spring and Summer quarters across North American states.',
    'Requires building 15-20 specialized rig comparison guides to establish topical authority.',
  ],
  whatToValidateNext: [
    'Check Amazon & independent outdoor affiliate program commission rates (4-8%).',
    'Perform manual content audit on top 3 ranking competitor URLs.',
    'Draft initial 5-pillar topical cluster content outline.',
  ],
  dataConfidenceScore: 94,

  searchVolume: {
    seedSv: { value: 3600, source: 'Google Keyword Index', confidence: 'High' },
    globalSv: { value: 8900, source: 'Global Search Index', confidence: 'High' },
    targetCountrySv: { value: 3600, source: 'United States Search Index', confidence: 'High' },
    totalNicheSv: { value: 14800, source: 'Topical Cluster Volume Model', confidence: 'High' },
    averageSv: { value: 980, source: 'Calculated Average', confidence: 'High', isEstimated: true },
    keywordCount: 15,
    countrySharePercentage: 40,
    topCountries: [
      { country: 'United States', volume: 3600, share: 40 },
      { country: 'Canada', volume: 1600, share: 18 },
      { country: 'United Kingdom', volume: 1200, share: 13 },
      { country: 'Australia', volume: 850, share: 10 },
      { country: 'Germany', volume: 450, share: 5 },
    ],
    topRegions: [
      { region: 'Florida', share: 28, interest: 95 },
      { region: 'Texas', share: 22, interest: 88 },
      { region: 'California', share: 18, interest: 74 },
      { region: 'Michigan', share: 14, interest: 68 },
    ],
  },

  trends: {
    points12m: [
      { date: '2025-01', interest: 42 },
      { date: '2025-02', interest: 48 },
      { date: '2025-03', interest: 68 },
      { date: '2025-04', interest: 85 },
      { date: '2025-05', interest: 96 },
      { date: '2025-06', interest: 100 },
      { date: '2025-07', interest: 92 },
      { date: '2025-08', interest: 80 },
      { date: '2025-09', interest: 65 },
      { date: '2025-10', interest: 52 },
      { date: '2025-11', interest: 44 },
      { date: '2025-12', interest: 40 },
    ],
    points5y: [
      { date: '2021', interest: 55 },
      { date: '2022', interest: 62 },
      { date: '2023', interest: 70 },
      { date: '2024', interest: 78 },
      { date: '2025', interest: 88 },
    ],
    currentInterest: 72,
    averageInterest: 68,
    minInterest: 40,
    maxInterest: 100,
    growthPercentage: 24,
    direction: 'Growing',
    classification: 'Evergreen',
    isEvergreen: true,
    seasonalityPattern: 'Summer peak (May-July) with steady year-round research in southern coastal regions.',
    risingQueries: [
      { query: 'best inflatable fishing kayak with motor', growth: '+210%' },
      { query: 'drop stitch floor fishing kayak', growth: '+160%' },
    ],
  },

  keywords: {
    items: [
      { keyword: 'inflatable kayak fishing', searchVolume: 3600, kd: 18, cpc: 1.45, intent: 'commercial', serpFeatures: ['Featured Snippet', 'People Also Ask'], opportunity: 'High', cluster: 'Core' },
      { keyword: 'best inflatable fishing kayak', searchVolume: 2400, kd: 22, cpc: 1.85, intent: 'commercial', serpFeatures: ['Shopping', 'People Also Ask'], opportunity: 'High', cluster: 'Buying Guides' },
      { keyword: 'inflatable kayak for ocean fishing', searchVolume: 1200, kd: 16, cpc: 1.2, intent: 'commercial', serpFeatures: ['People Also Ask'], opportunity: 'High', cluster: 'Use Cases' },
      { keyword: 'how to rig an inflatable kayak for fishing', searchVolume: 880, kd: 12, cpc: 0.85, intent: 'informational', serpFeatures: ['Video Pack', 'Snippet'], opportunity: 'High', cluster: 'How-To' },
      { keyword: 'inflatable vs hard kayak for fishing', searchVolume: 720, kd: 14, cpc: 1.1, intent: 'commercial', serpFeatures: ['People Also Ask'], opportunity: 'High', cluster: 'Comparisons' },
      { keyword: 'pedal drive inflatable fishing kayak', searchVolume: 1400, kd: 24, cpc: 2.1, intent: 'transactional', serpFeatures: ['Shopping'], opportunity: 'High', cluster: 'Features' },
    ],
    clusters: [
      { name: 'Buying Guides', intent: 'commercial', totalVolume: 6000, count: 4 },
      { name: 'How-To & Rigging', intent: 'informational', totalVolume: 3200, count: 5 },
      { name: 'Comparisons', intent: 'commercial', totalVolume: 2400, count: 3 },
      { name: 'Use Cases', intent: 'commercial', totalVolume: 3200, count: 3 },
    ],
  },

  serp: {
    targetKeyword: 'inflatable kayak fishing',
    aiOverviewPresent: false,
    aiOverviewImpact: 'None',
    weakCompetitorCount: 4,
    competitors: [
      {
        position: 1,
        domain: 'paddlingmag.com',
        url: 'https://paddlingmag.com/boats/inflatable-fishing-kayaks/',
        title: 'Best Inflatable Fishing Kayaks of 2026',
        pageType: 'generic_blog',
        dr: 54,
        da: 48,
        pa: 38,
        rd: 85,
        backlinks: 240,
        organicTraffic: 12400,
        rankingKeywords: 820,
        domainAgeYears: 6.5,
        estimatedPages: 450,
        intentMatch: 'Partial',
        hasAiOverview: false,
        isWeakCompetitor: false,
        weaknessReasons: [],
      },
      {
        position: 2,
        domain: 'inflatablekayakworld.com',
        url: 'https://inflatablekayakworld.com/fishing-kayaks/',
        title: 'Top Rated Inflatable Fishing Kayak Reviews',
        pageType: 'dedicated_landing',
        dr: 16,
        da: 18,
        pa: 22,
        rd: 14,
        backlinks: 48,
        organicTraffic: 3200,
        rankingKeywords: 340,
        domainAgeYears: 1.8,
        estimatedPages: 42,
        intentMatch: 'Exact',
        hasAiOverview: false,
        isWeakCompetitor: true,
        weaknessReasons: ['Low DR (16)', 'Young domain (1.8 yrs)', 'Low referring domains (14 RD)', 'Thin review specs'],
        topRankingKeywords: [{ keyword: 'inflatable fishing kayak review', position: 2, volume: 1800 }],
      },
      {
        position: 3,
        domain: 'reddit.com',
        url: 'https://reddit.com/r/kayakfishing/comments/inflatable_kayaks/',
        title: 'Anyone using an inflatable kayak for fishing? : r/kayakfishing',
        pageType: 'forum',
        dr: 92,
        da: 90,
        pa: 42,
        rd: 12,
        backlinks: 32,
        organicTraffic: 2100,
        rankingKeywords: 180,
        domainAgeYears: 18,
        estimatedPages: 100000,
        intentMatch: 'Mismatch',
        hasAiOverview: false,
        isWeakCompetitor: true,
        weaknessReasons: ['Forum thread ranking indicates strong unmet search intent for dedicated technical guide'],
      },
      {
        position: 4,
        domain: 'kayakanglerguide.net',
        url: 'https://kayakanglerguide.net/inflatables/',
        title: 'Rigging an Inflatable Kayak for Bass Fishing',
        pageType: 'generic_blog',
        dr: 12,
        da: 14,
        pa: 16,
        rd: 8,
        backlinks: 18,
        organicTraffic: 1400,
        rankingKeywords: 120,
        domainAgeYears: 1.2,
        estimatedPages: 28,
        intentMatch: 'Partial',
        hasAiOverview: false,
        isWeakCompetitor: true,
        weaknessReasons: ['Low DR (12)', 'Young domain (1.2 yrs)', 'Under 30 indexed pages'],
      },
      {
        position: 5,
        domain: 'anglerboard.de',
        url: 'https://anglerboard.de/threads/inflatable-kayak.123/',
        title: 'Inflatable Fishing Kayak Forum Discussion',
        pageType: 'forum',
        dr: 28,
        da: 26,
        pa: 20,
        rd: 15,
        backlinks: 40,
        organicTraffic: 850,
        rankingKeywords: 95,
        domainAgeYears: 8.0,
        estimatedPages: 4000,
        intentMatch: 'Poor',
        hasAiOverview: false,
        isWeakCompetitor: true,
        weaknessReasons: ['Foreign UGC forum thread ranking in US index due to content void'],
      },
    ],
    medians: {
      dr: { min: 12, median: 16, max: 92 },
      da: { min: 14, median: 18, max: 90 },
      pa: { min: 16, median: 22, max: 42 },
      rd: { min: 8, median: 14, max: 85 },
      backlinks: { min: 18, median: 40, max: 240 },
      traffic: { min: 850, median: 2100, max: 12400 },
      domainAgeYears: { min: 1.2, median: 1.8, max: 18 },
      pages: { min: 28, median: 42, max: 100000 },
      rankingKeywords: { min: 95, median: 180, max: 820 },
    },
  },

  intentAnalysis: {
    primaryIntent: 'commercial',
    serpIntentMatch: 'Mixed',
    intentMismatchDetected: true,
    mismatchExplanation: 'Found 2 forum threads and generic broad paddle magazines ranking. User intent seeks dedicated specs on stability, puncture resistance, and rod holder rigging.',
    gapOpportunities: [
      'Comprehensive puncture resistance & drop-stitch comparison table',
      'Step-by-step motor mount & fish finder installation tutorials',
      'Interactive Kayak Sizing & Weight Capacity Calculator',
    ],
    forumsRankingCount: 2,
    thinContentCount: 2,
  },

  dedicatedPageAudit: {
    dedicatedWebsiteExists: false,
    dedicatedLandingPageExists: true,
    exactIntentPageExists: false,
    opportunityLevel: 'HIGH',
    analysis: 'No dedicated exact-match website exists. Only one small niche affiliate site (DR 16) holds position 2, demonstrating massive opportunity for a topical authority hub.',
  },

  ctrAnalysis: {
    estimatedTop1Ctr: 0.32,
    estimatedTop3Ctr: 0.58,
    potentialClicksMonthly: 2088,
    serpCrowdedness: 'Low',
    factors: ['No AI Overview active', 'Featured snippet easily capturable', 'High commercial intent click share'],
  },

  monetization: {
    primaryModel: 'affiliate',
    monetizationScore: 88,
    estimatedMonthlyRevenueRange: '$2,500 - $7,000 / mo',
    commercialIntent: 'High',
    opportunities: [
      { type: 'affiliate', label: 'Outdoor & Kayak Retailer Commissions', description: 'Affiliate payouts on high-ticket boats ($500-$1,500 at 5-8% commission = $40-$120 per sale).', potentialIncomeRange: '$2,000 - $5,500 / mo', easeOfExecution: 'Easy', commercialIntentScore: 92 },
      { type: 'digital_product', label: 'Rigging Blueprint & Local Map Guides', description: 'Downloadable PDF guides for saltwater rigging and GPS waypoints.', potentialIncomeRange: '$400 - $1,500 / mo', easeOfExecution: 'Easy', commercialIntentScore: 78 },
      { type: 'ads', label: 'Display Ad Network', description: 'Mediavine / Raptive ads on high-traffic informational rigging tutorials.', potentialIncomeRange: '$500 - $1,200 / mo', easeOfExecution: 'Easy', commercialIntentScore: 65 },
    ],
  },

  scalability: {
    rating: 'HIGH',
    score: 88,
    subNiches: [
      { name: 'Motorized Inflatable Kayaks', rationale: 'Rapidly growing trend with $2,000+ price tags.', estimatedVolume: '2,800/mo' },
      { name: 'Tandem (2-Person) Fishing Inflatables', rationale: 'Family and companion angling segment.', estimatedVolume: '1,400/mo' },
      { name: 'Ultralight Packraft Fishing', rationale: 'Backcountry alpine lake anglers.', estimatedVolume: '1,100/mo' },
    ],
    silos: [
      {
        siloName: 'Buying Guides (Commercial Pillar)',
        targetKeywords: ['best inflatable fishing kayak', 'inflatable kayak reviews', 'top rated fishing kayaks'],
        articleAngles: [
          { title: "The Ultimate Buyer's Guide to Inflatable Fishing Kayaks (2026)", type: 'Pillar', intent: 'commercial' },
          { title: 'Top 7 Inflatable Kayaks for Ocean Angling', type: 'Commercial', intent: 'commercial' },
          { title: 'Drop-Stitch vs PVC Kayaks: Durability Test', type: 'Comparison', intent: 'commercial' },
        ],
      },
      {
        siloName: 'Rigging & Tutorials (Informational Pillar)',
        targetKeywords: ['how to rig an inflatable kayak', 'fish finder on inflatable kayak', 'anchor trolley setup'],
        articleAngles: [
          { title: 'How to Install a Fish Finder on an Inflatable Kayak (No Drilling)', type: 'Informational', intent: 'informational' },
          { title: 'DIY Rod Holder Mounts for Inflatable Boats', type: 'Informational', intent: 'informational' },
        ],
      },
    ],
  },

  riskAnalysis: {
    aiRiskLevel: 'Low Risk',
    policyStatus: 'Compliant',
    isYmyl: false,
    isGovernmentRelated: false,
    riskFactors: ['Standard outdoor recreation niche with zero regulatory or policy constraints'],
  },

  scoreBreakdown: {
    demandScore: 88,
    searchVolumeScore: 92,
    trendScore: 90,
    serpWeaknessScore: 95,
    competitionScore: 95,
    intentOpportunityScore: 95,
    dedicatedPageScore: 90,
    monetizationScore: 88,
    scalabilityScore: 88,
    aiOverviewCtrScore: 95,
  },
};

function initializeDatabase(): DatabaseSchema {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  const salt = bcrypt.genSaltSync(10);
  const defaultAdminPasswordHash = bcrypt.hashSync('Admin@123456', salt);
  const defaultUserPasswordHash = bcrypt.hashSync('User@123456', salt);
  const today = new Date().toISOString().slice(0, 10);

  const initialDb: DatabaseSchema = {
    users: [
      {
        id: 'usr_admin_01',
        email: 'admin@nichehunter.io',
        name: 'Alex Hunter (Admin)',
        role: 'admin',
        passwordHash: defaultAdminPasswordHash,
        createdAt: new Date().toISOString(),
        apiUsageCount: 42,
        credits: 999999,
        dailyCreditsLimit: 999999,
        lastCreditResetDate: today,
      },
      {
        id: 'usr_demo_02',
        email: 'user@nichehunter.io',
        name: 'Sarah Connor',
        role: 'user',
        passwordHash: defaultUserPasswordHash,
        createdAt: new Date().toISOString(),
        apiUsageCount: 18,
        credits: 50,
        dailyCreditsLimit: 50,
        lastCreditResetDate: today,
      },
    ],
    researches: [
      {
        id: 'res_seed_kayak_01',
        userId: 'usr_admin_01',
        seedKeyword: 'inflatable kayak fishing',
        nicheType: 'micro',
        businessModel: 'affiliate',
        targetCountry: 'United States',
        language: 'English',
        status: 'completed',
        progress: 100,
        currentPhase: 15,
        viabilityScore: 92,
        verdict: 'STRONG GO',
        dataConfidence: 94,
        report: SEED_REPORT_KAYAK,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
    savedNiches: [
      {
        id: 'sn_seed_kayak_01',
        userId: 'usr_admin_01',
        researchId: 'res_seed_kayak_01',
        nicheName: 'Inflatable Kayak Fishing',
        seedKeyword: 'inflatable kayak fishing',
        targetCountry: 'United States',
        viabilityScore: 92,
        verdict: 'STRONG GO',
        status: 'strong_opportunity',
        tags: ['outdoors', 'affiliate', 'low-dr'],
        notes: 'Exceptional opportunity: 4 weak competitors ranking, median DR 16, zero dedicated authority sites.',
        pinned: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
    apiKeys: [
      {
        id: 'key_gemini_sys',
        userId: 'usr_admin_01',
        provider: 'gemini',
        keyHash: process.env.GEMINI_API_KEY ? '••••••••' + process.env.GEMINI_API_KEY.slice(-4) : '',
        isActive: true,
        status: 'valid',
        lastTestedAt: new Date().toISOString(),
      },
    ],
    autopilotConfig: DEFAULT_AUTOPILOT_CONFIG,
    autopilotDiscovered: [],
    systemSettings: {
      scoringWeights: DEFAULT_SCORING_WEIGHTS,
      avoidList: DEFAULT_AVOID_LIST,
      featureFlags: {
        enableAiOverviewCheck: true,
        enableWhoisLookup: true,
        enableSitemapAudit: true,
      },
    },
    systemLogs: [
      {
        id: 'log_init_01',
        level: 'info',
        module: 'System',
        message: 'Niche Hunter system initialized with Admin management.',
        timestamp: new Date().toISOString(),
      },
    ],
  };

  fs.writeFileSync(DB_PATH, JSON.stringify(initialDb, null, 2), 'utf-8');
  memoryDbCache = initialDb;
  try {
    const stat = fs.statSync(DB_PATH);
    lastDbReadMtime = stat.mtimeMs;
  } catch {}
  return initialDb;
}

// Cloud Redis client (if Upstash or Vercel KV environment variables are configured)
function getRedisClient(): Redis | null {
  const url =
    process.env.STORAGE_REST_API_URL ||
    process.env.STORAGE_URL ||
    process.env.UPSTASH_REDIS_REST_URL ||
    process.env.KV_REST_API_URL;
  const token =
    process.env.STORAGE_REST_API_TOKEN ||
    process.env.STORAGE_TOKEN ||
    process.env.UPSTASH_REDIS_REST_TOKEN ||
    process.env.KV_REST_API_TOKEN;
  if (url && token) {
    try {
      return new Redis({ url, token });
    } catch {
      return null;
    }
  }
  return null;
}

const REDIS_DB_KEY = 'niche_hunter_db_v1';
let memoryDbCache: DatabaseSchema | null = null;
let lastDbReadMtime = 0;
let cloudSyncAttempted = false;

/**
 * Initializes or syncs cloud database with local state on Vercel deployment
 */
export async function syncCloudDatabase(): Promise<DatabaseSchema> {
  const redis = getRedisClient();
  if (redis) {
    try {
      const raw = await redis.get<string | DatabaseSchema>(REDIS_DB_KEY);
      if (raw) {
        const data: DatabaseSchema = typeof raw === 'string' ? JSON.parse(raw) : raw;
        if (data && Array.isArray(data.users)) {
          memoryDbCache = data;
          cloudSyncAttempted = true;
          return data;
        }
      } else {
        // First-time seed: upload local database to Upstash cloud
        const current = readDb();
        await redis.set(REDIS_DB_KEY, JSON.stringify(current));
        cloudSyncAttempted = true;
        return current;
      }
    } catch (err: any) {
      console.warn('Cloud DB sync notice (falling back to memory):', err?.message || err);
    }
  }
  return readDb();
}

export function readDb(): DatabaseSchema {
  try {
    // If running in cloud environment and memory cache exists, return memory cache
    if (
      memoryDbCache &&
      (process.env.VERCEL ||
        process.env.STORAGE_REST_API_URL ||
        process.env.STORAGE_URL ||
        process.env.UPSTASH_REDIS_REST_URL ||
        process.env.KV_REST_API_URL)
    ) {
      return memoryDbCache;
    }

    if (!fs.existsSync(DB_PATH)) {
      memoryDbCache = initializeDatabase();
      return memoryDbCache;
    }

    // Check if file was modified externally
    const stat = fs.statSync(DB_PATH);
    if (memoryDbCache && stat.mtimeMs <= lastDbReadMtime) {
      return memoryDbCache;
    }

    const raw = fs.readFileSync(DB_PATH, 'utf-8');
    const data: DatabaseSchema = JSON.parse(raw);
    if (!data.autopilotConfig) {
      data.autopilotConfig = DEFAULT_AUTOPILOT_CONFIG;
    }
    if (!data.autopilotDiscovered) {
      data.autopilotDiscovered = [];
    }
    memoryDbCache = data;
    lastDbReadMtime = stat.mtimeMs;
    return data;
  } catch (error) {
    if (memoryDbCache) return memoryDbCache;
    console.error('Error reading DB, re-initializing:', error);
    memoryDbCache = initializeDatabase();
    return memoryDbCache;
  }
}

export function writeDb(data: DatabaseSchema): void {
  // 1. Update memory cache immediately
  memoryDbCache = data;

  // 2. Sync to Cloud Upstash Redis (if configured on Vercel)
  const redis = getRedisClient();
  if (redis) {
    redis.set(REDIS_DB_KEY, JSON.stringify(data)).catch((err) => {
      console.warn('Cloud DB write sync error:', err?.message || err);
    });
  }

  // 3. Write to local file if writable (local dev environment)
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
    const stat = fs.statSync(DB_PATH);
    lastDbReadMtime = stat.mtimeMs;
  } catch (error) {
    // On Vercel serverless containers, filesystem is read-only. Memory + Cloud Redis handles persistence.
    if (!process.env.VERCEL) {
      console.warn('Notice: Local DB file write skipped or read-only filesystem:', error);
    }
  }
}

export function generateDeductionsFromReport(
  report: NicheViabilityReport,
  origin: SearchOrigin = 'manual',
  customWhyUntapped?: string
): ResearchDeductions {
  const weakComps = (report.serp?.competitors || []).filter((c) => c.isWeakCompetitor || c.dr < 20);
  const lowestWeakDr = weakComps.length > 0 ? Math.min(...weakComps.map((c) => c.dr)) : (report.serp?.medians?.dr?.min || 18);
  const tierInfo = getCountryTierInfo(report.targetCountry || 'United States');
  const zeroClickImmune = !report.serp?.aiOverviewPresent || report.serp?.aiOverviewImpact === 'None';

  let recommendedAsset = 'Programmatic Database / Hub (500+ URLs)';
  if (report.nicheType === 'menu') {
    recommendedAsset = 'Programmatic Menu, Calories & Price Matrix (500+ items)';
  } else if (report.nicheType === 'utility' || report.nicheType === 'tool-based') {
    recommendedAsset = 'Single-Page Interactive Calculator / Specification Canvas';
  } else if (report.businessModel === 'affiliate') {
    recommendedAsset = 'Buyer Review & Comparison Hub with Technical Rigging Silos';
  } else if (report.businessModel === 'lead_gen') {
    recommendedAsset = 'Local Lead Generation & Quote Distribution Gateway';
  }

  let summary = customWhyUntapped || '';
  if (!summary) {
    if (origin === 'auto_hunter') {
      summary = `Auto Hunter Radar discovered ${weakComps.length} low DR competitors (Lowest DR ${lowestWeakDr}). ${tierInfo.tier} demand with $${tierInfo.rpmRange[0]}-$${tierInfo.rpmRange[1]} RPM potential.`;
    } else if (origin === 'marketplace_reverse') {
      summary = `Marketplace Exit Blueprint reversed: Captures ${report.searchVolume?.targetCountrySv?.value?.toLocaleString() || '15,000'} monthly volume with 30x-40x exit valuation multiplier.`;
    } else if (origin === 'anomaly_scanner') {
      summary = `DR 0-20 Anomaly verified: ${weakComps.length} low-authority sites outranking legacy portals with proven organic demand.`;
    } else {
      summary = `Manual Search Dossier: Found ${weakComps.length} beatable domains (Lowest DR ${lowestWeakDr}). ${zeroClickImmune ? 'Zero AI Overview risk (100% immune).' : 'Moderate AI Overview presence.'}`;
    }
  }

  return {
    summary,
    weakCompetitorsFound: weakComps.length,
    lowestCompetitorDr: lowestWeakDr,
    zeroClickImmune,
    aiOverviewActive: Boolean(report.serp?.aiOverviewPresent),
    countryTier: tierInfo.tier,
    estimatedRpm: `$${tierInfo.rpmRange[0]} - $${tierInfo.rpmRange[1]} RPM`,
    recommendedAsset,
    estimatedMonthlyRevenue: report.monetization?.estimatedMonthlyRevenueRange || '$1,500 - $5,000 / mo',
    topKeyReasons: report.keyReasons?.slice(0, 3) || [],
    keyRisks: report.mainRisks?.slice(0, 2) || [],
    expansionCount: report.multiCountryExpansions?.length || 0,
  };
}

// Helper methods
export const db = {
  // Users
  getUserByEmail: (email: string) => {
    const data = readDb();
    const user = data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) return null;
    // Check and reset daily credits (50 credits every 24h)
    const today = new Date().toISOString().slice(0, 10);
    if (user.role !== 'admin' && user.lastCreditResetDate !== today) {
      user.lastCreditResetDate = today;
      user.credits = user.dailyCreditsLimit ?? 50;
      writeDb(data);
    }
    return user;
  },
  getUserById: (id: string) => {
    const data = readDb();
    const user = data.users.find((u) => u.id === id);
    if (!user) return null;
    // Check and reset daily credits (50 credits every 24h)
    const today = new Date().toISOString().slice(0, 10);
    if (user.role !== 'admin' && user.lastCreditResetDate !== today) {
      user.lastCreditResetDate = today;
      user.credits = user.dailyCreditsLimit ?? 50;
      writeDb(data);
    }
    const { passwordHash, ...safeUser } = user;
    return safeUser;
  },
  createUser: (
    email: string,
    password: string,
    name: string,
    role: 'admin' | 'user' = 'user',
    dailyCreditsLimit: number = 50
  ) => {
    const data = readDb();
    if (data.users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error('User with this email already exists.');
    }
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);
    const today = new Date().toISOString().slice(0, 10);
    const newUser = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      email,
      name,
      role,
      passwordHash,
      createdAt: new Date().toISOString(),
      apiUsageCount: 0,
      credits: role === 'admin' ? 999999 : dailyCreditsLimit,
      dailyCreditsLimit: role === 'admin' ? 999999 : dailyCreditsLimit,
      lastCreditResetDate: today,
    };
    data.users.push(newUser);
    writeDb(data);
    const { passwordHash: _, ...safeUser } = newUser;
    return safeUser;
  },
  getAllUsers: () => {
    const data = readDb();
    return data.users.map(({ passwordHash, ...u }) => u);
  },
  deleteUser: (userId: string) => {
    const data = readDb();
    data.users = data.users.filter((u) => u.id !== userId);
    // Also clean up that user's researches and saved items
    data.researches = data.researches.filter((r) => r.userId !== userId);
    data.savedNiches = data.savedNiches.filter((s) => s.userId !== userId);
    writeDb(data);
    return true;
  },
  deductUserCredit: (
    userId: string,
    amount: number = 1
  ): { success: boolean; remainingCredits: number; error?: string } => {
    const data = readDb();
    const user = data.users.find((u) => u.id === userId);
    if (!user) {
      return { success: false, remainingCredits: 0, error: 'User account not found.' };
    }
    // Admins have unlimited credits
    if (user.role === 'admin') {
      user.apiUsageCount = (user.apiUsageCount || 0) + 1;
      writeDb(data);
      return { success: true, remainingCredits: 999999 };
    }
    // Auto-reset daily quota if new day
    const today = new Date().toISOString().slice(0, 10);
    if (user.lastCreditResetDate !== today) {
      user.lastCreditResetDate = today;
      user.credits = user.dailyCreditsLimit ?? 50;
    }
    if ((user.credits ?? 0) < amount) {
      writeDb(data);
      return {
        success: false,
        remainingCredits: user.credits ?? 0,
        error: `Daily credit limit reached (0/${user.dailyCreditsLimit ?? 50} credits remaining). Your 50 credits reset daily.`,
      };
    }
    user.credits = (user.credits ?? 50) - amount;
    user.apiUsageCount = (user.apiUsageCount || 0) + 1;
    writeDb(data);
    return { success: true, remainingCredits: user.credits };
  },
  updateUserCredits: (userId: string, newCredits: number, newDailyLimit?: number) => {
    const data = readDb();
    const user = data.users.find((u) => u.id === userId);
    if (!user) {
      throw new Error('User not found.');
    }
    user.credits = newCredits;
    if (typeof newDailyLimit === 'number') {
      user.dailyCreditsLimit = newDailyLimit;
    }
    writeDb(data);
    const { passwordHash: _, ...safeUser } = user;
    return safeUser;
  },
  updateUserPassword: (userId: string, newPassword: string) => {
    const data = readDb();
    const user = data.users.find((u) => u.id === userId);
    if (!user) {
      throw new Error('User not found.');
    }
    const salt = bcrypt.genSaltSync(10);
    user.passwordHash = bcrypt.hashSync(newPassword, salt);
    writeDb(data);
    return true;
  },
  updateUser: (userId: string, updates: { name?: string; role?: 'admin' | 'user'; email?: string }) => {
    const data = readDb();
    const user = data.users.find((u) => u.id === userId);
    if (!user) {
      throw new Error('User not found.');
    }
    if (updates.email && updates.email.toLowerCase() !== user.email.toLowerCase()) {
      if (data.users.some((u) => u.id !== userId && u.email.toLowerCase() === updates.email!.toLowerCase())) {
        throw new Error('Another user with this email already exists.');
      }
      user.email = updates.email;
    }
    if (updates.name) user.name = updates.name;
    if (updates.role) user.role = updates.role;
    writeDb(data);
    const { passwordHash: _, ...safeUser } = user;
    return safeUser;
  },
  incrementApiUsage: (userId: string) => {
    const data = readDb();
    const user = data.users.find((u) => u.id === userId);
    if (user) {
      user.apiUsageCount = (user.apiUsageCount || 0) + 1;
      writeDb(data);
    }
  },

  // Researches & Search History (Strict per-user data isolation)
  getResearches: (userId?: string) => {
    if (!userId) return [];
    const data = readDb();
    const list = data.researches.filter((r) => r.userId === userId);
    return list
      .map((r) => {
        if (!r.deductions && r.report) {
          r.deductions = generateDeductionsFromReport(r.report, r.searchOrigin || 'manual');
        }
        if (!r.searchOrigin) {
          r.searchOrigin = r.id.includes('_ap_') ? 'auto_hunter' : 'manual';
        }
        if (!r.executedBy) {
          r.executedBy = r.searchOrigin === 'auto_hunter' ? 'Auto Hunter Radar Agent' : 'User (Manual Hunt)';
        }
        return r;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  getHistory: (options?: {
    userId?: string;
    origin?: SearchOrigin | 'all';
    query?: string;
    verdict?: string;
    limit?: number;
  }) => {
    if (!options?.userId) {
      return {
        history: [],
        stats: {
          totalSearches: 0,
          manualCount: 0,
          autoHunterCount: 0,
          marketplaceCount: 0,
          anomalyCount: 0,
          strongOpportunityCount: 0,
          averageScore: 0,
        },
      };
    }

    const data = readDb();
    let all = data.researches
      .filter((r) => r.userId === options.userId)
      .map((r) => {
        if (!r.deductions && r.report) {
          r.deductions = generateDeductionsFromReport(r.report, r.searchOrigin || 'manual');
        }
        if (!r.searchOrigin) {
          r.searchOrigin = r.id.includes('_ap_') ? 'auto_hunter' : 'manual';
        }
        if (!r.executedBy) {
          r.executedBy = r.searchOrigin === 'auto_hunter' ? 'Auto Hunter Radar Agent' : 'User (Manual Hunt)';
        }
        return r;
      });

    const totalSearches = all.length;
    const manualCount = all.filter((r) => r.searchOrigin === 'manual').length;
    const autoHunterCount = all.filter((r) => r.searchOrigin === 'auto_hunter').length;
    const marketplaceCount = all.filter((r) => r.searchOrigin === 'marketplace_reverse').length;
    const anomalyCount = all.filter((r) => r.searchOrigin === 'anomaly_scanner').length;
    const strongOpportunityCount = all.filter((r) => r.viabilityScore >= 80).length;
    const averageScore =
      totalSearches > 0
        ? Math.round(all.reduce((sum, r) => sum + (r.viabilityScore || 0), 0) / totalSearches)
        : 0;

    let filtered = [...all];

    if (options?.origin && options.origin !== 'all') {
      filtered = filtered.filter((r) => r.searchOrigin === options.origin);
    }

    if (options?.verdict && options.verdict !== 'all') {
      const v = options.verdict.toLowerCase();
      filtered = filtered.filter((r) => r.verdict.toLowerCase().includes(v));
    }

    if (options?.query && options.query.trim()) {
      const q = options.query.toLowerCase().trim();
      filtered = filtered.filter(
        (r) =>
          r.seedKeyword.toLowerCase().includes(q) ||
          r.targetCountry.toLowerCase().includes(q) ||
          r.nicheType.toLowerCase().includes(q) ||
          (r.deductions?.summary && r.deductions.summary.toLowerCase().includes(q)) ||
          (r.report?.nicheName && r.report.nicheName.toLowerCase().includes(q))
      );
    }

    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    if (options?.limit) {
      filtered = filtered.slice(0, options.limit);
    }

    return {
      history: filtered,
      stats: {
        totalSearches,
        manualCount,
        autoHunterCount,
        marketplaceCount,
        anomalyCount,
        strongOpportunityCount,
        averageScore,
      },
    };
  },

  getResearchById: (id: string) => {
    const data = readDb();
    if (!id) return null;
    // 1. Exact match
    const exact = data.researches.find((r) => r.id === id);
    if (exact) {
      if (!exact.deductions && exact.report) {
        exact.deductions = generateDeductionsFromReport(exact.report, exact.searchOrigin || 'manual');
      }
      return exact;
    }

    // 2. Saved niche researchId match
    const savedMatch = data.savedNiches.find((s) => s.id === id || s.researchId === id);
    if (savedMatch) {
      const fromSaved = data.researches.find((r) => r.id === savedMatch.researchId);
      if (fromSaved) {
        if (!fromSaved.deductions && fromSaved.report) {
          fromSaved.deductions = generateDeductionsFromReport(fromSaved.report, fromSaved.searchOrigin || 'manual');
        }
        return fromSaved;
      }
    }

    // 3. Suffix / partial match
    const suffix = id.includes('_') ? id.split('_').pop() : id;
    if (suffix && suffix.length >= 4) {
      const partial = data.researches.find((r) => r.id.endsWith(`_${suffix}`) || r.id.includes(suffix));
      if (partial) {
        if (!partial.deductions && partial.report) {
          partial.deductions = generateDeductionsFromReport(partial.report, partial.searchOrigin || 'manual');
        }
        return partial;
      }
    }

    return null;
  },

  saveResearch: (research: ResearchRecord) => {
    const data = readDb();
    if (!research.deductions && research.report) {
      research.deductions = generateDeductionsFromReport(
        research.report,
        research.searchOrigin || 'manual'
      );
    }
    const idx = data.researches.findIndex((r) => r.id === research.id);
    if (idx >= 0) {
      data.researches[idx] = research;
    } else {
      data.researches.unshift(research);
    }
    writeDb(data);
    return research;
  },

  deleteResearch: (id: string, userId?: string) => {
    const data = readDb();
    data.researches = data.researches.filter((r) => r.id !== id || (userId && r.userId !== userId));
    data.savedNiches = data.savedNiches.filter((s) => s.researchId !== id);
    writeDb(data);
    return true;
  },

  clearHistory: (userId?: string, origin?: SearchOrigin | 'all') => {
    const data = readDb();
    if (!origin || origin === 'all') {
      data.researches = userId ? data.researches.filter((r) => r.userId !== userId) : [];
    } else {
      data.researches = data.researches.filter(
        (r) => (userId && r.userId !== userId) || r.searchOrigin !== origin
      );
    }
    writeDb(data);
    return true;
  },

  // Saved Niches (Strict per-user isolation)
  getSavedNiches: (userId?: string) => {
    if (!userId) return [];
    const data = readDb();
    return data.savedNiches
      .filter((s) => s.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },
  saveNiche: (item: SavedNicheItem) => {
    const data = readDb();
    const idx = data.savedNiches.findIndex((s) => s.id === item.id);
    if (idx >= 0) {
      data.savedNiches[idx] = item;
    } else {
      data.savedNiches.unshift(item);
    }
    writeDb(data);
    return item;
  },
  updateSavedNicheStatus: (id: string, status: SavedNicheItem['status'], notes?: string, tags?: string[]) => {
    const data = readDb();
    const item = data.savedNiches.find((s) => s.id === id);
    if (item) {
      item.status = status;
      if (notes !== undefined) item.notes = notes;
      if (tags !== undefined) item.tags = tags;
      item.updatedAt = new Date().toISOString();
      writeDb(data);
      return item;
    }
    return null;
  },
  deleteSavedNiche: (id: string, userId?: string) => {
    const data = readDb();
    data.savedNiches = data.savedNiches.filter((s) => s.id !== id || (userId && s.userId !== userId));
    writeDb(data);
    return true;
  },

  // System Settings & Weights
  getSettings: () => {
    const data = readDb();
    return data.systemSettings;
  },
  updateScoringWeights: (weights: Partial<ScoringWeights>) => {
    const data = readDb();
    data.systemSettings.scoringWeights = {
      ...data.systemSettings.scoringWeights,
      ...weights,
    };
    writeDb(data);
    return data.systemSettings.scoringWeights;
  },
  updateAvoidList: (list: string[]) => {
    const data = readDb();
    data.systemSettings.avoidList = list;
    writeDb(data);
    return data.systemSettings.avoidList;
  },

  // Logs
  addLog: (log: Omit<SystemLog, 'id' | 'timestamp'>) => {
    const data = readDb();
    const newLog: SystemLog = {
      ...log,
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
    };
    data.systemLogs.unshift(newLog);
    if (data.systemLogs.length > 500) {
      data.systemLogs = data.systemLogs.slice(0, 500);
    }
    writeDb(data);
    return newLog;
  },
  getLogs: (limit = 100) => {
    const data = readDb();
    return data.systemLogs.slice(0, limit);
  },

  // Autopilot
  getAutopilotConfig: (): AutopilotConfig => {
    const data = readDb();
    return data.autopilotConfig || DEFAULT_AUTOPILOT_CONFIG;
  },
  updateAutopilotConfig: (config: Partial<AutopilotConfig>): AutopilotConfig => {
    const data = readDb();
    data.autopilotConfig = {
      ...(data.autopilotConfig || DEFAULT_AUTOPILOT_CONFIG),
      ...config,
    };
    writeDb(data);
    return data.autopilotConfig;
  },
  getAutopilotDiscovered: (): AutopilotDiscoveredItem[] => {
    const data = readDb();
    return (data.autopilotDiscovered || []).sort(
      (a, b) => new Date(b.discoveredAt).getTime() - new Date(a.discoveredAt).getTime()
    );
  },
  saveAutopilotDiscovered: (item: AutopilotDiscoveredItem): AutopilotDiscoveredItem => {
    const data = readDb();
    if (!data.autopilotDiscovered) data.autopilotDiscovered = [];
    const idx = data.autopilotDiscovered.findIndex(
      (d) => d.id === item.id || d.researchId === item.researchId
    );
    if (idx >= 0) {
      data.autopilotDiscovered[idx] = item;
    } else {
      data.autopilotDiscovered.unshift(item);
    }
    if (data.autopilotConfig) {
      data.autopilotConfig.totalAutopilotDiscovered = data.autopilotDiscovered.length;
    }
    writeDb(data);
    return item;
  },
  clearAutopilotDiscovered: () => {
    const data = readDb();
    data.autopilotDiscovered = [];
    if (data.autopilotConfig) {
      data.autopilotConfig.totalAutopilotDiscovered = 0;
    }
    writeDb(data);
    return true;
  },
};
