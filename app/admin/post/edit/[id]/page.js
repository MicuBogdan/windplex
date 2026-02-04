'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function EditPost({ params }) {
  const router = useRouter();
  const resolvedParams = React.use(params);
  const { id } = resolvedParams;
  const [formData, setFormData] = useState({
    title: '',
    category: 'lore',
    content: '',
    image_url: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [username] = useState('admin');

  useEffect(() => {
    loadPost();
  }, [id]);

  const loadPost = async () => {
    try {
      const res = await fetch(`/api/admin/posts/${id}`);
      
      if (!res.ok) {
        router.push('/admin/login');
        return;
      }

      const data = await res.json();
      setFormData({
        title: data.post.title,
        category: data.post.category,
        content: data.post.content,
        image_url: data.post.image_url || ''
      });
    } catch (error) {
      setError('Failed to load post');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const res = await fetch(`/api/admin/posts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        router.push('/admin/dashboard');
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to update post');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  if (loading) {
    return (
      <div className="admin-layout">
        <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-logo">
          <h2>⚙️ Admin Panel</h2>
          <p>Welcome, {username}</p>
        </div>
        <nav className="admin-nav">
          <Link href="/admin/dashboard">📊 Dashboard</Link>
          <Link href="/admin/post/new">➕ New Post</Link>
          <a href="/" target="_blank">🌐 View Site</a>
          <a href="#" onClick={(e) => { e.preventDefault(); handleLogout(); }}>🚪 Logout</a>
        </nav>
      </aside>

      <main className="admin-main">
        <header className="admin-header">
          <h1>Edit Post</h1>
        </header>

        <div className="admin-content">
          <div className="form-container">
            <form onSubmit={handleSubmit} className="post-form">
              <div className="form-group">
                <label htmlFor="title">Post Title *</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  placeholder="Enter an epic title..."
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="category">Category *</label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                  >
                    <option value="lore">📜 Lore</option>
                    <option value="news">📰 News</option>
                    <option value="events">🎉 Events</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="image_url">Image URL (optional)</label>
                  <input
                    type="url"
                    id="image_url"
                    name="image_url"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="content">Content *</label>
                <textarea
                  id="content"
                  name="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  required
                  rows="15"
                  placeholder="Write your story here... Use line breaks for new paragraphs."
                />
                <small>💡 Tip: Press Enter twice to create a new paragraph</small>
              </div>

              {error && (
                <div className="alert alert-error">{error}</div>
              )}

              <div className="form-actions">
                <Link href="/admin/dashboard" className="btn btn-secondary">Cancel</Link>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : '💾 Update Post'}
                </button>
              </div>
            </form>
          </div>

          <div className="help-box">
            <h3>📝 Writing Tips</h3>
            <ul>
              <li><strong>Title:</strong> Make it catchy and descriptive</li>
              <li><strong>Category:</strong> Choose Lore for stories, News for announcements, Events for activities</li>
              <li><strong>Image:</strong> Add a screenshot or artwork URL (optional but recommended)</li>
              <li><strong>Content:</strong> Tell your story! Add coordinates, player names, and details</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
