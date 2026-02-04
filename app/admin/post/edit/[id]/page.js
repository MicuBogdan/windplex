'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function EditPost({ params }) {
  const router = useRouter();
  const { id } = params;
  const [formData, setFormData] = useState({
    title: '',
    category: 'lore',
    content: '',
    image_url: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

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

  if (loading) {
    return <div className="admin-container">Loading...</div>;
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>Edit Post</h1>
        <Link href="/admin/dashboard" className="btn btn-secondary">← Back</Link>
      </div>

      <form onSubmit={handleSubmit} className="post-form">
        <div className="form-group">
          <label htmlFor="title">Title *</label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="category">Category *</label>
          <select
            id="category"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            required
          >
            <option value="lore">Lore</option>
            <option value="news">News</option>
            <option value="events">Events</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="image_url">Image URL (optional)</label>
          <input
            type="url"
            id="image_url"
            value={formData.image_url}
            onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
            placeholder="https://example.com/image.jpg"
          />
        </div>

        <div className="form-group">
          <label htmlFor="content">Content * (HTML supported)</label>
          <textarea
            id="content"
            rows="15"
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            required
          />
        </div>

        {error && (
          <div className="alert alert-error">{error}</div>
        )}

        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}
