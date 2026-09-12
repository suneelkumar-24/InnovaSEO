import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { signJwt, verifyJwt, TOKEN_NAME, getUserFromRequest } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    // 1. LOGIN
    if (action === 'login') {
      const { email, password } = body;
      if (!email || !password) {
        return NextResponse.json({ success: false, error: 'Email and password are required.' }, { status: 400 });
      }

      const user = db.getUserByEmail(email.trim());
      if (!user) {
        return NextResponse.json({ success: false, error: 'Invalid email or password.' }, { status: 401 });
      }

      // Check if awaiting admin approval
      if (user.status === 'pending_approval') {
        return NextResponse.json(
          {
            success: false,
            error: 'Your account is pending administrator approval. Please wait for an admin to approve your request.',
          },
          { status: 403 }
        );
      }

      // Check if suspended
      if (user.status === 'suspended') {
        return NextResponse.json(
          { success: false, error: 'Your account is suspended. Please contact the administrator.' },
          { status: 403 }
        );
      }

      const isValid = bcrypt.compareSync(password, user.passwordHash);
      if (!isValid) {
        return NextResponse.json({ success: false, error: 'Invalid email or password.' }, { status: 401 });
      }

      const token = signJwt({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      const { passwordHash: _, ...safeUser } = user;

      const response = NextResponse.json({
        success: true,
        user: safeUser,
        token,
      });

      response.cookies.set({
        name: TOKEN_NAME,
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });

      db.addLog({
        userId: user.id,
        level: 'info',
        module: 'Auth',
        message: `User logged in: ${user.email} (Remaining: ${safeUser.remainingMinutes}m, ${safeUser.credits} credits)`,
      });

      return response;
    }

    // 2. REGISTER (Account Request -> Awaits Admin Approval)
    if (action === 'register') {
      const { email, password, name, reason } = body;
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

      const safeUser = db.createUser(
        email.trim().toLowerCase(),
        password,
        name.trim(),
        'user',
        'pending_approval',
        reason ? reason.trim() : undefined
      );

      db.addLog({
        userId: safeUser.id,
        level: 'warn',
        module: 'Auth',
        message: `New account request awaiting admin approval: ${safeUser.email} (${safeUser.name})`,
      });

      return NextResponse.json({
        success: true,
        pendingApproval: true,
        message:
          'Your account request has been submitted! An administrator must review and approve your account before you can log in.',
      });
    }

    // 3. HEARTBEAT (Tracks 75 minutes = 4500 seconds / 50 credits daily usage)
    if (action === 'heartbeat') {
      const userFromReq = await getUserFromRequest(req);
      if (!userFromReq) {
        return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 });
      }

      const activeSeconds = Number(body.activeSeconds) || 30;
      const result = db.recordTimeSpent(userFromReq.id, activeSeconds);

      return NextResponse.json({
        ...result,
      });
    }

    // 4. LOGOUT
    if (action === 'logout') {
      const response = NextResponse.json({ success: true, message: 'Logged out successfully.' });
      response.cookies.delete(TOKEN_NAME);
      return response;
    }

    return NextResponse.json({ success: false, error: 'Invalid action.' }, { status: 400 });
  } catch (err: any) {
    console.error('Auth API Error:', err);
    return NextResponse.json({ success: false, error: err.message || 'Authentication failed.' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    let token = '';
    const authHeader = req.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
    if (!token) {
      const cookie = req.cookies.get(TOKEN_NAME);
      if (cookie) token = cookie.value;
    }

    if (!token) {
      return NextResponse.json({ success: false, user: null });
    }

    const payload = verifyJwt(token);
    if (!payload || !payload.userId) {
      return NextResponse.json({ success: false, user: null });
    }

    const user = db.getUserById(payload.userId);
    if (!user) {
      return NextResponse.json({ success: false, user: null });
    }

    if (user.status === 'pending_approval' || user.status === 'suspended') {
      return NextResponse.json({ success: false, user: null, status: user.status });
    }

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, user: null });
  }
}
