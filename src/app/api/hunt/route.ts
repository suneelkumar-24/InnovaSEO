import { NextRequest, NextResponse } from 'next/server';
import { AiProvider } from '@/lib/providers/ai-provider';

export async function POST(req: NextRequest) {
  try {
    const { keyword, category, targetCountry = 'United States', provider = 'auto' } = await req.json();

    if (!keyword) {
      return NextResponse.json({ error: 'Keyword or interest is required' }, { status: 400 });
    }

    const prompt = `You are an elite Micro-Niche & Market Opportunity Intelligence Engine.
Analyze the following topic / market segment: "${keyword}" (Category: "${category || 'General'}", Target Country: "${targetCountry}").

Apply the 5 Core Micro-Niche Principles:
1. Target Challenger / Secondary Brands (DR 0-5 Ranking Anomaly) instead of saturated giants.
2. Emphasize Zero AI Overview Risk queries (Raw tables, dimensions, specifications, prices, calculators).
3. Evaluate Multi-Country Geo Arbitrage (Tier 1 Non-English e.g. Germany Preise, Netherlands Prijzen, France Tarifs).
4. Enforce 12-Point Master Checklist Benchmarks (DR < 20 count in Top 10, Target Low DR site, Domain Age < 2 yrs).
5. Recommend the exact asset type ("Programmatic Database Site", "Single-Page Interactive Tool", "Topical Authority Info Blog").

Return valid JSON matching this exact structure:
{
  "niche_name": "string",
  "profitability_score": 88,
  "competition_level": "Low" | "Medium" | "High",
  "target_audience": "string",
  "market_demand_summary": "string",
  "recommended_asset_type": "Programmatic Database Site (500+ URLs)" | "Single-Page Interactive Tool" | "Topical Authority Info Blog",
  "ai_overview_risk": "Zero AI Overview Threat (Raw Data Tables / Tool)",
  "monetization_opportunities": [
    { "model": "Tier 1 Display Ads ($35-$52 RPM) / Affiliate / Micro-SaaS", "description": "string", "potential_income": "$1,200 - $4,500/mo" }
  ],
  "low_competition_sub_niches": [
    { "name": "string", "seed_keyword": "string", "why_it_works": "string", "search_volume_estimate": "3,500 - 18,000/mo", "target_dr_anomaly": "DR 3 site ranking #2" }
  ],
  "geo_expansion_opportunities": [
    { "country": "Germany", "native_seed": "string", "estimated_sv": 12000, "estimated_rpm": "$38 - $50" }
  ],
  "checklist_12_point_summary": {
    "target_keyword": "string",
    "intent": "INFORMATIONAL / PROGRAMMATIC",
    "search_volume": "string",
    "low_dr_sites_in_top10": "3 sites under DR 20",
    "target_benchmark_site": "low-dr-competitor.com (DR 4, Age 1.2 yrs, 34k visits/mo)",
    "monetization_verdict": "Display Ads + Affiliates (35x valuation multiplier)"
  },
  "content_ideas": [
    "string"
  ],
  "risks_and_challenges": [
    "string"
  ]
}`;

    const parsed = await AiProvider.generateJson<any>(prompt, {
      provider: provider === 'auto' ? undefined : provider,
    });

    return NextResponse.json({
      success: true,
      provider: process.env.DEFAULT_AI_PROVIDER || 'groq (openai/gpt-oss-120b)',
      data: parsed,
    });
  } catch (error: any) {
    console.error('Niche Hunt API Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to analyze niche',
    }, { status: 500 });
  }
}

