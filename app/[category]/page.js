import Link from 'next/link';
import { db } from '@/lib/database';

export const dynamic = 'force-dynamic';

export default async function CategoryPage({ params }) {
  const { category } = params;
  const categoryName = category.charAt(0).toUpperCase() + category.slice(1);
  const posts = await db.getPostsByCategory(category);

  const subtitles = {
    lore: '📜 The ancient stories and legends of our world',
    news: '📰 Latest happenings and announcements',
    events: '🎉 Upcoming and past server events'
  };

  return (
    <>
      <div className="minecraft-bg"></div>
      
      <nav className="navbar">
        <div className="nav-container">
          <Link href="/" className="logo">📰 The Breadcrumb Gazette</Link>
          <ul className="nav-menu">
            <li><Link href="/">Home</Link></li>
            <li><Link href="/lore" className={category === 'lore' ? 'active' : ''}>Lore</Link></li>
            <li><Link href="/news" className={category === 'news' ? 'active' : ''}>News</Link></li>
            <li><Link href="/events" className={category === 'events' ? 'active' : ''}>Events</Link></li>
            <li><Link href="/contact">Contact</Link></li>
          </ul>
        </div>
      </nav>

      <main className="main-content">
        <div className="page-header">
          <h1 className="page-title">{categoryName}</h1>
          <p className="page-subtitle">{subtitles[category]}</p>
        </div>

        <section className="posts-section">
          <div className="posts-list">
            {posts.length === 0 ? (
              <div className="empty-state-full">
                <p>📰 No {categoryName.toLowerCase()} stories yet. Check back soon!</p>
              </div>
            ) : (
              posts.map(post => (
                <article key={post.id} className="post-card">
                  {post.image_url ? (
                    <div className="post-image" style={{backgroundImage: `url('${post.image_url}')`}}></div>
                  ) : (
                    <div className="post-image post-image-default" data-category={post.category}></div>
                  )}
                  <div className="post-content">
                    <span className={`post-category ${post.category}`}>{post.category.toUpperCase()}</span>
                    <h3>{post.title}</h3>
                    <p>{post.content.substring(0, 200)}...</p>
                    <div className="post-footer">
                      <span className="post-date">📅 {new Date(post.created_at).toLocaleDateString()}</span>
                      <Link href={`/post/${post.id}`} className="read-more">Read Full Story →</Link>
                    </div>
                  </div>
                </article>
              ))
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
