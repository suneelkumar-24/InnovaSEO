import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAdmin(req);
    if (!auth.authorized || !auth.user) {
      return NextResponse.json(
        { success: false, error: auth.error || 'Administrator access required.' },
        { status: auth.user ? 403 : 401 }
      );
    }

    const users = db.getAllUsers();
    const activeUsers = users.filter((u) => u.status === 'active' || !u.status).length;
    const pendingUsers = users.filter((u) => u.status === 'pending_approval').length;
    const suspendedUsers = users.filter((u) => u.status === 'suspended').length;
    const adminUsers = users.filter((u) => u.role === 'admin').length;
    const standardUsers = users.filter((u) => u.role === 'user').length;

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers: users.length,
        activeUsers,
        pendingApprovals: pendingUsers,
        suspendedUsers,
        adminUsers,
        standardUsers,
      },
      users,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAdmin(req);
    if (!auth.authorized || !auth.user) {
      return NextResponse.json(
        { success: false, error: auth.error || 'Administrator access required.' },
        { status: auth.user ? 403 : 401 }
      );
    }

    const currentAdmin = auth.user;
    const body = await req.json();
    const { action } = body;

    if (action === 'clear_logs') {
      db.addLog({
        userId: currentAdmin.id,
        level: 'warn',
        module: 'Admin',
        message: `System logs cleared by administrator (${currentAdmin.email}).`,
      });
      return NextResponse.json({ success: true, message: 'Logs cleared.' });
    }

    if (action === 'create_user') {
      const { email, password, name, role = 'user', dailyCreditsLimit = 50 } = body;
      if (!email || !password || !name) {
        return NextResponse.json(
          { success: false, error: 'Full name, email, and password are required.' },
          { status: 400 }
        );
      }
      if (password.length < 6) {
        return NextResponse.json(
          { success: false, error: 'Password must be at least 6 characters.' },
          { status: 400 }
        );
      }
      const newUser = db.createUser(
        email.trim().toLowerCase(),
        password,
        name.trim(),
        role === 'admin' ? 'admin' : 'user',
        'active',
        Number(dailyCreditsLimit) || 999999
      );

      db.addLog({
        userId: currentAdmin.id,
        level: 'info',
        module: 'Admin',
        message: `Admin (${currentAdmin.email}) added new user account: ${newUser.email} (${newUser.role})`,
      });
      return NextResponse.json({ success: true, user: newUser });
    }

    if (action === 'toggle_status') {
      const { userId } = body;
      if (!userId) {
        return NextResponse.json({ success: false, error: 'User ID is required.' }, { status: 400 });
      }
      if (userId === currentAdmin.id) {
        return NextResponse.json(
          { success: false, error: 'You cannot suspend your own account.' },
          { status: 400 }
        );
      }
      const existing = db.getUserById(userId);
      if (!existing) {
        return NextResponse.json({ success: false, error: 'User not found.' }, { status: 404 });
      }
      const newStatus = existing.status === 'suspended' ? 'active' : 'suspended';
      const updatedUser = db.updateUser(userId, { status: newStatus });
      db.addLog({
        userId: currentAdmin.id,
        level: 'info',
        module: 'Admin',
        message: `Admin (${currentAdmin.email}) toggled status of ${updatedUser.email} to ${newStatus}.`,
      });
      return NextResponse.json({ success: true, user: updatedUser });
    }

    if (action === 'update_credits') {
      const { userId, credits, dailyLimit } = body;
      if (!userId || typeof credits !== 'number') {
        return NextResponse.json(
          { success: false, error: 'User ID and credits amount are required.' },
          { status: 400 }
        );
      }
      const updatedUser = db.updateUserCredits(userId, Number(credits), typeof dailyLimit === 'number' ? Number(dailyLimit) : undefined);
      db.addLog({
        userId: currentAdmin.id,
        level: 'info',
        module: 'Admin',
        message: `Admin updated credits for ${updatedUser.email}: ${credits} remaining (Daily limit: ${updatedUser.dailyCreditsLimit})`,
      });
      return NextResponse.json({ success: true, user: updatedUser });
    }

    if (action === 'approve_user') {
      const { userId } = body;
      if (!userId) {
        return NextResponse.json({ success: false, error: 'User ID is required.' }, { status: 400 });
      }
      const approvedUser = db.approveUser(userId);
      db.addLog({
        userId: currentAdmin.id,
        level: 'info',
        module: 'Admin',
        message: `Admin (${currentAdmin.email}) APPROVED registration request for: ${approvedUser.email} (Assigned 50 credits = 75 mins/day)`,
      });
      return NextResponse.json({
        success: true,
        message: `User ${approvedUser.email} has been approved and activated with 50 credits (75 mins/day).`,
        user: approvedUser,
      });
    }

    if (action === 'reject_user') {
      const { userId } = body;
      if (!userId) {
        return NextResponse.json({ success: false, error: 'User ID is required.' }, { status: 400 });
      }
      db.rejectUser(userId);
      db.addLog({
        userId: currentAdmin.id,
        level: 'warn',
        module: 'Admin',
        message: `Admin (${currentAdmin.email}) rejected registration request for user ID: ${userId}`,
      });
      return NextResponse.json({ success: true, message: 'User registration request rejected.' });
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
        userId: currentAdmin.id,
        level: 'warn',
        module: 'Admin',
        message: `Admin (${currentAdmin.email}) reset password for user ID: ${userId}`,
      });
      return NextResponse.json({ success: true, message: 'Password updated successfully.' });
    }

    if (action === 'update_user') {
      const { userId, name, email, role, status } = body;
      if (!userId) {
        return NextResponse.json({ success: false, error: 'User ID is required.' }, { status: 400 });
      }

      // Safeguard: Admin cannot demote or suspend themselves
      if (userId === currentAdmin.id) {
        if (role && role !== 'admin') {
          return NextResponse.json(
            { success: false, error: 'You cannot remove your own admin privileges.' },
            { status: 400 }
          );
        }
        if (status && status === 'suspended') {
          return NextResponse.json(
            { success: false, error: 'You cannot suspend your own account.' },
            { status: 400 }
          );
        }
      }

      const updatedUser = db.updateUser(userId, {
        name: name ? name.trim() : undefined,
        email: email ? email.trim().toLowerCase() : undefined,
        role,
        status,
      });

      db.addLog({
        userId: currentAdmin.id,
        level: 'info',
        module: 'Admin',
        message: `Admin updated account details for: ${updatedUser.email} (Status: ${updatedUser.status || 'active'}, Role: ${updatedUser.role})`,
      });
      return NextResponse.json({ success: true, user: updatedUser });
    }

    if (action === 'delete_user') {
      const { userId } = body;
      if (!userId) {
        return NextResponse.json({ success: false, error: 'User ID is required.' }, { status: 400 });
      }

      if (userId === currentAdmin.id) {
        return NextResponse.json(
          { success: false, error: 'You cannot delete your own admin account.' },
          { status: 400 }
        );
      }

      db.deleteUser(userId);
      db.addLog({
        userId: currentAdmin.id,
        level: 'warn',
        module: 'Admin',
        message: `Admin deleted user account ID: ${userId}`,
      });
      return NextResponse.json({ success: true, message: 'User deleted successfully.' });
    }

    return NextResponse.json({ success: false, error: 'Invalid admin action.' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
