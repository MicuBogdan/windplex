import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/database';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const [moderators, invites] = await Promise.all([
      db.listWikiModerators(),
      db.listModeratorInvites()
    ]);
    return NextResponse.json({ moderators, invites }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to load moderators' }, { status: 500 });
  }
}

export async function POST(request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { email, username } = await request.json();
    if (!email && !username) {
      return NextResponse.json({ error: 'Email or username is required' }, { status: 400 });
    }

    let updatedUserId = null;
    if (email) {
      updatedUserId = await db.updateWikiUserRoleByEmail(email, 'moderator');
      if (!updatedUserId) {
        await db.createModeratorInvite(email);
      }
    }

    if (!updatedUserId && username) {
      updatedUserId = await db.updateWikiUserRoleByUsername(username, 'moderator');
    }

    return NextResponse.json({ message: 'Moderator invite added' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add moderator' }, { status: 500 });
  }
}

export async function DELETE(request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id, email, username, removeInvite } = await request.json();

    if (removeInvite && email) {
      await db.deleteModeratorInviteByEmail(email);
      return NextResponse.json({ message: 'Invite removed' }, { status: 200 });
    }

    let updatedUserId = null;
    if (id) {
      updatedUserId = await db.updateWikiUserRoleById(id, 'user');
    } else if (email) {
      updatedUserId = await db.updateWikiUserRoleByEmail(email, 'user');
    } else if (username) {
      updatedUserId = await db.updateWikiUserRoleByUsername(username, 'user');
    }

    if (!updatedUserId) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Moderator removed' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to remove moderator' }, { status: 500 });
  }
}
