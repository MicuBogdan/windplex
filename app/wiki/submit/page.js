'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ImageModal from '@/app/components/ImageModal';

export default function WikiSubmit() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({ title: '', content: '', featuredImageUrl: '' });
  const [galleryImages, setGalleryImages] = useState([]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newImageCaption, setNewImageCaption] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fullscreenImage, setFullscreenImage] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      const res = await fetch('/api/wiki/auth/me');
      const data = await res.json();
      if (!data.user) {
        router.push('/wiki/login');
        return;
      }
      setUser(data.user);
    };
    loadUser();
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const submitData = {
        ...formData,
        galleryImages: galleryImages
      };

      const res = await fetch('/api/wiki/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData)
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess('Submission sent for review!');
        setFormData({ title: '', content: '', featuredImageUrl: '' });
        setGalleryImages([]);
      } else {
        setError(data.detail ? `${data.error} (${data.detail})` : (data.error || 'Failed to submit'));
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
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
          <h1 className="page-title">✍️ Submit a Wiki Page</h1>
          <p className="page-subtitle">All submissions are reviewed before publishing.</p>
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
                rows="10"
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
              <p className="form-hint">Add related images to the gallery. Modifiers can manage gallery after submission.</p>

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

            <div className="form-actions">
              <Link href="/wiki" className="btn btn-secondary">Cancel</Link>
              <button className="btn btn-primary" type="submit" disabled={loading}>
                {loading ? 'Submitting...' : 'Submit for Review'}
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
