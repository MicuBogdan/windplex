import { cookies } from 'next/headers';
import bcrypt from 'bcrypt';
import { db } from './database';

const WIKI_SESSION_COOKIE = 'wiki_session';
const SESSION_DAYS = 7;

function generateSessionId() {
  return Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15) +
    Date.now().toString(36);
}

export async function createWikiSession(userId) {
  const sessionId = generateSessionId();
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);

  await db.createWikiSession(sessionId, userId, expiresAt);

  const cookieStore = await cookies();
  cookieStore.set(WIKI_SESSION_COOKIE, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_DAYS * 24 * 60 * 60
  });

  return sessionId;
}

export async function getWikiSessionUser() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(WIKI_SESSION_COOKIE)?.value;
  if (!sessionId) return null;

  const session = await db.getWikiSession(sessionId);
  if (!session) return null;

  if (new Date(session.expires_at) < new Date()) {
    await db.deleteWikiSession(sessionId);
    cookieStore.delete(WIKI_SESSION_COOKIE);
    return null;
  }

  return {
    id: session.user_id,
    email: session.email,
    username: session.username,
    role: session.role
  };
}

export async function deleteWikiSession() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(WIKI_SESSION_COOKIE)?.value;

  if (sessionId) {
    await db.deleteWikiSession(sessionId);
  }

  cookieStore.delete(WIKI_SESSION_COOKIE);
}

export async function verifyWikiUser(email, password) {
  const user = await db.getWikiUserByEmail(email);
  if (!user) return null;

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) return null;

  return user;
}
