'use client';

import { useState } from 'react';
import Image from 'next/image';
import Zoom from 'react-medium-image-zoom';
import 'react-medium-image-zoom/dist/styles.css';
import assetPath from '@/lib/assetPath';

interface MdxImageProps {
  src: string;
  alt: string;
}

export function MdxImage({ src, alt }: MdxImageProps) {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const imageSrc = /^(https?:)?\/\//.test(src) ? src : assetPath(`/assets/img/${src}`);

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setIsLoading(false);
  };

  if (imageError) {
    return (
      <div className="my-6 rounded-lg border border-destructive/20 bg-destructive/5 p-4">
        <p className="text-sm text-destructive">
          Failed to load image: <code className="rounded bg-destructive/10 px-1">{src}</code>
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Expected path: <code className="rounded bg-muted px-1">/assets/img/{src}</code>
        </p>
      </div>
    );
  }

  return (
    <figure className="my-8">
      <div className="relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-muted/20">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
          </div>
        )}
        <Zoom>
          <Image
            src={imageSrc}
            alt={alt ?? 'Image'}
            width={400}
            height={300}
            className="mx-auto h-auto max-w-full rounded-lg border border-border shadow-sm"
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        </Zoom>
      </div>
    </figure>
  );
}
