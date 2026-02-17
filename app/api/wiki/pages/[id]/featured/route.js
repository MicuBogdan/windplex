import { NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { getWikiSessionUser } from '@/lib/wikiAuth';

// Helper to validate image URLs
function isValidImageUrl(url) {
  if (!url) return false;
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    
    if (hostname.includes('imgur.com')) return true;
    
    const allowedHosts = [
      'images.unsplash.com',
      'cdn.',
      'i.redd.it',
      'media.',
      'img',
      'cloudinary.com',
      'imagedelivery.net'
    ];
    
    if (allowedHosts.some(host => hostname.includes(host))) return true;
    
    const pathname = urlObj.pathname.toLowerCase();
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif'];
    if (imageExtensions.some(ext => pathname.endsWith(ext))) return true;
    
    return false;
  } catch {
    return false;
  }
}

export async function PUT(request, { params }) {
  const user = await getWikiSessionUser();

  if (!user || user.role !== 'moderator' && user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const { imageUrl } = await request.json();

    if (!imageUrl) {
      return NextResponse.json({ error: 'Image URL is required' }, { status: 400 });
    }

    if (!isValidImageUrl(imageUrl)) {
      return NextResponse.json({ 
        error: 'Invalid image URL. Only Imgur links and direct image URLs are allowed.' 
      }, { status: 400 });
    }

    // Verify page exists
    const page = await db.getWikiPageBySlug(id);
    if (!page) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }

    await db.updateWikiPageFeaturedImage(page.id, imageUrl);

    return NextResponse.json({ 
      message: 'Featured image updated'
    }, { status: 200 });
  } catch (error) {
    console.error('Featured image error:', error);
    return NextResponse.json({
      error: 'Failed to update featured image',
      detail: process.env.NODE_ENV === 'production' ? undefined : error.message
    }, { status: 500 });
  }
}
