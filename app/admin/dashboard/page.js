'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminDashboard() {
  const router = useRouter();
  const [posts, setPosts] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [username] = useState('admin');

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
          <Link href="/admin/dashboard" className="active">📊 Dashboard</Link>
          <Link href="/admin/post/new">➕ New Post</Link>
          <a href="/" target="_blank">🌐 View Site</a>
          <a href="#" onClick={(e) => { e.preventDefault(); handleLogout(); }}>🚪 Logout</a>
        </nav>
      </aside>

      <main className="admin-main">
        <header className="admin-header">
          <h1>Dashboard</h1>
        </header>

        <div className="admin-content">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">📝</div>
              <div className="stat-info">
                <h3>{posts.length}</h3>
                <p>Total Posts</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📬</div>
              <div className="stat-info">
                <h3>{contacts.filter(c => c.status === 'new').length}</h3>
                <p>New Messages</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🔍</div>
              <div className="stat-info">
                <h3>{contacts.filter(c => c.type === 'helper').length}</h3>
                <p>Helper Applications</p>
              </div>
            </div>
          </div>

          <section className="admin-section">
            <div className="section-header">
              <h2>Recent Posts</h2>
              <Link href="/admin/post/new" className="btn btn-primary">➕ New Post</Link>
            </div>
            <div className="table-container">
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
                  {posts.length === 0 ? (
                    <tr>
                      <td colSpan="4" style={{ textAlign: 'center', padding: '40px' }}>
                        No posts yet. Create your first post!
                      </td>
                    </tr>
                  ) : (
                    posts.map(post => (
                      <tr key={post.id}>
                        <td><strong>{post.title}</strong></td>
                        <td>
                          <span className={`badge badge-${post.category}`}>
                            {post.category.toUpperCase()}
                          </span>
                        </td>
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
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="admin-section">
            <div className="section-header">
              <h2>Contact Messages</h2>
            </div>
            <div className="table-container">
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
                  {contacts.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '40px' }}>
                        No messages yet
                      </td>
                    </tr>
                  ) : (
                    contacts.map(contact => (
                      <tr key={contact.id}>
                        <td>{contact.name}</td>
                        <td>{contact.email}</td>
                        <td style={{ maxWidth: '300px' }}>
                          {contact.message.substring(0, 100)}...
                        </td>
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
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
