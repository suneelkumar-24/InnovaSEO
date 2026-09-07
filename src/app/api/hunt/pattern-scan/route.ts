import { NextRequest, NextResponse } from 'next/server';
import { AiProvider } from '@/lib/providers/ai-provider';
import { MASTER_PATTERN_VAULT } from '@/lib/engine/pattern-vault';
import { getCountryGeoConfig } from '@/lib/geo';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { bucketId, modifierId, customSeed, targetCountry = 'United States', language = 'English' } = body;

    const geoConfig = getCountryGeoConfig(targetCountry);

    // Find bucket & modifier metadata
    const bucket = MASTER_PATTERN_VAULT.find((b) => b.id === bucketId) || MASTER_PATTERN_VAULT[0];
    const modifier = bucket.modifiers.find((m) => m.id === modifierId) || bucket.modifiers[0];
    const activeSeed = customSeed?.trim() || modifier.exampleSeed;

    const minRpm = geoConfig.rpmRange[0];
    const maxRpm = geoConfig.rpmRange[1];

    const prompt = `You are the ultimate Ahrefs & Autonomous Micro-Niche SERP Anomaly Engine following Sir M Tanveer Nandla's 12-point methodology.
You are analyzing the pattern modifier "${modifier.name}" (Seed: "${activeSeed}") for target country "${targetCountry}" (Language: "${language}", Tier: ${geoConfig.tier}, Base RPM: $${minRpm}-$${maxRpm}).

Simulate an exact Ahrefs Keywords Explorer & SERP Vulnerability scan with these MANDATORY FILTERS:
1. "Lowest DR: Up to 20 in Top 10" (At least 2+ websites with DR < 20 ranking on Page 1)
2. "SERP features: Don't include AI Overview" (Zero-click immune)

Return a strictly valid JSON response with this exact structure:
{
  "seed": "${activeSeed}",
  "country": "${targetCountry}",
  "tier": "${geoConfig.tier}",
  "bucketTitle": "${bucket.title}",
  "totalKeywordsFound": number (e.g. 14 to 31873),
  "searchVolume": number (monthly search volume for primary term),
  "trafficPotential": number (total traffic potential in country),
  "globalTrafficPotential": number,
  "kd": number (0-100 difficulty),
  "cpc": number,
  "aiOverviewStatus": "No AI Overview (100% Zero-Click Immune)" | "Active (Summarized)",
  "weakDomainsCountInTop10": number (e.g. 3 or 4 sites with DR < 20 in top 10),
  "standoutAnomaly": {
    "targetDomain": "e.g. floorplanai.io or rummywinner.in",
    "domainRating": number (e.g. 17 or 4),
    "rankingPosition": number (e.g. 1 or 2),
    "monthlyTraffic": number (e.g. 57000 or 120000),
    "domainAgeYears": number (e.g. 1.2 or 0.8),
    "pageCount": number,
    "coverageType": "Dedicated Apex Niche Site (>70% Topical Coverage)" | "Partial Hub"
  },
  "keywords": [
    {
      "keyword": "string",
      "sv": number,
      "tp": number,
      "gtp": number,
      "kd": number,
      "cpc": number,
      "intents": ["I", "C", "T"]
    }
  ],
  "monetization": {
    "rpmRange": "$${minRpm} - $${maxRpm}",
    "estimatedMonthlyRevenuePos1": number (monthly USD at #1 CTR 32%),
    "estimatedMonthlyRevenuePos2": number (monthly USD at #2 CTR 22%),
    "estimatedMonthlyRevenuePos3": number (monthly USD at #3 CTR 16%),
    "exitValuation35x": number,
    "primaryMethod": "Display Ads + Affiliate / SaaS Credits"
  },
  "whatYouShouldBuild": {
    "archetype": "Single-Page Interactive Tool" | "Programmatic Database (500+ URLs)" | "APK Download Gateway" | "Transactional Service Hub",
    "coreFeatures": ["string", "string", "string"],
    "recommendedTech": "Next.js 15 App Router + Tailwind + Supabase/SQLite",
    "targetPageCount": number,
    "domainSuggestions": [
      "string.com",
      "string.io",
      "string.co"
    ]
  },
  "viabilityScore": number (0-100),
  "verdict": "STRONG GO" | "GO" | "RESEARCH MORE",
  "strategicVerdict": "string (2-3 sentences explaining why this anomaly is a diamond opportunity)"
}
`;

    const data = await AiProvider.generateJson<any>(prompt);
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Error in pattern-scan API:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Pattern scan failed' },
      { status: 500 }
    );
  }
}
