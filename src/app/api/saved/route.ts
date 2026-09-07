import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { SavedNicheStatus } from '@/lib/providers/types';

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    const userId = user?.id;
    const saved = db.getSavedNiches(userId);
    return NextResponse.json({ success: true, saved });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    const userId = user?.id || 'usr_demo_02';
    const body = await req.json();

    const { id, researchId, nicheName, seedKeyword, targetCountry, viabilityScore, verdict, status, tags, notes, pinned } = body;

    if (id && (!researchId || !nicheName)) {
      // Update existing
      const updated = db.updateSavedNicheStatus(id, status as SavedNicheStatus, notes, tags);
      return NextResponse.json({ success: true, savedNiche: updated });
    }

    // Create or save full item
    const newItem = {
      id: id || `sn_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId,
      researchId: researchId || 'res_manual',
      nicheName: nicheName || 'Custom Niche',
      seedKeyword: seedKeyword || '',
      targetCountry: targetCountry || 'United States',
      viabilityScore: Number(viabilityScore) || 75,
      verdict: verdict || 'GO',
      status: (status as SavedNicheStatus) || 'researching',
      tags: Array.isArray(tags) ? tags : [],
      notes: notes || '',
      pinned: Boolean(pinned),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const saved = db.saveNiche(newItem);
    return NextResponse.json({ success: true, savedNiche: saved });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 });
    }

    db.deleteSavedNiche(id, user?.id);
    return NextResponse.json({ success: true, message: 'Saved niche deleted' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
