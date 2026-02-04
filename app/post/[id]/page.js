import Link from 'next/link';
import { db } from '@/lib/database';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function PostPage({ params }) {
  const { id } = params;
  const post = await db.getPostById(id);

  if (!post) {
    notFound();
  }

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
        <article className="post-full">
          <div className="post-header">
            <Link href={`/${post.category}`} className="post-category">
              {post.category}
            </Link>
            <h1 className="post-title">{post.title}</h1>
            <div className="post-meta">
              Published on {new Date(post.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
          </div>

          {post.image_url && (
            <div className="post-image-full">
              <img src={post.image_url} alt={post.title} />
            </div>
          )}

          <div 
            className="post-body"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          <div className="post-footer">
            <Link href={`/${post.category}`} className="btn btn-secondary">
              ← Back to {post.category}
            </Link>
          </div>
        </article>
      </div>

      <footer className="footer">
        <div className="container">
          <p>📰 The Breadcrumb Gazette | Made by <a href="https://micubogdan.dev" target="_blank" style={{color: '#d4af8f', textDecoration: 'none', fontWeight: 'bold'}}>@micubogdan</a></p>
        </div>
      </footer>
    </>
  );
}
