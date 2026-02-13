import { NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { getWikiSessionUser } from '@/lib/wikiAuth';

async function notifyDiscord({ title, slug, author, content }) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) return;

  try {
    const message = `🛠️ Wiki edit suggestion: **${title}** by **${author}**\nReview: /wiki/moderator\nPage: /wiki/${slug}`;
    const markdown = `# ${title}\n\nAuthor: ${author}\nSlug: ${slug}\n\n---\n\n${content}`;
    const formData = new FormData();
    formData.append('content', message);
    formData.append('file', new Blob([markdown], { type: 'text/markdown' }), `${slug}-edit.md`);

    await fetch(webhookUrl, {
      method: 'POST',
      body: formData
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

    const { title, content } = await request.json();

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }

    await db.createWikiSubmission(page.id, slug, title, content, user.id);

    await notifyDiscord({ title, slug, author: user.username, content });

    return NextResponse.json({ message: 'Edit suggestion sent for review' }, { status: 201 });
  } catch (error) {
    console.error('Wiki edit suggestion error:', error);
    return NextResponse.json({
      error: 'Failed to submit suggestion',
      detail: process.env.NODE_ENV === 'production' ? undefined : error.message
    }, { status: 500 });
  }
}
