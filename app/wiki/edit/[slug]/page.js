'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function WikiEdit({ params }) {
  const router = useRouter();
  const [page, setPage] = useState(null);
  const [formData, setFormData] = useState({ title: '', content: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
        setFormData({ title: data.page.title, content: data.page.content });
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
        body: JSON.stringify(formData)
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
    </>
  );
}
