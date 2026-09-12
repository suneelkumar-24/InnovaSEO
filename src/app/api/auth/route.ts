import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { signJwt, verifyJwt, TOKEN_NAME } from '@/lib/auth';
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

      const user = db.getUserByEmail(email);
      if (!user) {
        return NextResponse.json({ success: false, error: 'Invalid email or password.' }, { status: 401 });
      }

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
        message: `User logged in: ${user.email}`,
      });

      return response;
    }

    // 2. REGISTER (Users create their own personal workspace account)
    if (action === 'register') {
      const { email, password, name } = body;
      if (!email || !password || !name) {
        return NextResponse.json(
          { success: false, error: 'Full name, email, and password are required.' },
          { status: 400 }
        );
      }

      const cleanEmail = email.trim().toLowerCase();
      if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
        return NextResponse.json(
          { success: false, error: 'Please enter a valid email address.' },
          { status: 400 }
        );
      }

      if (password.length < 6) {
        return NextResponse.json(
          { success: false, error: 'Password must be at least 6 characters.' },
          { status: 400 }
        );
      }

      const existing = db.getUserByEmail(cleanEmail);
      if (existing) {
        return NextResponse.json(
          { success: false, error: 'An account with this email already exists. Please sign in.' },
          { status: 409 }
        );
      }

      const safeUser = db.createUser(cleanEmail, password, name.trim(), 'user');
      const token = signJwt({
        userId: safeUser.id,
        email: safeUser.email,
        role: safeUser.role,
      });

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
        maxAge: 60 * 60 * 24 * 7,
      });

      db.addLog({
        userId: safeUser.id,
        level: 'info',
        module: 'Auth',
        message: `New user personal workspace registered: ${safeUser.email}`,
      });

      return response;
    }

    // 3. LOGOUT
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

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, user: null });
  }
}
