export type NicheType =
  | 'nano'
  | 'micro'
  | 'micro-nano'
  | 'traditional-seo'
  | 'affiliate'
  | 'e-commerce'
  | 'utility'
  | 'menu'
  | 'information'
  | 'local'
  | 'lead-generation'
  | 'tool-based'
  | 'directory';

export type BusinessModel =
  | 'affiliate'
  | 'ecommerce'
  | 'ads'
  | 'lead_gen'
  | 'saas_tool'
  | 'digital_product'
  | 'directory'
  | 'services'
  | 'subscription';

export type SearchIntent =
  | 'informational'
  | 'commercial'
  | 'transactional'
  | 'navigational'
  | 'local'
  | 'mixed';

export type TrendClassification =
  | 'Evergreen'
  | 'Growing'
  | 'Stable'
  | 'Seasonal'
  | 'Declining'
  | 'Highly Volatile';

export type ViabilityVerdict =
  | 'STRONG GO'
  | 'GO'
  | 'MAYBE'
  | 'RESEARCH MORE'
  | 'AVOID';

export type SavedNicheStatus =
  | 'researching'
  | 'validated'
  | 'strong_opportunity'
  | 'building'
  | 'rejected'
  | 'archived';

export type DataConfidenceLevel = 'High' | 'Medium' | 'Low' | 'Estimated' | 'AI Analysis' | 'N/A';

export interface DataMetric<T> {
  value: T;
  source: string;
  confidence: DataConfidenceLevel;
  lastUpdated?: string;
  isEstimated?: boolean;
}

export interface KeywordItem {
  keyword: string;
  searchVolume: number;
  kd: number;
  cpc: number;
  intent: SearchIntent;
  serpFeatures: string[];
  opportunity: 'High' | 'Medium' | 'Low';
  cluster?: string;
}

export interface TrendPoint {
  date: string;
  interest: number;
}

export interface RegionDemand {
  region: string;
  share: number;
  interest: number;
}

export interface CompetitorResult {
  position: number;
  url: string;
  domain: string;
  title: string;
  pageType: 'dedicated_site' | 'dedicated_landing' | 'category' | 'marketplace' | 'forum' | 'generic_blog' | 'tool';
  dr: number;
  da: number;
  pa: number;
  rd: number;
  backlinks: number;
  organicTraffic: number;
  rankingKeywords: number;
  domainAgeYears: number;
  estimatedPages: number;
  contentPages?: number;
  productPages?: number;
  sitemapUrl?: string;
  trafficTrend?: 'Growing' | 'Stable' | 'Declining';
  intentMatch: 'Exact' | 'Partial' | 'Poor' | 'Mismatch';
  hasAiOverview: boolean;
  isWeakCompetitor: boolean;
  weaknessReasons: string[];
  topRankingKeywords?: { keyword: string; position: number; volume: number }[];
  topPages?: { url: string; title: string; traffic: number }[];

  // 7-Step Dedicated Website Detection Formula
  topicCoveragePercentage?: number; // 0-100%
  dedicatedClassification?: 'Dedicated (Coverage >70%)' | 'Partially Relevant (30-70%)' | 'Generic Portal (<30%)';
  hasKeywordInTitle?: boolean;
  hasKeywordInMenu?: boolean;
  hasKeywordInUrl?: boolean;
  siteSearchIndexedPages?: number;
  gl?: string;
  hl?: string;
}

export interface MultiCountryExpansionSeed {
  country: string;
  language: string;
  gl: string;
  hl: string;
  flag: string;
  seedKeyword: string;
  englishMeaning: string;
  estimatedMonthlySv: number;
  estimatedRpm: string;
  tier: string;
  googleLiveSerpUrl: string;
  rationale: string;
}

export const HIGHEST_PRIORITY_TIER_1 = [
  'United States',
  'Canada',
  'United Kingdom',
  'Australia',
  'Germany',
  'Switzerland',
  'Netherlands',
];

export const TIER_1_COUNTRIES = [
  ...HIGHEST_PRIORITY_TIER_1,
  'New Zealand',
  'France',
  'Sweden',
  'Norway',
  'Denmark',
  'Finland',
  'Austria',
  'Belgium',
  'Ireland',
  'Luxembourg',
  'Singapore',
  'Hong Kong',
  'Israel',
];

export const TIER_2_COUNTRIES = [
  'Japan',
  'South Korea',
  'Taiwan',
  'United Arab Emirates',
  'Saudi Arabia',
  'Qatar',
  'Kuwait',
  'Bahrain',
  'Oman',
  'Italy',
  'Spain',
  'Portugal',
  'Greece',
  'Czechia',
  'Poland',
  'Hungary',
  'Romania',
  'Slovakia',
  'Slovenia',
  'Croatia',
  'Estonia',
  'Latvia',
  'Lithuania',
  'Malta',
  'Cyprus',
  'Serbia',
  'Bulgaria',
  'Türkiye',
  'Turkey',
  'Malaysia',
  'Thailand',
  'Brunei',
  'South Africa',
  'Chile',
  'Argentina',
  'Uruguay',
  'Panama',
  'Costa Rica',
  'Mexico',
  'Brazil',
  'Colombia',
];

export function getCountryTierInfo(countryName: string): {
  tier: 'Tier 1 (Highest Priority)' | 'Tier 1' | 'Tier 2' | 'Tier 3 / Emerging';
  baseRpm: number;
  rpmRange: [number, number];
} {
  const norm = countryName.trim().toLowerCase();
  const isHighT1 = HIGHEST_PRIORITY_TIER_1.some((c) => c.toLowerCase() === norm);
  if (isHighT1) {
    return {
      tier: 'Tier 1 (Highest Priority)',
      baseRpm: 38.0,
      rpmRange: [30.0, 52.0],
    };
  }
  const isT1 = TIER_1_COUNTRIES.some((c) => c.toLowerCase() === norm);
  if (isT1) {
    return {
      tier: 'Tier 1',
      baseRpm: 30.0,
      rpmRange: [24.0, 42.0],
    };
  }
  const isT2 = TIER_2_COUNTRIES.some((c) => c.toLowerCase() === norm);
  if (isT2) {
    return {
      tier: 'Tier 2',
      baseRpm: 16.0,
      rpmRange: [10.0, 24.0],
    };
  }
  return {
    tier: 'Tier 3 / Emerging',
    baseRpm: 6.5,
    rpmRange: [3.5, 11.0],
  };
}

export interface MedianCompetitorStats {
  dr: { min: number; median: number; max: number };
  da: { min: number; median: number; max: number };
  pa: { min: number; median: number; max: number };
  rd: { min: number; median: number; max: number };
  backlinks: { min: number; median: number; max: number };
  traffic: { min: number; median: number; max: number };
  domainAgeYears: { min: number; median: number; max: number };
  pages: { min: number; median: number; max: number };
  rankingKeywords: { min: number; median: number; max: number };
}

export interface MonetizationOpportunity {
  type: BusinessModel;
  label: string;
  description: string;
  potentialIncomeRange: string;
  easeOfExecution: 'Easy' | 'Moderate' | 'Challenging';
  commercialIntentScore: number;
}

export interface TopicalSilo {
  siloName: string;
  targetKeywords: string[];
  articleAngles: { title: string; type: 'Pillar' | 'Commercial' | 'Informational' | 'Comparison' | 'Tool'; intent: SearchIntent }[];
}

export interface ScoringWeights {
  demand: number;              // default 15
  searchVolume: number;        // default 10
  trend: number;               // default 10
  serpWeakness: number;        // default 15
  competition: number;         // default 10
  intentOpportunity: number;   // default 10
  dedicatedPage: number;       // default 10
  monetization: number;        // default 10
  scalability: number;         // default 5
  aiOverviewCtr: number;       // default 5
}

export type ISkillsNicheCategory = 'Info' | 'APK' | 'Affiliate' | 'Ecom / Services' | 'Tool' | 'SAAS';

export interface ISkillsCriteriaRule {
  nicheType: ISkillsNicheCategory;
  volumeTier1: number;
  volumeRestOfWorld: number;
  volumeLabel: string;
  maxDA: number;
  maxKD: number;
  maxDR: number;
  maxPages: number;
  notes: string;
}

export const ISKILLS_CRITERIA_MATRIX: ISkillsCriteriaRule[] = [
  {
    nicheType: 'Info',
    volumeTier1: 15000,
    volumeRestOfWorld: 30000,
    volumeLabel: '15,000 (Tier 1) / 30,000 (Pakistan / Rest of World)',
    maxDA: 25,
    maxKD: 25,
    maxDR: 20,
    maxPages: 150,
    notes: 'Pakistan and emerging markets must be 30,000+. Tier 1 markets (US, UK, CA, AU, DE) require 15,000+.',
  },
  {
    nicheType: 'APK',
    volumeTier1: 30000,
    volumeRestOfWorld: 30000,
    volumeLabel: '30,000 minimum',
    maxDA: 25,
    maxKD: 25,
    maxDR: 20,
    maxPages: 150,
    notes: '30,000 minimum monthly search volume across all countries. Site pages < 150 if low DA.',
  },
  {
    nicheType: 'Affiliate',
    volumeTier1: 500,
    volumeRestOfWorld: 500,
    volumeLabel: '500 minimum (Commercial seed)',
    maxDA: 25,
    maxKD: 25,
    maxDR: 20,
    maxPages: 150,
    notes: 'Commercial intent seeds require minimum 500 monthly search volume.',
  },
  {
    nicheType: 'Ecom / Services',
    volumeTier1: 500,
    volumeRestOfWorld: 500,
    volumeLabel: '500 minimum (Commercial seed)',
    maxDA: 25,
    maxKD: 25,
    maxDR: 20,
    maxPages: 150,
    notes: 'Transactional and service buyer intent requires minimum 500 search volume.',
  },
  {
    nicheType: 'Tool',
    volumeTier1: 15000,
    volumeRestOfWorld: 30000,
    volumeLabel: '15,000 (Tier 1) / 30,000 (Rest of World)',
    maxDA: 25,
    maxKD: 25,
    maxDR: 20,
    maxPages: 150,
    notes: 'Zero AI Overview risk with interactive calculators & utility engines.',
  },
  {
    nicheType: 'SAAS',
    volumeTier1: 5000,
    volumeRestOfWorld: 5000,
    volumeLabel: '5,000 minimum',
    maxDA: 25,
    maxKD: 25,
    maxDR: 20,
    maxPages: 100,
    notes: 'Software solutions need minimum 5,000 volume. Competitors must have ≤ 100 pages.',
  },
];

export interface ISkillsCheckDetail {
  passed: boolean;
  actual: number | string;
  target: number | string;
  status: 'passed' | 'warning' | 'failed';
  label: string;
}

export interface ISkillsAuditResult {
  category: ISkillsNicheCategory;
  rule: ISkillsCriteriaRule;
  passedAll: boolean;
  scorePercentage: number;
  checks: {
    volume: ISkillsCheckDetail;
    da: ISkillsCheckDetail;
    kd: ISkillsCheckDetail;
    dr: ISkillsCheckDetail;
    sitePages: ISkillsCheckDetail;
  };
  summary: string;
}

export interface FastMoverCloneOpportunity {
  competitorDomain: string;
  dr: number;
  da: number;
  domainAgeYears: number;
  monthlyTraffic: number;
  isFastMoverWinner: boolean;
  topicalCompressionRatio: string;
  timeframeDays: number;
  executionStrategy: string;
}

export interface NicheViabilityReport {
  id: string;
  seedKeyword: string;
  nicheName: string;
  nicheType: NicheType;
  businessModel: BusinessModel;
  targetCountry: string;
  language: string;
  createdAt: string;

  // Executive Scores
  overallViabilityScore: number; // 0-100
  verdict: ViabilityVerdict;
  verdictRationale: string;
  keyReasons: string[];
  mainRisks: string[];
  whatToValidateNext: string[];
  adaptiveIntelligenceInsights?: string[];
  dataConfidenceScore: number; // 0-100

  // 1. Demand & Search Volume
  searchVolume: {
    seedSv: DataMetric<number>;
    globalSv: DataMetric<number>;
    targetCountrySv: DataMetric<number>;
    totalNicheSv: DataMetric<number>;
    averageSv: DataMetric<number>;
    keywordCount: number;
    countrySharePercentage: number;
    topCountries: { country: string; volume: number; share: number }[];
    topRegions: RegionDemand[];
  };

  // 2. Google Trends & Seasonality
  trends: {
    points12m: TrendPoint[];
    points5y: TrendPoint[];
    currentInterest: number;
    averageInterest: number;
    minInterest: number;
    maxInterest: number;
    growthPercentage: number;
    direction: 'Growing' | 'Stable' | 'Declining';
    classification: TrendClassification;
    isEvergreen: boolean;
    seasonalityPattern: string;
    risingQueries: { query: string; growth: string }[];
  };

  // 3. Keywords & Clustering
  keywords: {
    items: KeywordItem[];
    clusters: { name: string; intent: SearchIntent; totalVolume: number; count: number }[];
  };

  // 4. SERP & Competitors
  serp: {
    targetKeyword: string;
    aiOverviewPresent: boolean;
    aiOverviewImpact: 'High' | 'Medium' | 'Low' | 'None';
    weakCompetitorCount: number; // Target: >= 3
    competitors: CompetitorResult[];
    medians: MedianCompetitorStats;
    gl?: string;
    hl?: string;
    googleLiveSerpUrl?: string;
  };

  // Localized Multi-Country Expansions (Tier 1 & Tier 2)
  multiCountryExpansions?: MultiCountryExpansionSeed[];

  // 5. Search Intent & Gap Analysis
  intentAnalysis: {
    primaryIntent: SearchIntent;
    serpIntentMatch: 'Strong' | 'Mixed' | 'Mismatch';
    intentMismatchDetected: boolean;
    mismatchExplanation: string;
    gapOpportunities: string[];
    forumsRankingCount: number;
    thinContentCount: number;
  };

  // 6. Dedicated Page Opportunity
  dedicatedPageAudit: {
    dedicatedWebsiteExists: boolean;
    dedicatedLandingPageExists: boolean;
    exactIntentPageExists: boolean;
    opportunityLevel: 'HIGH' | 'MEDIUM' | 'LOW';
    analysis: string;
  };

  // 7. AI Overview & CTR Analysis
  ctrAnalysis: {
    estimatedTop3Ctr: number;
    estimatedTop1Ctr: number;
    potentialClicksMonthly: number;
    serpCrowdedness: 'Low' | 'Moderate' | 'Heavy';
    factors: string[];
  };

  // 8. Monetization
  monetization: {
    primaryModel: BusinessModel;
    monetizationScore: number; // 0-100
    estimatedMonthlyRevenueRange: string;
    commercialIntent: 'High' | 'Medium' | 'Low';
    opportunities: MonetizationOpportunity[];
  };

  // 9. Scalability & Content Silos
  scalability: {
    rating: 'HIGH' | 'MEDIUM' | 'LOW';
    score: number; // 0-100
    subNiches: { name: string; rationale: string; estimatedVolume: string }[];
    silos: TopicalSilo[];
  };

  // 10. AI / LLM Risk & Policy
  riskAnalysis: {
    aiRiskLevel: 'Low Risk' | 'Moderate Risk' | 'High Risk' | 'Restricted / Avoid';
    policyStatus: 'Compliant' | 'Caution' | 'Restricted';
    isYmyl: boolean;
    isGovernmentRelated: boolean;
    governmentContext?: string;
    riskFactors: string[];
  };

  // 11. Score Factors Breakdown
  scoreBreakdown: {
    demandScore: number;
    searchVolumeScore: number;
    trendScore: number;
    serpWeaknessScore: number;
    competitionScore: number;
    intentOpportunityScore: number;
    dedicatedPageScore: number;
    monetizationScore: number;
    scalabilityScore: number;
    aiOverviewCtrScore: number;
  };

  // 12. Official iSkills Criteria Audit
  iSkillsAudit?: ISkillsAuditResult;

  // 13. Fast-Mover Clone Formula
  fastMoverOpportunity?: FastMoverCloneOpportunity;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  createdAt: string;
  apiUsageCount: number;
}

export interface SavedNicheItem {
  id: string;
  userId: string;
  researchId: string;
  nicheName: string;
  seedKeyword: string;
  targetCountry: string;
  viabilityScore: number;
  previousScore?: number;
  scoreDelta?: number;
  lastRecalculatedAt?: string;
  serpVolatility?: 'Low' | 'Moderate' | 'High';
  demandMomentum?: 'Rising' | 'Stable' | 'Dip';
  verdict: ViabilityVerdict;
  status: SavedNicheStatus;
  tags: string[];
  notes: string;
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LivePulseStatus {
  active: boolean;
  intervalSeconds: number;
  lastRunAt: string | null;
  totalRecalculations: number;
  activeNichesCount: number;
  recentDeltas: Array<{
    nicheId: string;
    nicheName: string;
    oldScore: number;
    newScore: number;
    delta: number;
    timestamp: string;
  }>;
}

export interface RecalculationResult {
  nicheId: string;
  researchId: string;
  nicheName: string;
  oldScore: number;
  newScore: number;
  delta: number;
  verdict: ViabilityVerdict;
  serpVolatility: 'Low' | 'Moderate' | 'High';
  recalculatedAt: string;
}

export interface ApiKeyConfig {
  id: string;
  userId: string;
  provider: string;
  isActive: boolean;
  status: 'valid' | 'invalid' | 'untested';
  lastTestedAt?: string;
}

export interface SystemLog {
  id: string;
  userId?: string;
  level: 'info' | 'warn' | 'error';
  module: string;
  message: string;
  details?: any;
  timestamp: string;
}

export type AutopilotSector =
  | 'challenger_brands'
  | 'programmatic_data'
  | 'micro_calculators'
  | 'nano_affiliate'
  | 'marketplace_templates'
  | 'high_rpm_info'
  | 'fast_mover_viral_seeds';

export interface AutopilotConfig {
  enabled: boolean;
  scanIntervalMinutes: number;
  targetTiers: ('tier1' | 'tier2')[];
  selectedSectors: AutopilotSector[];
  minViabilityScore: number;
  maxCompetitorDr: number;
  autoSaveToVault: boolean;
  lastAutoRunAt: string | null;
  totalAutopilotDiscovered: number;
}

export interface AutopilotDiscoveredItem {
  id: string;
  researchId: string;
  seedKeyword: string;
  nicheName: string;
  sector: AutopilotSector;
  sectorLabel: string;
  nicheType: NicheType;
  businessModel: BusinessModel;
  targetCountry: string;
  countryTier: string;
  estimatedRpm: string;
  viabilityScore: number;
  verdict: ViabilityVerdict;
  weakCompetitorCount: number;
  standoutWeakDr: number;
  monthlySearchVolume: number;
  estimatedMonthlyRevenue: string;
  recommendedAssetType: string;
  aiOverviewPresent: boolean;
  whyItIsUntapped: string;
  discoveredAt: string;
  autoSaved: boolean;
}

export interface AutopilotStatus {
  active: boolean;
  config: AutopilotConfig;
  totalDiscovered: number;
  highViabilityCount: number;
  lowDrAnomalyCount: number;
  averageDiscoveredScore: number;
  recentDiscoveries: AutopilotDiscoveredItem[];
  liveLogs: Array<{ id: string; timestamp: string; message: string; level: 'info' | 'success' | 'warn' }>;
}

export type SearchOrigin = 'manual' | 'auto_hunter' | 'marketplace_reverse' | 'anomaly_scanner';

export interface ResearchDeductions {
  summary: string;
  weakCompetitorsFound: number;
  lowestCompetitorDr: number;
  zeroClickImmune: boolean;
  aiOverviewActive: boolean;
  countryTier: string;
  estimatedRpm: string;
  recommendedAsset: string;
  estimatedMonthlyRevenue: string;
  topKeyReasons: string[];
  keyRisks: string[];
  expansionCount?: number;
}

export interface ResearchRecord {
  id: string;
  userId: string;
  seedKeyword: string;
  nicheType: string;
  businessModel: string;
  targetCountry: string;
  language: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  progress: number;
  currentPhase: number;
  viabilityScore: number;
  verdict: string;
  dataConfidence: number;
  searchOrigin?: SearchOrigin;
  executedBy?: string;
  deductions?: ResearchDeductions;
  report?: NicheViabilityReport;
  createdAt: string;
  updatedAt: string;
}


