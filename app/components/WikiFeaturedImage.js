'use client';

import { useState } from 'react';
import ImageModal from '@/app/components/ImageModal';

export default function WikiFeaturedImage({ imageUrl, title }) {
  const [fullscreenImage, setFullscreenImage] = useState(null);

  if (!imageUrl) return null;

  return (
    <>
      <div className="post-featured-image">
        <img
          src={imageUrl}
          alt={title}
          onClick={() => setFullscreenImage(imageUrl)}
        />
      </div>
      {fullscreenImage && (
        <ImageModal imageUrl={fullscreenImage} onClose={() => setFullscreenImage(null)} />
      )}
    </>
  );
}
