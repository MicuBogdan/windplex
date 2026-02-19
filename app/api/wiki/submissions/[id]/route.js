import { NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { getWikiSessionUser } from '@/lib/wikiAuth';
import { getSession } from '@/lib/auth';

async function notifyDiscord({ title, slug, submission }) {
  const webhookUrl = process.env.DISCORD_POSTS_WEBHOOK_URL;
  if (!webhookUrl) return;

  let content = `📚 New World Archives page: **${title}**\nRead: https://windplex.vercel.app/wiki/${slug}`;
  
  // Add featured image if present
  if (submission.featured_image_url) {
    content += `\nFeatured: ${submission.featured_image_url}`;
  }
  
  // Add gallery images if present
  let galleryImages = [];
  try {
    if (submission.gallery_images) {
      galleryImages = typeof submission.gallery_images === 'string' ? JSON.parse(submission.gallery_images) : submission.gallery_images;
    }
  } catch (e) {
    console.error('Failed to parse gallery images:', e);
  }
  
  if (galleryImages.length > 0) {
    content += `\nGallery: ${galleryImages.map(img => img.url).join(' | ')}`;
  }

  const payload = {
    content
  };

  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  } catch (error) {
    console.error('Discord wiki webhook failed:', error);
  }
}

function isModerator(user) {
  return user && (user.role === 'moderator' || user.role === 'admin');
}

export async function PUT(request, { params }) {
  const user = await getWikiSessionUser();
  const adminSession = await getSession();

  if (!isModerator(user) && !adminSession) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const { action, note } = await request.json();

    const reviewerId = user?.id || null;

    if (action === 'approve') {
      const submission = await db.approveWikiSubmission(id, reviewerId, note || null);
      if (!submission) {
        return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
      }

      if (!submission.page_id) {
        await notifyDiscord({ title: submission.title, slug: submission.slug, submission });
      }
      return NextResponse.json({ message: 'Submission approved' }, { status: 200 });
    }

    if (action === 'reject') {
      await db.rejectWikiSubmission(id, reviewerId, note || null);
      return NextResponse.json({ message: 'Submission rejected' }, { status: 200 });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Wiki moderation error:', error);
    return NextResponse.json({
      error: 'Failed to update submission',
      detail: process.env.NODE_ENV === 'production' ? undefined : error.message
    }, { status: 500 });
  }
}
