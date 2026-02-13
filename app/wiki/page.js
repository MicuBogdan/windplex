import Link from 'next/link';
import { db } from '@/lib/database';
import { getWikiSessionUser } from '@/lib/wikiAuth';

export const dynamic = 'force-dynamic';

export default async function WikiHome({ searchParams }) {
  const user = await getWikiSessionUser();
  const params = await searchParams;
  const query = params?.q?.toString() || '';
  const pages = query ? await db.searchWikiPages(query) : await db.getApprovedWikiPages();

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
          <h1 className="page-title">📚 Server Wiki</h1>
          <p className="page-subtitle">Discover and document the world, one page at a time.</p>
        </div>

        <section className="wiki-hero">
          <form className="wiki-search" action="/wiki" method="GET">
            <input
              type="text"
              name="q"
              className="wiki-search-input"
              placeholder="Search pages..."
              defaultValue={query}
            />
            <button className="btn btn-primary" type="submit">Search</button>
          </form>
          <div className="wiki-actions">
            {user ? (
              <>
                <span className="wiki-user">Logged in as {user.username}</span>
                <Link href="/wiki/submit" className="btn btn-secondary">✍️ Submit Page</Link>
                {(user.role === 'moderator' || user.role === 'admin') && (
                  <Link href="/wiki/moderator" className="btn btn-primary">🛡️ Moderation</Link>
                )}
                <Link href="/wiki/logout" className="btn btn-danger">Logout</Link>
              </>
            ) : (
              <>
                <Link href="/wiki/login" className="btn btn-secondary">Login</Link>
                <Link href="/wiki/register" className="btn btn-primary">Create Account</Link>
              </>
            )}
          </div>
        </section>

        <section className="posts-section">
          <h2 className="section-title">Pages</h2>
          <div className="posts-grid">
            {pages.length === 0 ? (
              <div className="empty-state-full">
                <p>🧭 No pages found yet.</p>
              </div>
            ) : (
              pages.map(page => (
                <article key={page.id} className="post-card">
                  <div className="post-content">
                    <span className="post-category lore">WIKI</span>
                    <h3>{page.title}</h3>
                    <p>{page.content.substring(0, 140)}...</p>
                    <div className="post-footer">
                      <span className="post-date">📅 {new Date(page.updated_at).toLocaleDateString()}</span>
                      <Link href={`/wiki/${page.slug}`} className="read-more">Read Page →</Link>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      </main>

      <footer className="footer">
        <p>📚 The Breadcrumb Gazette Wiki</p>
      </footer>
    </>
  );
}
