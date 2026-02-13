import { NextResponse } from 'next/server';
import { db } from '@/lib/database';

export async function GET(request, { params }) {
  try {
    const { slug } = await params;
    const page = await db.getWikiPageBySlug(slug);

    if (!page) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }

    return NextResponse.json({ page }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch page' }, { status: 500 });
  }
}
