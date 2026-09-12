import { NextRequest, NextResponse } from 'next/server';
import { AiProvider } from '@/lib/providers/ai-provider';
import { getCountryGeoConfig } from '@/lib/geo';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      seed,
      modifier,
      customSeed,
      targetCountry = 'United States',
      language = 'English',
      archetype,
      industry,
    } = body;

    const geoConfig = getCountryGeoConfig(targetCountry);
    const activeSeed = (seed || customSeed || modifier || '').trim();

    if (!activeSeed) {
      return NextResponse.json(
        { success: false, error: 'Seed keyword or query is required' },
        { status: 400 }
      );
    }

    const minRpm = geoConfig.rpmRange[0];
    const maxRpm = geoConfig.rpmRange[1];

    const prompt = `You are the ultimate Ahrefs & Autonomous Micro-Niche SERP Anomaly Engine following the master 12-point micro-niche evaluation methodology.
You are analyzing the query: "${activeSeed}" ${industry ? `(Industry: ${industry})` : ''} for target country "${targetCountry}" (Language: "${language}", Tier: ${geoConfig.tier}, Base RPM: $${minRpm}-$${maxRpm}).
Archetype: "${archetype || 'Micro Niche / Programmatic / Tool'}".

Simulate an exact Ahrefs Keywords Explorer & SERP Vulnerability scan with these MANDATORY FILTERS:
1. "Lowest DR: Up to 20 in Top 10" (At least 2+ websites with DR < 20 ranking on Page 1)
2. "SERP features: Don't include AI Overview" (Zero-click immune)

Return a strictly valid JSON response with this exact structure:
{
  "seed": "${activeSeed}",
  "country": "${targetCountry}",
  "tier": "${geoConfig.tier}",
  "category": "${archetype || 'Micro-Niche / SERP Anomaly'}",
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
