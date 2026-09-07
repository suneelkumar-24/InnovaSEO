import { NextRequest, NextResponse } from 'next/server';
import { generateWithGemini } from '@/lib/gemini';
import { generateWithClaude } from '@/lib/claude';

export async function POST(req: NextRequest) {
  try {
    const { keyword, category, provider = 'gemini' } = await req.json();

    if (!keyword) {
      return NextResponse.json({ error: 'Keyword or interest is required' }, { status: 400 });
    }

    const prompt = `You are an elite Niche Intelligence & Market Research AI.
Analyze the following topic / market segment: "${keyword}" (Category: "${category || 'General'}").

Return a detailed, actionable niche discovery report in valid JSON format with the following structure:
{
  "niche_name": "string",
  "profitability_score": number between 1 and 100,
  "competition_level": "Low" | "Medium" | "High",
  "target_audience": "string",
  "market_demand_summary": "string",
  "monetization_opportunities": [
    { "model": "Affiliate / Digital Products / SaaS / Services", "description": "string", "potential_income": "string" }
  ],
  "low_competition_sub_niches": [
    { "name": "string", "why_it_works": "string", "search_volume_estimate": "string" }
  ],
  "content_ideas": [
    "string"
  ],
  "risks_and_challenges": [
    "string"
  ]
}

Important: Return ONLY the JSON object, without any markdown formatting or commentary.`;

    let rawOutput = '';
    let usedProvider = provider;

    if (provider === 'claude') {
      try {
        rawOutput = await generateWithClaude(prompt);
      } catch (e: any) {
        // Fallback to Gemini if Claude fails or key missing
        if (process.env.GEMINI_API_KEY) {
          rawOutput = await generateWithGemini(prompt);
          usedProvider = 'gemini (fallback)';
        } else {
          throw e;
        }
      }
    } else {
      try {
        rawOutput = await generateWithGemini(prompt);
      } catch (e: any) {
        // Fallback to Claude if Gemini fails
        if (process.env.ANTHROPIC_API_KEY) {
          rawOutput = await generateWithClaude(prompt);
          usedProvider = 'claude (fallback)';
        } else {
          throw e;
        }
      }
    }

    // Clean JSON text
    let cleanJson = rawOutput.trim();
    if (cleanJson.startsWith('```json')) {
      cleanJson = cleanJson.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanJson.startsWith('```')) {
      cleanJson = cleanJson.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    const parsed = JSON.parse(cleanJson);
    return NextResponse.json({
      success: true,
      provider: usedProvider,
      data: parsed
    });

  } catch (error: any) {
    console.error('Niche Hunt API Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to analyze niche'
    }, { status: 500 });
  }
}
