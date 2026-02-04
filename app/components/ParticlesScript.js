'use client';

import { useEffect } from 'react';

export default function ParticlesScript() {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = '/js/particles.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return null;
}
