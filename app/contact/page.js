'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
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

      const data = await res.json();

      if (res.ok) {
        setStatus('success');
        setFormData({ name: '', email: '', message: '' });
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
      <nav className="navbar">
        <div className="container">
          <Link href="/" className="logo">📰 The Breadcrumb Gazette</Link>
          <div className="nav-links">
            <Link href="/lore">Lore</Link>
            <Link href="/news">News</Link>
            <Link href="/events">Events</Link>
            <Link href="/contact">Contact</Link>
          </div>
        </div>
      </nav>

      <div className="container">
        <div className="hero">
          <h1>Contact Us</h1>
          <p className="subtitle">Send feedback, report issues, or apply for server helper</p>
        </div>

        <div className="contact-form">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="message">Message</label>
              <textarea
                id="message"
                rows="6"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Sending...' : 'Send Message'}
            </button>

            {status === 'success' && (
              <div className="alert alert-success">
                ✓ Message sent successfully! We'll get back to you soon.
              </div>
            )}

            {status === 'error' && (
              <div className="alert alert-error">
                ✗ Failed to send message. Please try again.
              </div>
            )}
          </form>
        </div>
      </div>

      <footer className="footer">
        <div className="container">
          <p>📰 The Breadcrumb Gazette | Made by <a href="https://micubogdan.dev" target="_blank" style={{color: '#d4af8f', textDecoration: 'none', fontWeight: 'bold'}}>@micubogdan</a></p>
        </div>
      </footer>
    </>
  );
}
