import './globals.css';
import '../public/css/style.css';
import '../public/css/admin.css';

export const metadata = {
  title: 'The Breadcrumb Gazette',
  description: 'Minecraft server news, lore, and events',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
