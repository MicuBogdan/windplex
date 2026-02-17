'use client';

import { useEffect, useRef, useState } from 'react';

export default function ScrollingNavbar({ children }) {
  const navbarRef = useRef(null);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if we're on mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    const handleScroll = () => {
      if (!isMobile) {
        // Desktop: always show navbar
        setIsVisible(true);
        setLastScrollY(window.scrollY);
        return;
      }

      // Mobile: hide on scroll down, show on scroll up
      const currentScrollY = window.scrollY;
      
      // Small scroll threshold to avoid flickering
      if (currentScrollY > lastScrollY + 10) {
        // Scrolling down
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY - 10) {
        // Scrolling up
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', checkMobile);
    };
  }, [lastScrollY, isMobile]);

  return (
    <nav 
      ref={navbarRef}
      className="navbar"
      style={{
        transform: isVisible ? 'translateY(0)' : 'translateY(-100%)',
        transition: 'transform 0.3s ease-in-out'
      }}
    >
      {children}
    </nav>
  );
}
