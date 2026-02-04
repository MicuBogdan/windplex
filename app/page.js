import Link from 'next/link';
import { db } from '@/lib/database';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const posts = await db.getAllPosts();

  return (
    <>
      <div className="minecraft-bg"></div>
      
      <nav className="navbar">
        <div className="nav-container">
          <Link href="/" className="logo">📰 The Breadcrumb Gazette</Link>
          <ul className="nav-menu">
            <li><Link href="/">Home</Link></li>
            <li><Link href="/lore">Lore</Link></li>
            <li><Link href="/news">News</Link></li>
            <li><Link href="/events">Events</Link></li>
            <li><Link href="/contact">Contact</Link></li>
          </ul>
        </div>
      </nav>

      <main className="main-content">
        <section className="hero">
          <div className="hero-content">
            <h1 className="glitch" data-text="Welcome Adventurer">Welcome Adventurer</h1>
            <p className="subtitle">Discover the legends and tales of our realm</p>
            <div className="hero-buttons">
              <Link href="/lore" className="btn btn-primary">📜 Read Lore</Link>
              <Link href="/news" className="btn btn-secondary">📰 Latest News</Link>
            </div>
          </div>
        </section>

        <section className="posts-section">
          <h2 className="section-title">Latest Chronicles</h2>
          <div className="posts-grid">
            {posts.slice(0, 3).length === 0 ? (
              <div className="empty-state-full">
                <p>🏜️ No stories have been written yet...</p>
                <p className="subtitle">Check back soon for epic tales!</p>
              </div>
            ) : (
              posts.slice(0, 3).map(post => (
                <article key={post.id} className="post-card">
                  {post.image_url ? (
                    <div className="post-image" style={{backgroundImage: `url('${post.image_url}')`}}></div>
                  ) : (
                    <div className="post-image post-image-default" data-category={post.category}></div>
                  )}
                  <div className="post-content">
                    <span className={`post-category ${post.category}`}>{post.category.toUpperCase()}</span>
                    <h3>{post.title}</h3>
                    <p>{post.content.substring(0, 120)}...</p>
                    <div className="post-footer">
                      <span className="post-date">📅 {new Date(post.created_at).toLocaleDateString()}</span>
                      <Link href={`/post/${post.id}`} className="read-more">Read More →</Link>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>

        <section className="cta-section">
          <div className="cta-content">
            <h2>Want to Contribute?</h2>
            <p>Join our team of explorers and help document the server's adventures</p>
            <Link href="/contact" className="btn btn-primary">Become a Helper</Link>
          </div>
        </section>
      </main>

      <footer className="footer">
        <p>📰 The Breadcrumb Gazette | Made by <a href="https://micubogdan.dev" target="_blank" style={{color: '#d4af8f', textDecoration: 'none', fontWeight: 'bold'}}>@micubogdan</a></p>
        <p><Link href="/admin/login" style={{color: '#666', textDecoration: 'none', fontSize: '0.8em'}}>Admin</Link></p>
      </footer>
    </>
  );
}
