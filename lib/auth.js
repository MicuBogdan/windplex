import { cookies } from 'next/headers';
import { db } from './database';
import bcrypt from 'bcrypt';

const SESSION_COOKIE = 'admin_session';

export async function createSession(username) {
  const sessionId = generateSessionId();
  const cookieStore = await cookies();
  
  cookieStore.set(SESSION_COOKIE, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 7 // 7 days
  });

  return sessionId;
}

export async function getSession() {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE)?.value;
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function verifyAdmin(username, password) {
  const admin = await db.getAdminByUsername(username);
  
  if (!admin) {
    return false;
  }

  return await bcrypt.compare(password, admin.password);
}

function generateSessionId() {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15) +
         Date.now().toString(36);
}
