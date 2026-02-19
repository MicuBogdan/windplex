import { NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { getWikiSessionUser } from '@/lib/wikiAuth';

async function notifyDiscord({ title, slug, author, content, featuredImageUrl }) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) return;

  try {
    const payload = {
      content: `🛠️ Wiki edit suggestion from **${author}**`,
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

export async function POST(request, { params }) {
  const user = await getWikiSessionUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { slug } = await params;
    const page = await db.getWikiPageBySlug(slug);

    if (!page) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }

    const { title, content, featuredImageUrl, galleryImages } = await request.json();

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }

    await db.createWikiSubmission(page.id, slug, title, content, user.id, featuredImageUrl || null, galleryImages || []);

    await notifyDiscord({ title, slug, author: user.username, content, featuredImageUrl: featuredImageUrl || null });

    return NextResponse.json({ message: 'Edit suggestion sent for review' }, { status: 201 });
  } catch (error) {
    console.error('Wiki edit suggestion error:', error);
    return NextResponse.json({
      error: 'Failed to submit suggestion',
      detail: process.env.NODE_ENV === 'production' ? undefined : error.message
    }, { status: 500 });
  }
}
