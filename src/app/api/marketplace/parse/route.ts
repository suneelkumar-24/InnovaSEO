import { NextRequest, NextResponse } from 'next/server';
import { MarketplaceProvider } from '@/lib/providers/marketplace-provider';
import { getUserFromRequest } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    const userId = user?.id || 'usr_demo_02';

    const body = await req.json();
    const { urlOrText, targetCountry = 'United States' } = body;

    if (!urlOrText || typeof urlOrText !== 'string' || !urlOrText.trim()) {
      return NextResponse.json(
        { success: false, error: 'Please provide a valid Flippa URL, website domain, or listing text.' },
        { status: 400 }
      );
    }

    db.addLog({
      userId,
      level: 'info',
      module: 'MarketplaceReverseEngineer',
      message: `Reverse engineering marketplace listing: "${urlOrText.slice(0, 60)}"`,
    });

    const intelligence = await MarketplaceProvider.reverseEngineer({
      urlOrText: urlOrText.trim(),
      targetCountry,
    });

    return NextResponse.json({
      success: true,
      data: intelligence,
    });
  } catch (error: any) {
    console.error('Marketplace reverse-engineering API error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
