import './globals.css';
import '../public/css/style.css';
import '../public/css/admin.css';
import ParticlesScript from './components/ParticlesScript';
import { Analytics } from '@vercel/analytics/next';

export const metadata = {
  title: 'The Breadcrumb Gazette',
  description: 'Minecraft server news, lore, and events',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <ParticlesScript />
        <script src="/js/mobile-navbar.js" defer></script>
        <Analytics />
      </body>
    </html>
  );
}
