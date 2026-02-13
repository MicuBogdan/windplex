'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminWiki() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [wikiUsername, setWikiUsername] = useState('');
  const [moderators, setModerators] = useState([]);
  const [invites, setInvites] = useState([]);
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [username] = useState('admin');

  const loadData = async () => {
    try {
      const [modsRes, pagesRes] = await Promise.all([
        fetch('/api/admin/wiki/moderators'),
        fetch('/api/admin/wiki/pages')
      ]);

      if (!modsRes.ok || !pagesRes.ok) {
        router.push('/admin/login');
        return;
      }
      const modsData = await modsRes.json();
      const pagesData = await pagesRes.json();
      setModerators(modsData.moderators || []);
      setInvites(modsData.invites || []);
      setPages(pagesData.pages || []);
    } catch (err) {
      setError('Failed to load moderators');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch('/api/admin/wiki/moderators', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, username: wikiUsername })
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to add moderator');
        return;
      }

      setEmail('');
      setWikiUsername('');
      loadData();
    } catch (err) {
      setError('Network error. Please try again.');
    }
  };

  const handleRemoveModerator = async (user) => {
    if (!confirm('Remove moderator access for this user?')) return;

    await fetch('/api/admin/wiki/moderators', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: user.id })
    });
    loadData();
  };

  const handleRemoveInvite = async (inviteEmail) => {
    if (!confirm('Remove this invite?')) return;

    await fetch('/api/admin/wiki/moderators', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: inviteEmail, removeInvite: true })
    });
    loadData();
  };

  const handleDeletePage = async (pageId) => {
    if (!confirm('Delete this wiki page?')) return;

    await fetch(`/api/admin/wiki/pages/${pageId}`, {
      method: 'DELETE'
    });
    loadData();
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
          <Link href="/admin/wiki" className="active">📚 Wiki Moderators</Link>
          <a href="/" target="_blank">🌐 View Site</a>
          <a href="#" onClick={(e) => { e.preventDefault(); handleLogout(); }}>🚪 Logout</a>
        </nav>
      </aside>

      <main className="admin-main">
        <header className="admin-header">
          <h1>Wiki Moderators</h1>
        </header>

        <div className="admin-content">
          <div className="form-container">
            <h3>Add Moderator</h3>
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={handleAdd} className="post-form">
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="wikiUsername">Minecraft Username</label>
                <input
                  type="text"
                  id="wikiUsername"
                  value={wikiUsername}
                  onChange={(e) => setWikiUsername(e.target.value)}
                />
                <small>Fill email or username. If the user exists they become moderator immediately.</small>
              </div>
              <div className="form-actions">
                <button className="btn btn-primary" type="submit">Add Moderator</button>
              </div>
            </form>
          </div>

          <section className="admin-section" style={{ marginTop: '2rem' }}>
            <div className="section-header">
              <h2>Current Moderators</h2>
            </div>
            <div className="table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {moderators.length === 0 ? (
                    <tr>
                      <td colSpan="4" style={{ textAlign: 'center', padding: '40px' }}>No moderators yet</td>
                    </tr>
                  ) : (
                    moderators.map(user => (
                      <tr key={user.id}>
                        <td>{user.username}</td>
                        <td>{user.email}</td>
                        <td>{user.role}</td>
                        <td className="actions">
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleRemoveModerator(user)}
                            disabled={user.role === 'admin'}
                          >
                            {user.role === 'admin' ? 'Locked' : 'Remove'}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="admin-section" style={{ marginTop: '2rem' }}>
            <div className="section-header">
              <h2>Pending Invites</h2>
            </div>
            <div className="table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Email</th>
                    <th>Invited</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invites.length === 0 ? (
                    <tr>
                      <td colSpan="2" style={{ textAlign: 'center', padding: '40px' }}>No pending invites</td>
                    </tr>
                  ) : (
                    invites.map(invite => (
                      <tr key={invite.id}>
                        <td>{invite.email}</td>
                        <td>{new Date(invite.created_at).toLocaleDateString()}</td>
                        <td className="actions">
                          <button className="btn btn-sm btn-danger" onClick={() => handleRemoveInvite(invite.email)}>
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="admin-section" style={{ marginTop: '2rem' }}>
            <div className="section-header">
              <h2>Published Wiki Pages</h2>
            </div>
            <div className="table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Slug</th>
                    <th>Updated</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pages.length === 0 ? (
                    <tr>
                      <td colSpan="4" style={{ textAlign: 'center', padding: '40px' }}>No pages yet</td>
                    </tr>
                  ) : (
                    pages.map(page => (
                      <tr key={page.id}>
                        <td>{page.title}</td>
                        <td>{page.slug}</td>
                        <td>{new Date(page.updated_at).toLocaleDateString()}</td>
                        <td className="actions">
                          <button className="btn btn-sm btn-danger" onClick={() => handleDeletePage(page.id)}>
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
