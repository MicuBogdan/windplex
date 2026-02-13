import { NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { getWikiSessionUser } from '@/lib/wikiAuth';
import { getSession } from '@/lib/auth';

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
      const success = await db.approveWikiSubmission(id, reviewerId, note || null);
      if (!success) {
        return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
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
