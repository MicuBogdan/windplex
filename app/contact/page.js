'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    type: '',
    message: ''
  });
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setStatus('success');
        setFormData({ name: '', email: '', type: '', message: '' });
      } else {
        setStatus('error');
      }
    } catch (error) {
      setStatus('error');
    } finally {
      setLoading(false);
    }
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
              <li><Link href="/wiki">Wiki</Link></li>
              <li><Link href="/contact" className="active">Contact</Link></li>
            </ul>
          </div>
        </div>
      </nav>

      <main className="main-content">
        <div className="page-header">
          <h1 className="page-title">Get in Touch</h1>
          <p className="page-subtitle">📬 Have feedback, news, or want to become a helper?</p>
        </div>

        <section className="contact-section">
          <div className="contact-info">
            <div className="info-card">
              <h3>💬 Share Feedback or News</h3>
              <p>Have something interesting happening on the server? Let us know! We'd love to hear about your adventures and discoveries.</p>
            </div>
            <div className="info-card">
              <h3>🔍 Become a Helper</h3>
              <p>Helpers explore and document the server, then send their findings to be published. You'll be credited for your contributions!</p>
            </div>
            <div className="info-card">
              <h3>✉️ What to Include</h3>
              <ul>
                <li>Your in-game name (optional)</li>
                <li>Details about what you found or want to share</li>
                <li>Screenshots or coordinates (if applicable)</li>
                <li>For helpers: explain your documentation style</li>
              </ul>
            </div>
          </div>

          <div className="contact-form-container">
            {status === 'success' ? (
              <div className="alert alert-success">
                <h3>✅ Message Sent Successfully!</h3>
                <p>Thank you for reaching out! We'll get back to you soon.</p>
                <Link href="/" className="btn btn-primary">Return Home</Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="contact-form">
                <div className="form-group">
                  <label htmlFor="name">Your Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    placeholder="Steve"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email Address or Discord Username *</label>
                  <input
                    type="text"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    placeholder="steve@minecraft.net or @steveplays"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="type">I want to... *</label>
                  <select
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    required
                  >
                    <option value="">Choose an option</option>
                    <option value="feedback">Share feedback or news</option>
                    <option value="helper">Apply to become a helper</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="message">Your Message *</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                    rows="6"
                    placeholder="Tell us about your discoveries, ideas, or why you'd like to be a helper..."
                  />
                </div>

                {status === 'error' && (
                  <div className="alert alert-error">
                    ✗ Failed to send message. Please try again.
                  </div>
                )}

                <button type="submit" className="btn btn-primary btn-large" disabled={loading}>
                  {loading ? 'Sending...' : '📤 Send Message'}
                </button>
              </form>
            )}
          </div>
        </section>
      </main>

      <footer className="footer">
        <p>📰 The Breadcrumb Gazette | Made by <a href="https://micubogdan.dev" target="_blank" style={{color: '#d4af8f', textDecoration: 'none', fontWeight: 'bold'}}>@micubogdan</a></p>
      </footer>
    </>
  );
}
