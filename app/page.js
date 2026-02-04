import Link from 'next/link';
import { db } from '@/lib/database';
export const dynamic = 'force-dynamic';
export default async function HomePage() {
  const posts = await db.getAllPosts();
  const latestPosts = posts.slice(0, 3);

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
          <h1>📰 The Breadcrumb Gazette</h1>
          <p className="subtitle">Your Source for Server News, Lore & Events</p>
        </div>

        {latestPosts.length > 0 ? (
          <>
            <h2 className="section-title">Latest Stories</h2>
            <div className="posts-grid">
              {latestPosts.map((post) => (
                <article key={post.id} className="post-card">
                  {post.image_url && (
                    <div className="post-image">
                      <img src={post.image_url} alt={post.title} />
                    </div>
                  )}
                  <div className="post-content">
                    <span className="post-category">{post.category}</span>
                    <h3 className="post-title">{post.title}</h3>
                    <div 
                      className="post-excerpt"
                      dangerouslySetInnerHTML={{ __html: post.content.substring(0, 150) + '...' }}
                    />
                    <Link href={`/post/${post.id}`} className="read-more">
                      Read Full Story →
                    </Link>
                    <div className="post-meta">
                      {new Date(post.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </>
        ) : (
          <div className="empty-state-full">
            <p>📰 No stories published yet. Check back soon!</p>
          </div>
        )}
      </div>

      <footer className="footer">
        <div className="container">
          <p>📰 The Breadcrumb Gazette | Made by <a href="https://micubogdan.dev" target="_blank" style={{color: '#d4af8f', textDecoration: 'none', fontWeight: 'bold'}}>@micubogdan</a></p>
        </div>
      </footer>
    </>
  );
}
