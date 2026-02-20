import Link from 'next/link';
import { db } from '@/lib/database';
import { getWikiSessionUser } from '@/lib/wikiAuth';
import { notFound } from 'next/navigation';
import WikiGallerySection from '@/app/components/WikiGallerySection';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const page = await db.getWikiPageBySlug(slug);

  if (!page) {
    return { title: 'Page Not Found' };
  }

  const description = page.content
    .replace(/<[^>]*>/g, '')
    .substring(0, 200)
    .trim() + '...';

  return {
    title: `${page.title} - World Archives`,
    description,
    openGraph: {
      title: page.title,
      description,
      type: 'article',
      url: `https://windplex.vercel.app/wiki/${slug}`,
      siteName: 'World Archives',
      ...(page.featured_image_url && {
        image: page.featured_image_url
      })
    },
    twitter: {
      card: 'summary',
      title: page.title,
      description,
      ...(page.featured_image_url && {
        image: page.featured_image_url
      })
    }
  };
}

export default async function WikiPage({ params }) {
  const { slug } = await params;
  const page = await db.getWikiPageBySlug(slug);
  const user = await getWikiSessionUser();

  if (!page) {
    notFound();
  }

  const gallery = await db.getWikiPageGallery(page.id);

  const linkify = (text) =>
    text.replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');

  const formattedContent = /<[a-z][\s\S]*>/i.test(page.content)
    ? page.content
    : page.content
        .split('\n\n')
        .filter(para => para.trim())
        .map(para => `<p>${linkify(para.trim().replace(/\n/g, '<br>'))}</p>`)
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

          {page.featured_image_url && (
            <div className="post-featured-image">
              <img src={page.featured_image_url} alt={page.title} />
            </div>
          )}

          <div className="post-body">
            <div dangerouslySetInnerHTML={{ __html: formattedContent }} />
          </div>

          <WikiGallerySection
            gallery={gallery}
            featuredImage={page.featured_image_url}
            title={page.title}
          />

          <div className="post-actions">
            <Link href="/wiki" className="btn btn-secondary">← Back to Wiki</Link>
            {user && (
              <Link href={`/wiki/edit/${page.slug}`} className="btn btn-primary">Suggest Edit</Link>
            )}
            <Link href="/" className="btn btn-primary">🏠 Home</Link>
          </div>
        </article>
      </main>

      <footer className="footer">
        <p>📚 World Archives</p>
      </footer>
    </>
  );
}
