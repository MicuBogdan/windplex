'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminDashboard() {
  const router = useRouter();
  const [posts, setPosts] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [postsRes, contactsRes] = await Promise.all([
        fetch('/api/admin/posts'),
        fetch('/api/admin/contacts')
      ]);

      if (!postsRes.ok || !contactsRes.ok) {
        router.push('/admin/login');
        return;
      }

      const postsData = await postsRes.json();
      const contactsData = await contactsRes.json();

      setPosts(postsData.posts || []);
      setContacts(contactsData.contacts || []);
    } catch (error) {
      console.error('Failed to load data:', error);
      router.push('/admin/login');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  const handleDeletePost = async (id) => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      const res = await fetch(`/api/admin/posts/${id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        loadData();
      }
    } catch (error) {
      alert('Failed to delete post');
    }
  };

  const handleDeleteContact = async (id) => {
    if (!confirm('Delete this message?')) return;

    try {
      const res = await fetch(`/api/admin/contacts/${id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        loadData();
      }
    } catch (error) {
      alert('Failed to delete message');
    }
  };

  if (loading) {
    return <div className="admin-container">Loading...</div>;
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>📰 Admin Dashboard</h1>
        <div className="admin-actions">
          <Link href="/" className="btn btn-secondary">View Site</Link>
          <button onClick={handleLogout} className="btn btn-danger">Logout</button>
        </div>
      </div>

      <div className="admin-section">
        <div className="section-header">
          <h2>Posts ({posts.length})</h2>
          <Link href="/admin/post/new" className="btn btn-primary">+ New Post</Link>
        </div>

        {posts.length > 0 ? (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map(post => (
                <tr key={post.id}>
                  <td>{post.title}</td>
                  <td><span className="badge">{post.category}</span></td>
                  <td>{new Date(post.created_at).toLocaleDateString()}</td>
                  <td className="actions">
                    <Link href={`/admin/post/edit/${post.id}`} className="btn btn-sm btn-secondary">
                      Edit
                    </Link>
                    <button 
                      onClick={() => handleDeletePost(post.id)}
                      className="btn btn-sm btn-danger"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-state">No posts yet</div>
        )}
      </div>

      <div className="admin-section">
        <h2>Contact Messages ({contacts.length})</h2>

        {contacts.length > 0 ? (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Message</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map(contact => (
                <tr key={contact.id}>
                  <td>{contact.name}</td>
                  <td>{contact.email}</td>
                  <td style={{ maxWidth: '300px' }}>{contact.message.substring(0, 100)}...</td>
                  <td>{new Date(contact.created_at).toLocaleDateString()}</td>
                  <td className="actions">
                    <button 
                      onClick={() => handleDeleteContact(contact.id)}
                      className="btn btn-sm btn-danger"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-state">No messages yet</div>
        )}
      </div>
    </div>
  );
}
