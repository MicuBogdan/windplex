# The Breadcrumb Gazette - Deployment Guide

## 📋 Prerequisites

1. **Neon PostgreSQL Database**
   - Create account at https://neon.tech
   - Create a new project
   - Copy your database connection string (format: `postgresql://user:password@host/database?sslmode=require`)

2. **Vercel Account**
   - Create account at https://vercel.com
   - Install Vercel CLI: `npm i -g vercel` (optional)

3. **GitHub Repository**
   - Push your code to GitHub
   - Repository should be public or accessible to Vercel

---

## 🚀 Deployment Steps

### 1. Setup Neon Database

1. Go to https://neon.tech and create a new project
2. After creation, go to **Dashboard** → **Connection Details**
3. Copy the **connection string** (looks like: `postgresql://username:password@hostname.neon.tech/database?sslmode=require`)
4. Keep this for the next step

### 2. Push to GitHub

```bash
cd /home/micu/Desktop/breadcrumb-gazette

# Initialize git (if not already)
git init

# Add all files
git add .

# Commit
git commit -m "Next.js version of The Breadcrumb Gazette"

# Add remote (replace with your repo)
git remote add origin https://github.com/MicuBogdan/breadcrumb-gazette.git

# Push
git push -u origin main
```

### 3. Deploy to Vercel

**Option A: Via Vercel Dashboard (Recommended)**

1. Go to https://vercel.com/new
2. Click **Import Git Repository**
3. Select your GitHub repository (`breadcrumb-gazette`)
4. Configure project:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)
5. Add **Environment Variables**:
   ```
   DATABASE_URL = postgresql://username:password@hostname.neon.tech/database?sslmode=require
   ADMIN_USERNAME = admin
   ADMIN_PASSWORD = your-secure-password-here
   SESSION_SECRET = generate-random-32-char-string
   ```
   _(Use this command to generate SESSION_SECRET: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")`_
6. Click **Deploy**
7. Wait 1-2 minutes for build to complete

**Option B: Via Vercel CLI**

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Follow prompts and add environment variables when asked
```

### 4. Configure Custom Domain (Optional)

1. Go to your project in Vercel Dashboard
2. Navigate to **Settings** → **Domains**
3. Add your domain (e.g., `breadcrumb.example.com`)
4. Follow DNS configuration instructions

---

## 🔐 Environment Variables

Make sure these are set in Vercel:

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | Neon PostgreSQL connection string | `postgresql://user:pass@host.neon.tech/db` |
| `ADMIN_USERNAME` | Admin panel username | `admin` |
| `ADMIN_PASSWORD` | Admin panel password (strong!) | `MySecurePass123!` |
| `SESSION_SECRET` | Random 32-char string for sessions | Generated via crypto |

---

## ✅ Post-Deployment Checklist

After deployment:

1. **Visit your site**: `https://your-project.vercel.app`
2. **Test homepage**: Should show "The Breadcrumb Gazette"
3. **Test navigation**: Click Lore, News, Events links
4. **Test admin login**: Go to `/admin/login` and login
5. **Create a test post**: In admin dashboard, create a new post
6. **Test contact form**: Submit a message via contact page
7. **Verify database**: Check admin dashboard for posts/messages

---

## 🐛 Troubleshooting

### Database Connection Errors

- Verify `DATABASE_URL` is correct in Vercel environment variables
- Make sure Neon database is active (auto-sleeps after inactivity)
- Check Neon dashboard for connection limits

### Build Failures

- Check Vercel build logs for specific errors
- Ensure all dependencies in `package.json`
- Verify Node.js version compatibility (v18+ recommended)

### Admin Login Not Working

- Verify `ADMIN_USERNAME` and `ADMIN_PASSWORD` are set in Vercel
- Check browser console for API errors
- Ensure cookies are enabled

### CSS Not Loading

- Clear browser cache
- Check Vercel deployment logs for static asset errors
- Next.js automatically handles CSS in public folder

---

## 📊 Free Tier Limits

**Neon PostgreSQL:**
- 100 compute hours/month
- 5 GB transfer/month
- 512 MB storage

**Vercel:**
- 100 GB bandwidth/month
- Unlimited deployments
- Automatic HTTPS
- Custom domains supported

---

## 🔄 Updating the Site

To deploy changes:

```bash
# Make your changes locally
# Test with: npm run dev

# Commit and push
git add .
git commit -m "Your update message"
git push

# Vercel auto-deploys on push!
```

---

## 📝 Admin Panel Access

- **URL**: `https://your-site.vercel.app/admin/login`
- **Username**: Set via `ADMIN_USERNAME` env var
- **Password**: Set via `ADMIN_PASSWORD` env var

---

## 🎨 Customization

All CSS is in:
- `/public/css/style.css` - Main newspaper theme
- `/public/css/admin.css` - Admin panel styling

Colors defined as CSS variables in `style.css`:
```css
--primary: #8b7355
--secondary: #d4af8f
--accent: #3d2817
--paper: #d9cdb8
```

---

## 💡 Tips

- Regular backups: Export Neon database periodically
- Monitor usage: Check Neon/Vercel dashboards for limits
- Security: Use strong admin password
- Images: Host images on Imgur or Cloudinary for free CDN
- Performance: Neon auto-scales based on usage

---

Built with ❤️ using Next.js 14 + PostgreSQL
