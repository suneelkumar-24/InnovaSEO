import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { AiProvider } from '@/lib/providers/ai-provider';

export async function GET(req: NextRequest) {
  try {
    const settings = db.getSettings();
    const data = db.getResearches();
    const activeKeys = [
      { provider: 'gemini', isActive: Boolean(process.env.GEMINI_API_KEY), status: process.env.GEMINI_API_KEY ? 'valid' : 'unconfigured' },
      { provider: 'groq', isActive: Boolean(process.env.GROQ_API_KEY), status: process.env.GROQ_API_KEY ? 'valid' : 'unconfigured' },
      { provider: 'openrouter', isActive: Boolean(process.env.OPENROUTER_API_KEY), status: process.env.OPENROUTER_API_KEY ? 'valid' : 'unconfigured' },
      { provider: 'ollama', isActive: true, status: 'ready' },
      { provider: 'claude', isActive: Boolean(process.env.ANTHROPIC_API_KEY), status: process.env.ANTHROPIC_API_KEY ? 'valid' : 'unconfigured' },
      { provider: 'serpapi', isActive: false, status: 'optional' },
      { provider: 'moz', isActive: false, status: 'optional' },
      { provider: 'ahrefs', isActive: false, status: 'optional' },
      { provider: 'semrush', isActive: false, status: 'optional' },
    ];

    return NextResponse.json({
      success: true,
      settings,
      apiKeys: activeKeys,
      totalResearchesCount: data.length,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    const body = await req.json();
    const { action } = body;

    // 1. UPDATE SCORING WEIGHTS
    if (action === 'update_weights') {
      const { weights } = body;
      const updated = db.updateScoringWeights(weights);
      db.addLog({
        userId: user?.id,
        level: 'info',
        module: 'Settings',
        message: 'Updated SEBT-NEXT scoring weights configuration.',
      });
      return NextResponse.json({ success: true, scoringWeights: updated });
    }

    // 2. UPDATE AVOID LIST
    if (action === 'update_avoid_list') {
      const { avoidList } = body;
      const updated = db.updateAvoidList(avoidList);
      db.addLog({
        userId: user?.id,
        level: 'info',
        module: 'Settings',
        message: 'Updated restricted/avoid niches blacklist.',
      });
      return NextResponse.json({ success: true, avoidList: updated });
    }

    // 3. TEST PROVIDER CONNECTION
    if (action === 'test_provider') {
      const { provider } = body;
      if (['gemini', 'groq', 'openrouter', 'ollama', 'claude'].includes(provider)) {
        try {
          const testRes = await AiProvider.testDirectConnection(provider);
          return NextResponse.json({
            success: true,
            message: `${provider.toUpperCase()} Connection Successful! Response: "${testRes.trim().slice(0, 70)}"`,
          });
        } catch (e: any) {
          const errDetail = e?.message || 'Connection failed';
          let userFriendlyTip = errDetail;
          if (provider === 'ollama') {
            userFriendlyTip = `Local AI (Ollama / LM Studio) is not running on http://127.0.0.1:11434. To use Local AI, start Ollama with "ollama run hermes3" or launch LM Studio local server.`;
          } else if (provider === 'groq' && !process.env.GROQ_API_KEY) {
            userFriendlyTip = `GROQ_API_KEY is not configured in .env.local. Get a free key at https://console.groq.com/keys`;
          } else if (provider === 'openrouter' && !process.env.OPENROUTER_API_KEY) {
            userFriendlyTip = `OPENROUTER_API_KEY is not configured in .env.local. Get a free key at https://openrouter.ai/settings/keys`;
          }
          return NextResponse.json({ success: false, error: `${provider.toUpperCase()} Test Failed: ${userFriendlyTip}` }, { status: 400 });
        }
      }

      return NextResponse.json({ success: true, message: `${provider.toUpperCase()} provider adapter is ready.` });
    }

    return NextResponse.json({ success: false, error: 'Invalid settings action.' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
