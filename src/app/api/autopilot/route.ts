import { NextRequest, NextResponse } from 'next/server';
import { AutopilotEngine } from '@/lib/engine/autopilot-engine';
import { db } from '@/lib/db';
import { AutopilotConfig } from '@/lib/providers/types';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized. Please log in.' }, { status: 401 });
    }

    const status = AutopilotEngine.getStatus();
    return NextResponse.json({
      success: true,
      ...status,
    });
  } catch (err: any) {
    console.error('Autopilot GET error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized. Please log in.' }, { status: 401 });
    }

    const body = await req.json();
    const { action } = body;

    if (action === 'run_now') {
      const batchSize = Number(body.batchSize) || 3;
      const sector = body.sector || undefined;
      const tier = body.tier || undefined;
      const forceAiDiscovery = Boolean(body.forceAiDiscovery);

      const result = await AutopilotEngine.runAutonomousBatch({
        batchSize,
        sector,
        tier,
        forceAiDiscovery,
      });

      const updatedStatus = AutopilotEngine.getStatus();

      return NextResponse.json({
        success: true,
        summary: result.summary,
        discoveredItems: result.discoveredItems,
        status: updatedStatus,
      });
    }

    if (action === 'toggle') {
      const current = db.getAutopilotConfig();
      const updated = db.updateAutopilotConfig({ enabled: !current.enabled });
      AutopilotEngine.addLiveLog(
        `Autopilot radar scanner ${updated.enabled ? 'ENABLED [Active Background Daemon]' : 'PAUSED'}.`,
        updated.enabled ? 'success' : 'warn'
      );
      return NextResponse.json({
        success: true,
        config: updated,
      });
    }

    if (action === 'update_config') {
      const configUpdate: Partial<AutopilotConfig> = {};
      if (typeof body.enabled === 'boolean') configUpdate.enabled = body.enabled;
      if (body.scanIntervalMinutes) configUpdate.scanIntervalMinutes = Number(body.scanIntervalMinutes);
      if (Array.isArray(body.targetTiers)) configUpdate.targetTiers = body.targetTiers;
      if (Array.isArray(body.selectedSectors)) configUpdate.selectedSectors = body.selectedSectors;
      if (typeof body.minViabilityScore === 'number') configUpdate.minViabilityScore = body.minViabilityScore;
      if (typeof body.maxCompetitorDr === 'number') configUpdate.maxCompetitorDr = body.maxCompetitorDr;
      if (typeof body.autoSaveToVault === 'boolean') configUpdate.autoSaveToVault = body.autoSaveToVault;

      const updated = db.updateAutopilotConfig(configUpdate);
      AutopilotEngine.addLiveLog('Autopilot configuration parameters updated.', 'info');

      return NextResponse.json({
        success: true,
        config: updated,
      });
    }

    if (action === 'clear') {
      db.clearAutopilotDiscovered();
      AutopilotEngine.addLiveLog('Autopilot discovery stream cleared by operator.', 'info');
      return NextResponse.json({
        success: true,
        message: 'Discovered stream cleared',
      });
    }

    return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
  } catch (err: any) {
    console.error('Autopilot POST error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
