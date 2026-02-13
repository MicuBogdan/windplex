import { NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { getWikiSessionUser } from '@/lib/wikiAuth';
import crypto from 'crypto';

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function withRandomSuffix(base) {
  const suffix = crypto.randomBytes(3).toString('hex');
  return `${base}-${suffix}`;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  try {
    const pages = query ? await db.searchWikiPages(query) : await db.getApprovedWikiPages();
    return NextResponse.json({ pages }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch pages' }, { status: 500 });
  }
}

export async function POST(request) {
  const user = await getWikiSessionUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { title, content } = await request.json();

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }

    const baseSlug = slugify(title);
    const slug = baseSlug ? withRandomSuffix(baseSlug) : '';
    if (!slug) {
      return NextResponse.json({ error: 'Invalid title for slug' }, { status: 400 });
    }

    const existingPage = await db.getWikiPageBySlug(slug);
    if (existingPage) {
      return NextResponse.json({ error: 'A page with this title already exists' }, { status: 400 });
    }

    const existingSubmission = await db.getWikiSubmissionBySlug(slug);
    if (existingSubmission) {
      return NextResponse.json({ error: 'A submission with this title is already pending' }, { status: 400 });
    }

    await db.createWikiSubmission(null, slug, title, content, user.id);

    return NextResponse.json({ message: 'Submission sent for review' }, { status: 201 });
  } catch (error) {
    console.error('Wiki submission error:', error);
    return NextResponse.json({
      error: 'Failed to submit page',
      detail: process.env.NODE_ENV === 'production' ? undefined : error.message
    }, { status: 500 });
  }
}
