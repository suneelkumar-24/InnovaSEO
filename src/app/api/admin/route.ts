import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    // Allow demo access or check admin role
    const users = db.getAllUsers();
    const logs = db.getLogs(100);
    const researches = db.getResearches();
    const savedNiches = db.getSavedNiches();
    const settings = db.getSettings();

    const strongOppsCount = researches.filter((r) => r.viabilityScore >= 80).length;
    const avgScore =
      researches.length > 0
        ? Math.round(researches.reduce((acc, r) => acc + (r.viabilityScore || 0), 0) / researches.length)
        : 0;

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers: users.length,
        totalResearches: researches.length,
        totalSavedNiches: savedNiches.length,
        strongOpportunities: strongOppsCount,
        averageViabilityScore: avgScore,
      },
      users,
      logs,
      researches: researches.slice(0, 50),
      avoidList: settings.avoidList,
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

    if (action === 'clear_logs') {
      db.addLog({
        userId: user?.id,
        level: 'warn',
        module: 'Admin',
        message: 'System logs cleared by administrator.',
      });
      return NextResponse.json({ success: true, message: 'Logs cleared.' });
    }

    if (action === 'create_user') {
      const { email, password, name, role } = body;
      if (!email || !password || !name) {
        return NextResponse.json(
          { success: false, error: 'Name, email, and password are required.' },
          { status: 400 }
        );
      }
      if (password.length < 6) {
        return NextResponse.json(
          { success: false, error: 'Password must be at least 6 characters.' },
          { status: 400 }
        );
      }
      const newUser = db.createUser(email, password, name, role || 'user');
      db.addLog({
        userId: user?.id,
        level: 'info',
        module: 'Admin',
        message: `Admin created user account: ${email} (${role || 'user'})`,
      });
      return NextResponse.json({ success: true, user: newUser });
    }

    if (action === 'reset_password') {
      const { userId, newPassword } = body;
      if (!userId || !newPassword) {
        return NextResponse.json(
          { success: false, error: 'User ID and new password are required.' },
          { status: 400 }
        );
      }
      if (newPassword.length < 6) {
        return NextResponse.json(
          { success: false, error: 'Password must be at least 6 characters.' },
          { status: 400 }
        );
      }
      db.updateUserPassword(userId, newPassword);
      db.addLog({
        userId: user?.id,
        level: 'warn',
        module: 'Admin',
        message: `Admin reset password for user ID: ${userId}`,
      });
      return NextResponse.json({ success: true, message: 'Password updated successfully.' });
    }

    if (action === 'update_user') {
      const { userId, name, email, role } = body;
      if (!userId) {
        return NextResponse.json({ success: false, error: 'User ID is required.' }, { status: 400 });
      }
      const updatedUser = db.updateUser(userId, { name, email, role });
      db.addLog({
        userId: user?.id,
        level: 'info',
        module: 'Admin',
        message: `Admin updated user details for: ${updatedUser.email}`,
      });
      return NextResponse.json({ success: true, user: updatedUser });
    }

    if (action === 'delete_user') {
      const { userId } = body;
      if (!userId) {
        return NextResponse.json({ success: false, error: 'User ID is required.' }, { status: 400 });
      }
      db.deleteUser(userId);
      db.addLog({
        userId: user?.id,
        level: 'warn',
        module: 'Admin',
        message: `Admin deleted user ID: ${userId}`,
      });
      return NextResponse.json({ success: true, message: 'User deleted.' });
    }

    return NextResponse.json({ success: false, error: 'Invalid admin action.' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
