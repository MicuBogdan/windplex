'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ImageModal from '@/app/components/ImageModal';

export default function WikiEdit({ params }) {
  const router = useRouter();
  const [page, setPage] = useState(null);
  const [gallery, setGallery] = useState([]);
  const [formData, setFormData] = useState({ title: '', content: '', featuredImageUrl: '' });
  const [galleryImages, setGalleryImages] = useState([]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newImageCaption, setNewImageCaption] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fullscreenImage, setFullscreenImage] = useState(null);

  useEffect(() => {
    const load = async () => {
      const { slug } = await params;
      try {
        const res = await fetch(`/api/wiki/pages/${slug}`);
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || 'Failed to load page');
          setLoading(false);
          return;
        }
        setPage(data.page);
        setFormData({ title: data.page.title, content: data.page.content, featuredImageUrl: data.page.featured_image_url || '' });
        
        // Fetch gallery images
        try {
          const galleryRes = await fetch(`/api/wiki/pages/${slug}/gallery`);
          const galleryData = await galleryRes.json();
          if (galleryRes.ok && galleryData.images) {
            setGallery(galleryData.images);
            setGalleryImages(galleryData.images.map(img => ({ url: img.image_url, caption: img.caption })));
          }
        } catch (err) {
          console.error('Failed to load gallery:', err);
        }
      } catch (err) {
        setError('Failed to load page');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [params]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`/api/wiki/pages/${page.slug}/suggest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          content: formData.content,
          featuredImageUrl: formData.featuredImageUrl,
          galleryImages: galleryImages
        })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess('Edit suggestion sent for review!');
      } else {
        setError(data.detail ? `${data.error} (${data.detail})` : (data.error || 'Failed to submit'));
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddGalleryImage = () => {
    if (!newImageUrl.trim()) {
      setError('Please enter an image URL');
      return;
    }

    setGalleryImages([...galleryImages, { url: newImageUrl, caption: newImageCaption }]);
    setNewImageUrl('');
    setNewImageCaption('');
  };

  const handleRemoveGalleryImage = (index) => {
    setGalleryImages(galleryImages.filter((_, i) => i !== index));
  };

  if (loading) {
    return (
      <div className="main-content" style={{ textAlign: 'center', padding: '3rem' }}>
        Loading...
      </div>
    );
  }

  if (!page) {
    return (
      <div className="main-content" style={{ textAlign: 'center', padding: '3rem' }}>
        Page not found.
      </div>
    );
  }

  return (
    <>
      <div className="minecraft-bg"></div>

      <nav className="navbar">
        <div className="nav-container">
          <Link href="/" className="logo">📰 The Breadcrumb Gazette</Link>
          <div className="nav-actions">
            <input type="checkbox" id="nav-toggle" className="nav-toggle" />
            <label htmlFor="nav-toggle" className="nav-toggle-label">☰ Menu</label>
            <ul className="nav-menu">
              <li><Link href="/">Home</Link></li>
              <li><Link href="/lore">Lore</Link></li>
              <li><Link href="/news">News</Link></li>
              <li><Link href="/events">Events</Link></li>
              <li><Link href="/wiki" className="active">Wiki</Link></li>
              <li><Link href="/contact">Contact</Link></li>
            </ul>
          </div>
        </div>
      </nav>

      <main className="main-content">
        <div className="page-header">
          <h1 className="page-title">✏️ Suggest Edit</h1>
          <p className="page-subtitle">Your changes will be reviewed by moderators.</p>
        </div>

        <div className="form-container">
          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <form onSubmit={handleSubmit} className="post-form">
            <div className="form-group">
              <label htmlFor="title">Title</label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="content">Content</label>
              <textarea
                id="content"
                rows="12"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                required
              ></textarea>
              <small>Use plain text. We auto-format paragraphs.</small>
            </div>

            <div className="form-group">
              <label htmlFor="featuredImageUrl">Featured Image URL (Optional)</label>
              <input
                type="url"
                id="featuredImageUrl"
                placeholder="https://imgur.com/example.jpg"
                value={formData.featuredImageUrl}
                onChange={(e) => setFormData({ ...formData, featuredImageUrl: e.target.value })}
              />
              <small>Featured image appears in embeds and at the top of the page. Use Imgur or direct image URLs only.</small>
              {formData.featuredImageUrl && (
                <img
                  src={formData.featuredImageUrl}
                  alt="Featured"
                  style={{ maxWidth: '100%', maxHeight: '200px', marginTop: '1rem', cursor: 'pointer' }}
                  onClick={() => setFullscreenImage(formData.featuredImageUrl)}
                />
              )}
            </div>

            <div className="form-section">
              <h3>Gallery Images (Optional)</h3>
              <p className="form-hint">Add or modify related images in the gallery. Moderators can manage after review.</p>

              <div className="gallery-input-group">
                <input
                  type="url"
                  placeholder="https://imgur.com/example.jpg"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  className="gallery-url-input"
                />
                <input
                  type="text"
                  placeholder="Image caption (optional)"
                  value={newImageCaption}
                  onChange={(e) => setNewImageCaption(e.target.value)}
                  className="gallery-caption-input"
                />
                <button
                  type="button"
                  onClick={handleAddGalleryImage}
                  className="btn btn-secondary"
                >
                  Add Image
                </button>
              </div>

              {galleryImages.length > 0 && (
                <div className="gallery-preview">
                  {galleryImages.map((img, idx) => (
                    <div key={idx} className="gallery-preview-item">
                      <img
                        src={img.url}
                        alt={`Gallery ${idx}`}
                        onClick={() => setFullscreenImage(img.url)}
                      />
                      <div className="gallery-info">
                        {img.caption && <p>{img.caption}</p>}
                        <button
                          type="button"
                          onClick={() => handleRemoveGalleryImage(idx)}
                          className="btn btn-small btn-error"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {page?.featured_image_url && !formData.featuredImageUrl && (
              <div className="form-section">
                <h3>Current Featured Image</h3>
                <div style={{ maxWidth: '300px', margin: '1rem 0' }}>
                  <img src={page.featured_image_url} alt="Featured" style={{ width: '100%', border: '2px solid #3d2817' }} />
                  <p style={{ marginTop: '0.5rem', color: '#6b4423', fontSize: '0.9rem' }}>
                    {page.featured_image_url}
                  </p>
                </div>
              </div>
            )}

            {gallery.length > 0 && galleryImages.length === 0 && (
              <div className="form-section">
                <h3>Current Gallery</h3>
                <div className="gallery-preview">
                  {gallery.map((image) => (
                    <div key={image.id} className="gallery-preview-item">
                      <img src={image.image_url} alt={image.caption || 'Gallery'} />
                      <div className="gallery-info">
                        {image.caption && <p>{image.caption}</p>}
                        <p style={{ fontSize: '0.75rem', color: '#9b8b7e' }}>{image.image_url}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="form-actions">
              <Link href={`/wiki/${page.slug}`} className="btn btn-secondary">Cancel</Link>
              <button className="btn btn-primary" type="submit" disabled={saving}>
                {saving ? 'Submitting...' : 'Submit Suggestion'}
              </button>
            </div>
          </form>
        </div>
      </main>

      <footer className="footer">
        <p>📚 World Archives</p>
      </footer>

      {fullscreenImage && (
        <ImageModal imageUrl={fullscreenImage} onClose={() => setFullscreenImage(null)} />
      )}
    </>
  );
}
