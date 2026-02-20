'use client';

import { useState } from 'react';
import ImageModal from '@/app/components/ImageModal';

export default function WikiGallerySection({ gallery, featuredImage, title }) {
  const [fullscreenImage, setFullscreenImage] = useState(null);

  return (
    <>
      {featuredImage && (
        <div className="post-featured-image">
          <img
            src={featuredImage}
            alt={title}
            onClick={() => setFullscreenImage(featuredImage)}
          />
        </div>
      )}

      {gallery.length > 0 && (
        <section className="wiki-gallery-section">
          <h2>📷 Gallery</h2>
          <div className="wiki-gallery-grid">
            {gallery.map((image) => (
              <figure key={image.id} className="gallery-item">
                <img
                  src={image.image_url}
                  alt={image.caption || 'Gallery image'}
                  onClick={() => setFullscreenImage(image.image_url)}
                />
                {image.caption && <figcaption>{image.caption}</figcaption>}
              </figure>
            ))}
          </div>
        </section>
      )}

      {fullscreenImage && (
        <ImageModal imageUrl={fullscreenImage} onClose={() => setFullscreenImage(null)} />
      )}
    </>
  );
}
