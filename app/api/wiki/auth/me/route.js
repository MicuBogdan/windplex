import { NextResponse } from 'next/server';
import { getWikiSessionUser } from '@/lib/wikiAuth';

export async function GET() {
  const user = await getWikiSessionUser();

  if (!user) {
    return NextResponse.json({ user: null }, { status: 200 });
  }

  return NextResponse.json({ user }, { status: 200 });
}
