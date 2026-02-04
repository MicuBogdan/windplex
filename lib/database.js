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
  
  createPost: async (title, content, category, imageUrl) => {
    const client = await pool.connect();
    try {
      await client.query('INSERT INTO posts (title, content, category, image_url) VALUES ($1, $2, $3, $4)', [title, content, category, imageUrl]);
    } finally {
      client.release();
    }
  },
  
  updatePost: async (id, title, content, category, imageUrl) => {
    const client = await pool.connect();
    try {
      await client.query('UPDATE posts SET title = $1, content = $2, category = $3, image_url = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5', [title, content, category, imageUrl, id]);
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
  }
};

// Initialize database on startup
initializeDatabase().catch(console.error);
initializeAdmin().catch(console.error);

module.exports = { db, pool };
