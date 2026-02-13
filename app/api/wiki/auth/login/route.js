import { NextResponse } from 'next/server';
import { verifyWikiUser, createWikiSession } from '@/lib/wikiAuth';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const user = await verifyWikiUser(email, password);
    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    await createWikiSession(user.id);

    return NextResponse.json({ message: 'Logged in', role: user.role }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to login' }, { status: 500 });
  }
}
