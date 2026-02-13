'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function WikiModerator() {
  const router = useRouter();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadSubmissions = async () => {
    try {
      const res = await fetch('/api/wiki/submissions');
      if (!res.ok) {
        router.push('/wiki');
        return;
      }
      const data = await res.json();
      setSubmissions(data.submissions || []);
    } catch (err) {
      setError('Failed to load submissions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubmissions();
  }, []);

  const handleAction = async (id, action) => {
    const note = action === 'reject' ? prompt('Optional note for rejection:') : '';
    const res = await fetch(`/api/wiki/submissions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, note })
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      setError(data.detail ? `${data.error} (${data.detail})` : (data.error || 'Failed to update submission'));
      return;
    }

    loadSubmissions();
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
          <h1 className="page-title">🛡️ Wiki Moderation</h1>
          <p className="page-subtitle">Review and approve community submissions.</p>
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>
        ) : error ? (
          <div className="alert alert-error">{error}</div>
        ) : (
          <div className="table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Author</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {submissions.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '40px' }}>
                      No pending submissions
                    </td>
                  </tr>
                ) : (
                  submissions.map(submission => (
                    <tr key={submission.id}>
                      <td>{submission.title}</td>
                      <td>{submission.username || 'Unknown'}</td>
                      <td>{new Date(submission.created_at).toLocaleDateString()}</td>
                      <td className="actions">
                        <button className="btn btn-sm btn-secondary" onClick={() => handleAction(submission.id, 'approve')}>
                          Approve
                        </button>
                        <button className="btn btn-sm btn-danger" onClick={() => handleAction(submission.id, 'reject')}>
                          Reject
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>

      <footer className="footer">
        <p>📚 The Breadcrumb Gazette Wiki</p>
      </footer>
    </>
  );
}
