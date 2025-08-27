"use client";

import { useState } from 'react';

interface MdxImageProps {
  src: string;
  alt: string;
}

export function MdxImage({ src, alt }: MdxImageProps) {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Construct the full image path (Next.js serves public files from /assets)
  const imagePath = `/assets/img/${src}`;
  
  const handleImageLoad = () => {
    setIsLoading(false);
  };
  
  const handleImageError = () => {
    setImageError(true);
    setIsLoading(false);
  };
  
  if (imageError) {
    return (
      <div className="my-6 p-4 border border-destructive/20 rounded-lg bg-destructive/5">
        <p className="text-destructive text-sm">
          Failed to load image: <code className="bg-destructive/10 px-1 rounded">{src}</code>
        </p>
        <p className="text-muted-foreground text-xs mt-1">
          Expected path: <code className="bg-muted px-1 rounded">{imagePath}</code>
        </p>
      </div>
    );
  }
  
  return (
    <figure className="my-8">
      <div className="relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted/20 rounded-lg">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        )}
        <img
          src={imagePath}
          alt={alt}
          className="max-w-full h-auto rounded-lg border border-border shadow-sm mx-auto"
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
      </div>
    </figure>
  );
}
