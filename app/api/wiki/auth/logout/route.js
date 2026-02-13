import { NextResponse } from 'next/server';
import { deleteWikiSession } from '@/lib/wikiAuth';

export async function POST() {
  try {
    await deleteWikiSession();
    return NextResponse.json({ message: 'Logged out' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to logout' }, { status: 500 });
  }
}
