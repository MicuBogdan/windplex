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

async function notifyDiscord({ title, slug, author, content }) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) return;

  try {
    const message = `📝 New wiki submission: **${title}** by **${author}**\nReview: /wiki/moderator\nPage: /wiki/${slug}`;
    const markdown = `# ${title}\n\nAuthor: ${author}\nSlug: ${slug}\n\n---\n\n${content}`;
    const formData = new FormData();
    formData.append('content', message);
    formData.append('file', new Blob([markdown], { type: 'text/markdown' }), `${slug}.md`);

    await fetch(webhookUrl, {
      method: 'POST',
      body: formData
    });
  } catch (error) {
    console.error('Discord webhook failed:', error);
  }
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
    const { title, content, featuredImageUrl, galleryImages } = await request.json();

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

    // Store featured image URL in submission (it will be transferred to the page on approval)
    const submissionData = {
      pageId: null,
      slug,
      title,
      content,
      createdBy: user.id,
      featuredImageUrl: featuredImageUrl || null,
      galleryImages: galleryImages || []
    };

    await db.createWikiSubmission(null, slug, title, content, user.id);

    await notifyDiscord({ title, slug, author: user.username, content });

    return NextResponse.json({ message: 'Submission sent for review' }, { status: 201 });
  } catch (error) {
    console.error('Wiki submission error:', error);
    return NextResponse.json({
      error: 'Failed to submit page',
      detail: process.env.NODE_ENV === 'production' ? undefined : error.message
    }, { status: 500 });
  }
}
