# 📰 The Breadcrumb Gazette

A newspaper-themed website for Minecraft server news, lore, and events. Built with Next.js 14 and PostgreSQL.

![Next.js](https://img.shields.io/badge/Next.js-14-black)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-blue)
![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black)

## ✨ Features

- 📜 **Vintage Newspaper Design** - Antique sepia theme with serif fonts
- 📝 **Post Management** - Create, edit, delete posts in Lore/News/Events categories
- 💬 **Contact Form** - Users can send feedback or apply for server helper
- 🔐 **Admin Panel** - Secure dashboard for content management
- 🚀 **Optimized for Vercel** - Serverless deployment with automatic scaling
- 🗄️ **PostgreSQL Database** - Powered by Neon for reliable data storage

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: JavaScript
- **Database**: PostgreSQL (Neon)
- **Styling**: Custom CSS (no frameworks)
- **Authentication**: bcrypt + cookie sessions
- **Deployment**: Vercel

## 📁 Project Structure

```
breadcrumb-gazette/
├── app/
│   ├── layout.js              # Root layout with CSS imports
│   ├── page.js                # Homepage
│   ├── [category]/page.js     # Category pages (lore/news/events)
│   ├── post/[id]/page.js      # Individual post page
│   ├── contact/page.js        # Contact form
│   ├── admin/
│   │   ├── login/page.js      # Admin login
│   │   ├── dashboard/page.js  # Admin dashboard
│   │   └── post/              # Post create/edit pages
│   └── api/
│       ├── contact/route.js   # Contact form API
│       └── admin/             # Admin API routes
├── lib/
│   ├── database.js            # PostgreSQL utilities
│   └── auth.js                # Authentication helpers
├── public/css/
│   ├── style.css              # Main newspaper theme
│   └── admin.css              # Admin panel styling
├── middleware.js              # Route protection
└── .env.local                 # Environment variables
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL database (local or Neon)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/MicuBogdan/breadcrumb-gazette.git
   cd breadcrumb-gazette
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   
   Create `.env.local` file:
   ```env
   DATABASE_URL=postgresql://user:password@host:5432/database
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=your-secure-password
   SESSION_SECRET=generate-a-random-32-char-string
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```

5. **Open browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📦 Database Setup

The database schema is automatically created on first run:

- **admin** - Admin user credentials
- **posts** - Blog posts with title, category, content, image
- **contacts** - Contact form submissions

Initial admin user is created from environment variables.

## 🔐 Admin Access

1. Navigate to `/admin/login`
2. Use credentials from `.env.local`
3. Manage posts and view contact messages

## 🌐 Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed Vercel deployment instructions.

**Quick Deploy:**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/MicuBogdan/breadcrumb-gazette)

## 🎨 Customization

### Colors

Edit CSS variables in `public/css/style.css`:

```css
:root {
  --primary: #8b7355;    /* Dark brown */
  --secondary: #d4af8f;  /* Light brown */
  --accent: #3d2817;     /* Dark accent */
  --paper: #d9cdb8;      /* Sepia background */
}
```

### Content

- **Categories**: Modify in `app/[category]/page.js`
- **Navigation**: Update in each page's navbar
- **Footer**: Change in layout components

## 📸 Screenshots

### Homepage
Vintage newspaper layout with latest posts

### Admin Dashboard
Manage all posts and contact messages

### Post Editor
Rich HTML content support with image URLs

## 🤝 Contributing

Contributions welcome! Please open an issue or submit a pull request.

## 📄 License

MIT License - feel free to use for your own Minecraft server!

## 👨‍💻 Author

**@micubogdan** - [micubogdan.dev](https://micubogdan.dev)

---

Built with ❤️ for the Minecraft community
