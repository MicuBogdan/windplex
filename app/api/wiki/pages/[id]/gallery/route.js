import { NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { getWikiSessionUser } from '@/lib/wikiAuth';

// Helper to validate image URLs
function isValidImageUrl(url) {
  if (!url) return false;
  try {
    const urlObj = new URL(url);
    // Only allow Imgur or direct image links
    const hostname = urlObj.hostname.toLowerCase();
    
    // Allow Imgur
    if (hostname.includes('imgur.com')) return true;
    
    // Allow direct image URLs (common image hosting services)
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
    
    // Check file extension
    const pathname = urlObj.pathname.toLowerCase();
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif'];
    if (imageExtensions.some(ext => pathname.endsWith(ext))) return true;
    
    return false;
  } catch {
    return false;
  }
}

export async function POST(request, { params }) {
  const user = await getWikiSessionUser();

  if (!user || user.role !== 'moderator' && user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const { imageUrl, caption } = await request.json();

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

    const imageId = await db.addWikiPageGalleryImage(page.id, imageUrl, caption || null);

    return NextResponse.json({ 
      message: 'Image added to gallery',
      imageId 
    }, { status: 201 });
  } catch (error) {
    console.error('Gallery image error:', error);
    return NextResponse.json({
      error: 'Failed to add image to gallery',
      detail: process.env.NODE_ENV === 'production' ? undefined : error.message
    }, { status: 500 });
  }
}

export async function GET(request, { params }) {
  try {
    const { id } = await params;

    // Verify page exists
    const page = await db.getWikiPageBySlug(id);
    if (!page) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }

    const images = await db.getWikiPageGallery(page.id);

    return NextResponse.json({ images }, { status: 200 });
  } catch (error) {
    console.error('Gallery fetch error:', error);
    return NextResponse.json({
      error: 'Failed to fetch gallery',
      detail: process.env.NODE_ENV === 'production' ? undefined : error.message
    }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const user = await getWikiSessionUser();

  if (!user || user.role !== 'moderator' && user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const { imageId } = await request.json();

    if (!imageId) {
      return NextResponse.json({ error: 'Image ID is required' }, { status: 400 });
    }

    await db.deleteWikiGalleryImage(imageId);

    return NextResponse.json({ message: 'Image deleted' }, { status: 200 });
  } catch (error) {
    console.error('Gallery delete error:', error);
    return NextResponse.json({
      error: 'Failed to delete image',
      detail: process.env.NODE_ENV === 'production' ? undefined : error.message
    }, { status: 500 });
  }
}
