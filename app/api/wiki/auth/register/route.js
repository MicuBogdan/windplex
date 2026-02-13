import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { db } from '@/lib/database';
import { createWikiSession } from '@/lib/wikiAuth';

export async function POST(request) {
  try {
    const { email, username, password } = await request.json();

    if (!email || !username || !password) {
      return NextResponse.json({ error: 'Email, username, and password are required' }, { status: 400 });
    }

    const existingEmail = await db.getWikiUserByEmail(email);
    if (existingEmail) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 400 });
    }

    const existingUsername = await db.getWikiUserByUsername(username);
    if (existingUsername) {
      return NextResponse.json({ error: 'Username already in use' }, { status: 400 });
    }

    const isModeratorInvite = await db.consumeModeratorInvite(email);
    const role = isModeratorInvite ? 'moderator' : 'user';

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = await db.createWikiUser(email, username, hashedPassword, role);

    await createWikiSession(userId);

    return NextResponse.json({ message: 'Account created', role }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to register' }, { status: 500 });
  }
}
