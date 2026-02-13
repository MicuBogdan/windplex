'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function WikiLogout() {
  const router = useRouter();

  useEffect(() => {
    const runLogout = async () => {
      await fetch('/api/wiki/auth/logout', { method: 'POST' });
      router.push('/wiki');
    };
    runLogout();
  }, [router]);

  return (
    <div className="main-content" style={{ textAlign: 'center', padding: '3rem' }}>
      Logging out...
    </div>
  );
}
