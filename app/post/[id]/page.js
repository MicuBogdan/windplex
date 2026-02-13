import Link from 'next/link';
import { db } from '@/lib/database';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { id } = await params;
  const post = await db.getPostById(id);

  if (!post) {
    return {
      title: 'Post Not Found'
    };
  }

  // Get first 200 characters of content as description
  const description = post.content
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .substring(0, 200)
    .trim() + '...';

  return {
    title: `${post.title} - The Breadcrumb Gazette`,
    description: description,
    openGraph: {
      title: post.title,
      description: description,
      type: 'article',
      url: `https://windplex.vercel.app/post/${id}`,
      images: post.image_url ? [
        {
          url: post.image_url,
          width: 1200,
          height: 630,
          alt: post.title,
        }
      ] : [],
      siteName: 'The Breadcrumb Gazette',
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: description,
      images: post.image_url ? [post.image_url] : [],
    }
  };
}

export default async function PostPage({ params }) {
  const { id } = (await params);
  const post = await db.getPostById(id);

  if (!post) {
    notFound();
  }

  // Convert plain text to HTML paragraphs
  const formatContent = (text) => {
    // If already contains HTML tags, use as is
    if (/<[a-z][\s\S]*>/i.test(text)) {
      return text;
    }
    // Otherwise, convert newlines to paragraphs
    const linkify = (value) =>
      value.replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');

    return text
      .split('\n\n')
      .filter(para => para.trim())
      .map(para => `<p>${linkify(para.trim().replace(/\n/g, '<br>'))}</p>`)
      .join('');
  };

  const formattedContent = formatContent(post.content);

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
              <li><Link href="/contact">Contact</Link></li>
            </ul>
          </div>
        </div>
      </nav>

      <main className="main-content">
        <article className="post-full">
          <div className="post-header">
            <span className={`post-category ${post.category}`}>{post.category.toUpperCase()}</span>
            <h1 className="post-title">{post.title}</h1>
            <div className="post-meta">
              <span className="post-date">📅 {new Date(post.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
          </div>

          {post.category === 'news' && (
            <>
              <div className="post-body">
                <div dangerouslySetInnerHTML={{ __html: formattedContent }} />
              </div>
              {post.image_url && (
                <div className="post-featured-image">
                  <img src={post.image_url} alt={post.title} />
                </div>
              )}
            </>
          )}

          {post.category !== 'news' && (
            <>
              {post.image_url && (
                <div className="post-featured-image">
                  <img src={post.image_url} alt={post.title} />
                </div>
              )}
              <div className="post-body">
                <div dangerouslySetInnerHTML={{ __html: formattedContent }} />
              </div>
            </>
          )}

          <div className="post-actions">
            <Link href={`/${post.category}`} className="btn btn-secondary">
              ← Back to {post.category.charAt(0).toUpperCase() + post.category.slice(1)}
            </Link>
            <Link href="/" className="btn btn-primary">🏠 Home</Link>
          </div>
        </article>
      </main>

      <footer className="footer">
        <p>📰 The Breadcrumb Gazette | Made by <a href="https://micubogdan.dev" target="_blank" style={{color: '#d4af8f', textDecoration: 'none', fontWeight: 'bold'}}>@micubogdan</a></p>
      </footer>
    </>
  );
}
