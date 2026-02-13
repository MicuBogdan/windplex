import Link from 'next/link';
import { db } from '@/lib/database';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function WikiPage({ params }) {
  const { slug } = await params;
  const page = await db.getWikiPageBySlug(slug);

  if (!page) {
    notFound();
  }

  const formattedContent = /<[a-z][\s\S]*>/i.test(page.content)
    ? page.content
    : page.content
        .split('\n\n')
        .filter(para => para.trim())
        .map(para => `<p>${para.trim().replace(/\n/g, '<br>')}</p>`)
        .join('');

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
        <article className="post-full">
          <div className="post-header">
            <span className="post-category lore">WIKI</span>
            <h1 className="post-title">{page.title}</h1>
            <div className="post-meta">
              <span className="post-date">📅 Updated {new Date(page.updated_at).toLocaleDateString()}</span>
            </div>
          </div>

          <div className="post-body">
            <div dangerouslySetInnerHTML={{ __html: formattedContent }} />
          </div>

          <div className="post-actions">
            <Link href="/wiki" className="btn btn-secondary">← Back to Wiki</Link>
            <Link href="/" className="btn btn-primary">🏠 Home</Link>
          </div>
        </article>
      </main>

      <footer className="footer">
        <p>📚 The Breadcrumb Gazette Wiki</p>
      </footer>
    </>
  );
}
