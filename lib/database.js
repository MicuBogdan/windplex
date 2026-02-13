const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Initialize database tables
async function initializeDatabase() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS admin (
        id SERIAL PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS posts (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        category TEXT NOT NULL,
        image_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS contacts (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        type TEXT NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status TEXT DEFAULT 'new'
      );

      CREATE TABLE IF NOT EXISTS wiki_users (
        id SERIAL PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS wiki_sessions (
        id TEXT PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES wiki_users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP NOT NULL
      );

      CREATE TABLE IF NOT EXISTS wiki_moderator_invites (
        id SERIAL PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS wiki_pages (
        id SERIAL PRIMARY KEY,
        slug TEXT UNIQUE NOT NULL,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        created_by INTEGER REFERENCES wiki_users(id) ON DELETE SET NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        approved_by INTEGER REFERENCES wiki_users(id) ON DELETE SET NULL
      );

      ALTER TABLE IF EXISTS wiki_pages
        ADD COLUMN IF NOT EXISTS created_by INTEGER REFERENCES wiki_users(id) ON DELETE SET NULL;

      ALTER TABLE IF EXISTS wiki_pages
        ADD COLUMN IF NOT EXISTS approved_by INTEGER REFERENCES wiki_users(id) ON DELETE SET NULL;

      CREATE TABLE IF NOT EXISTS wiki_submissions (
        id SERIAL PRIMARY KEY,
        page_id INTEGER REFERENCES wiki_pages(id) ON DELETE SET NULL,
        slug TEXT,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        created_by INTEGER REFERENCES wiki_users(id) ON DELETE SET NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        reviewer_note TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        reviewed_at TIMESTAMP,
        reviewed_by INTEGER REFERENCES wiki_users(id) ON DELETE SET NULL
      );

      ALTER TABLE IF EXISTS wiki_submissions
        ADD COLUMN IF NOT EXISTS created_by INTEGER REFERENCES wiki_users(id) ON DELETE SET NULL;

      ALTER TABLE IF EXISTS wiki_submissions
        ADD COLUMN IF NOT EXISTS reviewer_note TEXT;

      ALTER TABLE IF EXISTS wiki_submissions
        ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP;

      ALTER TABLE IF EXISTS wiki_submissions
        ADD COLUMN IF NOT EXISTS reviewed_by INTEGER REFERENCES wiki_users(id) ON DELETE SET NULL;
    `);
    console.log('Database tables initialized');
  } finally {
    client.release();
  }
}

// Check if admin exists, if not create one
async function initializeAdmin() {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT id FROM admin LIMIT 1');
    
    if (result.rows.length === 0) {
      const username = process.env.ADMIN_USERNAME || 'admin';
      const password = process.env.ADMIN_PASSWORD || 'changeme123';
      const hashedPassword = await bcrypt.hash(password, 10);
      
      await client.query('INSERT INTO admin (username, password) VALUES ($1, $2)', [username, hashedPassword]);
      console.log(`Admin account created with username: ${username}`);
    }
  } finally {
    client.release();
  }
}

// Database methods
const db = {
  // Admin methods
  getAdminByUsername: async (username) => {
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT * FROM admin WHERE username = $1', [username]);
      return result.rows[0];
    } finally {
      client.release();
    }
  },
  
  updateAdminPassword: async (id, hashedPassword) => {
    const client = await pool.connect();
    try {
      await client.query('UPDATE admin SET password = $1 WHERE id = $2', [hashedPassword, id]);
    } finally {
      client.release();
    }
  },

  // Post methods
  getAllPosts: async () => {
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT * FROM posts ORDER BY created_at DESC');
      return result.rows;
    } finally {
      client.release();
    }
  },
  
  getPostById: async (id) => {
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT * FROM posts WHERE id = $1', [id]);
      return result.rows[0];
    } finally {
      client.release();
    }
  },
  
  getPostsByCategory: async (category) => {
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT * FROM posts WHERE category = $1 ORDER BY created_at DESC', [category]);
      return result.rows;
    } finally {
      client.release();
    }
  },
  
  createPost: async (title, category, content, imageUrl) => {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'INSERT INTO posts (title, category, content, image_url) VALUES ($1, $2, $3, $4) RETURNING id',
        [title, category, content, imageUrl]
      );
      return result.rows[0]?.id;
    } finally {
      client.release();
    }
  },
  
  updatePost: async (id, title, category, content, imageUrl) => {
    const client = await pool.connect();
    try {
      await client.query('UPDATE posts SET title = $1, category = $2, content = $3, image_url = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5', [title, category, content, imageUrl, id]);
    } finally {
      client.release();
    }
  },
  
  deletePost: async (id) => {
    const client = await pool.connect();
    try {
      await client.query('DELETE FROM posts WHERE id = $1', [id]);
    } finally {
      client.release();
    }
  },

  // Contact methods
  createContact: async (name, email, type, message) => {
    const client = await pool.connect();
    try {
      await client.query('INSERT INTO contacts (name, email, type, message) VALUES ($1, $2, $3, $4)', [name, email, type, message]);
    } finally {
      client.release();
    }
  },
  
  getAllContacts: async () => {
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT * FROM contacts ORDER BY created_at DESC');
      return result.rows;
    } finally {
      client.release();
    }
  },
  
  updateContactStatus: async (id, status) => {
    const client = await pool.connect();
    try {
      await client.query('UPDATE contacts SET status = $1 WHERE id = $2', [status, id]);
    } finally {
      client.release();
    }
  },
  
  deleteContact: async (id) => {
    const client = await pool.connect();
    try {
      await client.query('DELETE FROM contacts WHERE id = $1', [id]);
    } finally {
      client.release();
    }
  },

  // Wiki user methods
  getWikiUserByEmail: async (email) => {
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT * FROM wiki_users WHERE email = $1', [email]);
      return result.rows[0];
    } finally {
      client.release();
    }
  },

  getWikiUserByUsername: async (username) => {
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT * FROM wiki_users WHERE username = $1', [username]);
      return result.rows[0];
    } finally {
      client.release();
    }
  },

  createWikiUser: async (email, username, hashedPassword, role = 'user') => {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'INSERT INTO wiki_users (email, username, password, role) VALUES ($1, $2, $3, $4) RETURNING id',
        [email, username, hashedPassword, role]
      );
      return result.rows[0]?.id;
    } finally {
      client.release();
    }
  },

  updateWikiUserRoleByEmail: async (email, role) => {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'UPDATE wiki_users SET role = $1 WHERE email = $2 RETURNING id',
        [role, email]
      );
      return result.rows[0]?.id;
    } finally {
      client.release();
    }
  },

  updateWikiUserRoleByUsername: async (username, role) => {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'UPDATE wiki_users SET role = $1 WHERE username = $2 RETURNING id',
        [role, username]
      );
      return result.rows[0]?.id;
    } finally {
      client.release();
    }
  },

  updateWikiUserRoleById: async (id, role) => {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'UPDATE wiki_users SET role = $1 WHERE id = $2 RETURNING id',
        [role, id]
      );
      return result.rows[0]?.id;
    } finally {
      client.release();
    }
  },

  listWikiModerators: async () => {
    const client = await pool.connect();
    try {
      const result = await client.query(
        "SELECT id, email, username, role, created_at FROM wiki_users WHERE role IN ('moderator', 'admin') ORDER BY created_at DESC"
      );
      return result.rows;
    } finally {
      client.release();
    }
  },

  // Wiki moderator invites
  createModeratorInvite: async (email) => {
    const client = await pool.connect();
    try {
      await client.query(
        'INSERT INTO wiki_moderator_invites (email) VALUES ($1) ON CONFLICT (email) DO NOTHING',
        [email]
      );
    } finally {
      client.release();
    }
  },

  listModeratorInvites: async () => {
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT * FROM wiki_moderator_invites ORDER BY created_at DESC');
      return result.rows;
    } finally {
      client.release();
    }
  },

  consumeModeratorInvite: async (email) => {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'DELETE FROM wiki_moderator_invites WHERE email = $1 RETURNING id',
        [email]
      );
      return result.rows.length > 0;
    } finally {
      client.release();
    }
  },

  deleteModeratorInviteByEmail: async (email) => {
    const client = await pool.connect();
    try {
      await client.query('DELETE FROM wiki_moderator_invites WHERE email = $1', [email]);
    } finally {
      client.release();
    }
  },

  // Wiki sessions
  createWikiSession: async (sessionId, userId, expiresAt) => {
    const client = await pool.connect();
    try {
      await client.query(
        'INSERT INTO wiki_sessions (id, user_id, expires_at) VALUES ($1, $2, $3)',
        [sessionId, userId, expiresAt]
      );
    } finally {
      client.release();
    }
  },

  getWikiSession: async (sessionId) => {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT s.id, s.expires_at, u.id as user_id, u.email, u.username, u.role FROM wiki_sessions s JOIN wiki_users u ON s.user_id = u.id WHERE s.id = $1',
        [sessionId]
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  },

  deleteWikiSession: async (sessionId) => {
    const client = await pool.connect();
    try {
      await client.query('DELETE FROM wiki_sessions WHERE id = $1', [sessionId]);
    } finally {
      client.release();
    }
  },

  // Wiki pages
  getApprovedWikiPages: async () => {
    const client = await pool.connect();
    try {
      const result = await client.query(
        "SELECT * FROM wiki_pages WHERE status = 'approved' ORDER BY updated_at DESC"
      );
      return result.rows;
    } finally {
      client.release();
    }
  },

  searchWikiPages: async (query) => {
    const client = await pool.connect();
    try {
      const like = `%${query}%`;
      const result = await client.query(
        "SELECT * FROM wiki_pages WHERE status = 'approved' AND (title ILIKE $1 OR content ILIKE $1) ORDER BY updated_at DESC",
        [like]
      );
      return result.rows;
    } finally {
      client.release();
    }
  },

  getWikiPageBySlug: async (slug) => {
    const client = await pool.connect();
    try {
      const result = await client.query(
        "SELECT * FROM wiki_pages WHERE slug = $1 AND status = 'approved'",
        [slug]
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  },

  deleteWikiPageById: async (id) => {
    const client = await pool.connect();
    try {
      await client.query('DELETE FROM wiki_pages WHERE id = $1', [id]);
    } finally {
      client.release();
    }
  },

  // Wiki submissions
  createWikiSubmission: async (pageId, slug, title, content, createdBy) => {
    const client = await pool.connect();
    try {
      await client.query(
        'INSERT INTO wiki_submissions (page_id, slug, title, content, created_by) VALUES ($1, $2, $3, $4, $5)',
        [pageId, slug, title, content, createdBy]
      );
    } finally {
      client.release();
    }
  },

  listPendingWikiSubmissions: async () => {
    const client = await pool.connect();
    try {
      const result = await client.query(
        "SELECT s.*, u.username FROM wiki_submissions s LEFT JOIN wiki_users u ON s.created_by = u.id WHERE s.status = 'pending' ORDER BY s.created_at DESC"
      );
      return result.rows;
    } finally {
      client.release();
    }
  },

  getWikiSubmissionById: async (id) => {
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT * FROM wiki_submissions WHERE id = $1', [id]);
      return result.rows[0];
    } finally {
      client.release();
    }
  },

  getWikiSubmissionBySlug: async (slug) => {
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT * FROM wiki_submissions WHERE slug = $1 AND status = $2', [slug, 'pending']);
      return result.rows[0];
    } finally {
      client.release();
    }
  },

  approveWikiSubmission: async (submissionId, reviewerId, reviewerNote = null) => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const submissionResult = await client.query('SELECT * FROM wiki_submissions WHERE id = $1 FOR UPDATE', [submissionId]);
      const submission = submissionResult.rows[0];

      if (!submission) {
        await client.query('ROLLBACK');
        return false;
      }

      if (submission.page_id) {
        await client.query(
          "UPDATE wiki_pages SET title = $1, content = $2, updated_at = CURRENT_TIMESTAMP, status = 'approved', approved_by = $3 WHERE id = $4",
          [submission.title, submission.content, reviewerId, submission.page_id]
        );
      } else {
        await client.query(
          "INSERT INTO wiki_pages (slug, title, content, created_by, status, approved_by) VALUES ($1, $2, $3, $4, 'approved', $5)",
          [submission.slug, submission.title, submission.content, submission.created_by, reviewerId]
        );
      }

      await client.query(
        "UPDATE wiki_submissions SET status = 'approved', reviewed_at = CURRENT_TIMESTAMP, reviewed_by = $1, reviewer_note = $2 WHERE id = $3",
        [reviewerId, reviewerNote, submissionId]
      );
      await client.query('COMMIT');
      return submission;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  rejectWikiSubmission: async (submissionId, reviewerId, reviewerNote = null) => {
    const client = await pool.connect();
    try {
      await client.query(
        "UPDATE wiki_submissions SET status = 'rejected', reviewed_at = CURRENT_TIMESTAMP, reviewed_by = $1, reviewer_note = $2 WHERE id = $3",
        [reviewerId, reviewerNote, submissionId]
      );
    } finally {
      client.release();
    }
  }
};

// Initialize database on startup
initializeDatabase().catch(console.error);
initializeAdmin().catch(console.error);

module.exports = { db, pool };
