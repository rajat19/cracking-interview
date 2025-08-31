'use client';

import React from 'react';
import { ExternalLink } from 'lucide-react';
import { ITopic } from '@/types/topic';
import Image from 'next/image';
import PLATFORMS from '@/config/platform';

interface PlatformLinksProps {
  topic: ITopic;
}

const PlatformLink = ({
  platform,
  topic,
}: {
  platform: (typeof PLATFORMS)[number];
  topic: ITopic;
}) => {
  const identifier = platform.identifier as keyof ITopic;
  const problemId = topic[identifier] as string;
  const url = `${platform.base}${problemId}${platform.suffix}`;

  return (
    <a
      key={platform.identifier}
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="group inline-flex min-w-0 items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 transition-colors duration-200 hover:bg-accent hover:text-accent-foreground lg:px-4"
    >
      <div className="flex min-w-0 items-center gap-2">
        <Image
          src={`/assets/img/platform/${platform.img}`}
          alt={platform.name}
          width={20}
          height={20}
          className="h-4 w-4 flex-shrink-0 lg:h-5 lg:w-5"
          onError={e => {
            // Fallback if image doesn't exist
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
        <span className="truncate text-xs font-medium lg:text-sm">{platform.name}</span>
        <ExternalLink className="h-3 w-3 flex-shrink-0 opacity-60 transition-opacity group-hover:opacity-100 lg:h-4 lg:w-4" />
      </div>
    </a>
  );
};

export const PlatformLinks: React.FC<PlatformLinksProps> = ({ topic }) => {
  // Get available platforms for this topic
  const availablePlatforms = PLATFORMS.filter(platform => {
    const identifier = platform.identifier as keyof ITopic;
    return topic[identifier] && typeof topic[identifier] === 'string';
  });

  if (availablePlatforms.length === 0) {
    return null;
  }

  return (
    <div className="my-6 lg:my-8">
      <h3 className="mb-1 text-lg font-medium text-foreground lg:text-xl">Practice on Platforms</h3>
      {/* Additional info */}
      <p className="mb-3 text-xs text-muted-foreground">
        Click on any platform to view this problem on their website
      </p>
      <div className="flex flex-wrap gap-2 lg:gap-3">
        {availablePlatforms.map(platform => {
          return <PlatformLink key={platform.identifier} platform={platform} topic={topic} />;
        })}
      </div>
    </div>
  );
};
