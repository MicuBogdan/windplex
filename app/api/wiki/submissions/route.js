import { NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { getWikiSessionUser } from '@/lib/wikiAuth';
import { getSession } from '@/lib/auth';

function isModerator(user) {
  return user && (user.role === 'moderator' || user.role === 'admin');
}

export async function GET() {
  const user = await getWikiSessionUser();
  const adminSession = await getSession();

  if (!isModerator(user) && !adminSession) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const submissions = await db.listPendingWikiSubmissions();
    return NextResponse.json({ submissions }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch submissions' }, { status: 500 });
  }
}
