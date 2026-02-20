'use client';

import { useEffect } from 'react';

export default function ImageModal({ imageUrl, onClose }) {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <div className="image-modal-overlay" onClick={onClose}>
      <div className="image-modal-container" onClick={(e) => e.stopPropagation()}>
        <img src={imageUrl} alt="Fullscreen" className="image-modal-img" />
        <button className="image-modal-close" onClick={onClose}>✕</button>
      </div>
    </div>
  );
}
