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

async function notifyDiscord({ title, slug, author, content, featuredImageUrl, galleryImages }) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) return;

  try {
    const payload = {
      content: `📝 New wiki submission from **${author}**`,
      embeds: [
        {
          title: title,
          description: content.substring(0, 200) + (content.length > 200 ? '...' : ''),
          color: 0x8b7355,
          thumbnail: featuredImageUrl ? { url: featuredImageUrl } : undefined,
          fields: [
            {
              name: 'Author',
              value: author,
              inline: true
            },
            {
              name: 'Review',
              value: '[Moderator Panel](/wiki/moderator)',
              inline: true
            },
            {
              name: 'Page',
              value: `/wiki/${slug}`,
              inline: false
            }
          ]
        }
      ]
    };

    // Remove undefined fields
    if (!payload.embeds[0].thumbnail) {
      delete payload.embeds[0].thumbnail;
    }

    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
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

    await db.createWikiSubmission(null, slug, title, content, user.id, featuredImageUrl || null, galleryImages || []);

    await notifyDiscord({ 
      title, 
      slug, 
      author: user.username, 
      content,
      featuredImageUrl: featuredImageUrl || null,
      galleryImages: galleryImages || []
    });

    return NextResponse.json({ message: 'Submission sent for review' }, { status: 201 });
  } catch (error) {
    console.error('Wiki submission error:', error);
    return NextResponse.json({
      error: 'Failed to submit page',
      detail: process.env.NODE_ENV === 'production' ? undefined : error.message
    }, { status: 500 });
  }
}
