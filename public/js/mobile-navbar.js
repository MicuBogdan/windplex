// Mobile navbar scroll behavior
(function() {
  if (typeof window === 'undefined') return;
  
  // Wait for DOM to be ready
  const init = () => {
    if (window.innerWidth > 768) return; // Only on mobile
    
    let lastScrollY = 0;
    const navbar = document.querySelector('.navbar');
    
    if (!navbar) return;
    
    try {
      navbar.style.position = 'fixed';
      navbar.style.top = '0';
      navbar.style.left = '0';
      navbar.style.right = '0';
      navbar.style.zIndex = '100';

      const handleScroll = () => {
        const currentScrollY = window.scrollY;
        
        if (currentScrollY > lastScrollY + 10) {
          // Scrolling down - hide navbar
          navbar.style.transform = 'translateY(-100%)';
        } else if (currentScrollY < lastScrollY - 10) {
          // Scrolling up - show navbar
          navbar.style.transform = 'translateY(0)';
        }
        
        lastScrollY = currentScrollY;
      };

      window.addEventListener('scroll', handleScroll, { passive: true });
    } catch (e) {
      console.error('Mobile navbar error:', e);
    }
  };
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
