import { NextRequest, NextResponse } from 'next/server';
import { AiProvider } from '@/lib/providers/ai-provider';
import { getCountryGeoConfig, getGoogleSearchUrl } from '@/lib/geo';

export async function POST(req: NextRequest) {
  try {
    const { topic, industry, nicheType = 'micro', businessModel = 'affiliate', mode = 'niche_ideas' } = await req.json();

    if (!topic && !industry) {
      return NextResponse.json({ success: false, error: 'Topic or industry is required' }, { status: 400 });
    }

    const query = topic || industry;

    if (mode === 'multi_country_expansion') {
      const prompt = `You are a Global SEO & Multi-Country Micro-Niche Localization Specialist.
Given the seed topic or entity: "${query}" (Niche archetype: ${nicheType}, Model: ${businessModel}).
Generate an international shortlist of 8 high-opportunity country expansions across Tier 1 & Tier 2 non-English and localized markets (e.g. Germany, Japan, Turkey, Netherlands, France, Spain, Brazil/Portugal, Indonesia).

For each country, provide:
1. Native language seed keyword (e.g. German "Starbucks Preise", Japanese "スタバ メニュー", Turkish "Starbucks fiyatları", Dutch "Starbucks prijzen", Indonesian "harga menu Starbucks").
2. English equivalent meaning.
3. Realistic monthly search volume in that local country.
4. Estimated Display Ad RPM / Affiliate potential.
5. Why this localized domestic SERP has low DR <20 ranking opportunity.

Return ONLY a JSON array matching this exact schema:
[
  {
    "country": "Germany" | "Japan" | "Netherlands" | "Turkey" | "France" | "Spain" | "Brazil" | "Indonesia",
    "language": "German" | "Japanese" | "Dutch" | "Turkish" | "French" | "Spanish" | "Portuguese" | "Indonesian",
    "seedKeyword": "exact localized keyword string in native script/language",
    "englishMeaning": "English translation / equivalent meaning",
    "estimatedMonthlySv": number,
    "potentialRating": "★★★★★",
    "whyUntapped": "Short explanation of low competition anomaly"
  }
]`;

      const rawExpansions = await AiProvider.generateJson<any[]>(prompt);
      const expansions = (rawExpansions || []).map((item) => {
        const geo = getCountryGeoConfig(item.country);
        return {
          country: item.country || geo.countryName,
          language: item.language || geo.defaultLanguage,
          gl: geo.gl,
          hl: geo.hl,
          flag: geo.flag,
          seedKeyword: item.seedKeyword || query,
          englishMeaning: item.englishMeaning || query,
          estimatedMonthlySv: Number(item.estimatedMonthlySv) || 3500,
          estimatedRpm: `$${geo.rpmRange[0]} - $${geo.rpmRange[1]}`,
          tier: geo.tier,
          potentialRating: item.potentialRating || '★★★★★',
          googleLiveSerpUrl: getGoogleSearchUrl(item.seedKeyword || query, item.country, item.language),
          whyUntapped: item.whyUntapped || `Low competition in domestic ${geo.countryName} SERP.`,
        };
      });

      return NextResponse.json({
        success: true,
        mode: 'multi_country_expansion',
        expansions,
      });
    }

    const prompt = `You are an elite Niche Discovery & SEO Opportunity Architect.
Generate 6 untapped, highly specific micro-niche / nano-niche ideas based on:
- Topic/Seed: "${query}"
- Preferred Niche Type: "${nicheType}"
- Preferred Business Model: "${businessModel}"

Critical Heuristics & Rules:
1. Target Challenger / Secondary Brands & Entities (e.g. Popeyes, Arby's, Little Caesars, Subway, specialized tools) to find DR 0-5 traffic anomalies.
2. Emphasize Zero AI Overview risk queries (raw pricing tables, dimensions, specifications, calculators, conversion tools).
3. Include at least 2 high-RPM non-English Tier 1 opportunities (e.g. Germany "Preise", Japan "メニュー", Netherlands "prijzen").
4. Follow Search Volume Geo-Rules:
   - Tier 1 Countries (US, UK, AUS, EU/DE/CA, JP): Low SV (~15K/mo total or 1.5k-6k seed) is completely fine because $30-$52 RPM yields $500+/mo easily.
   - Southeast Asia / India: Require 30K+ SV for viable revenue.

Return ONLY a JSON array matching this schema:
[
  {
    "nicheName": "Micro-Niche Title",
    "seedKeyword": "exact seed keyword to research",
    "suggestedCountry": "United States" | "Germany" | "Japan" | "United Kingdom" | "Netherlands" | "Canada",
    "suggestedLanguage": "English" | "German" | "Japanese" | "Dutch",
    "nicheType": "nano" | "micro" | "micro-nano" | "utility" | "affiliate" | "e-commerce" | "lead-generation" | "tool-based" | "menu",
    "problemSolved": "Exact pain point or solution",
    "targetAudience": "Specific demographic",
    "estimatedMonthlySv": "1,500 - 6,000",
    "monetizationAngle": "Tier 1 Display Ads ($35+ RPM) / Affiliate / Micro-SaaS",
    "hiddenGemProbability": "94% (DR 0-5 Competitor Anomaly)",
    "whyItIsUntapped": "Short sentence explaining why big sites overlook this angle"
  }
]`;

    const ideas = await AiProvider.generateJson<any[]>(prompt);

    return NextResponse.json({
      success: true,
      ideas,
    });
  } catch (error: any) {
    console.error('Ideation API Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to generate niche ideas.',
    }, { status: 500 });
  }
}
