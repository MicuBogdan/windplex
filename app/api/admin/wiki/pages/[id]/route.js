import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/database';

export async function DELETE(request, { params }) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    await db.deleteWikiPageById(id);
    return NextResponse.json({ message: 'Page deleted' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete page' }, { status: 500 });
  }
}
