import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { NextRequest } from 'next/server';
import { db } from './db';
import { User } from './providers/types';

const JWT_SECRET = process.env.JWT_SECRET || 'niche-hunter-super-secret-jwt-key-2026';
const TOKEN_NAME = 'nh_session_token';

export interface TokenPayload {
  userId: string;
  email: string;
  role: 'admin' | 'user';
}

export function signJwt(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyJwt(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (error) {
    return null;
  }
}

export async function getUserFromRequest(req: NextRequest): Promise<User | null> {
  try {
    // Check Authorization Header
    let token = '';
    const authHeader = req.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }

    // Check Cookies
    if (!token) {
      const cookie = req.cookies.get(TOKEN_NAME);
      if (cookie) {
        token = cookie.value;
      }
    }

    if (!token) {
      return null;
    }

    const payload = verifyJwt(token);
    if (!payload || !payload.userId) {
      return null;
    }

    const user = db.getUserById(payload.userId);
    return user || null;
  } catch (error) {
    return null;
  }
}

export { TOKEN_NAME };
