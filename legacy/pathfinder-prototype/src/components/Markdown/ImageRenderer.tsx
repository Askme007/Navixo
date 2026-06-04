/**
 * ImageRenderer Component
 * Images with click-to-open modal and captions
 */

import React, { useState } from 'react';
import { X } from 'lucide-react';
import styles from './ImageRenderer.module.css';

interface ImageRendererProps {
  src?: string;
  alt?: string;
  title?: string;
}

export function ImageRenderer({ src, alt, title }: ImageRendererProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!src) return null;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsModalOpen(true);
    }
  };

  const handleModalKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsModalOpen(false);
    }
  };

  return (
    <>
      <div className={styles['image-container']}>
        <img
          src={src}
          alt={alt || ''}
          className={styles.image}
          onClick={() => setIsModalOpen(true)}
          onKeyDown={handleKeyDown}
          role="button"
          tabIndex={0}
        />
        {(alt || title) && (
          <p className={styles['image-caption']}>
            {title || alt}
          </p>
        )}
      </div>

      {isModalOpen && (
        <div
          className={styles['modal-overlay']}
          onClick={() => setIsModalOpen(false)}
          onKeyDown={handleModalKeyDown}
          role="dialog"
          aria-modal="true"
          tabIndex={-1}
        >
          <div
            className={styles['modal-content']}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className={styles['modal-close']}
              onClick={() => setIsModalOpen(false)}
              aria-label="Close modal"
              type="button"
            >
              <X style={{ width: '22px', height: '22px' }} />
            </button>
            <img
              src={src}
              alt={alt || ''}
              className={styles['modal-image']}
            />
            {(alt || title) && (
              <p className={styles['modal-caption']}>
                {title || alt}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
