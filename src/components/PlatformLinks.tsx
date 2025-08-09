import React from 'react';
import { ExternalLink } from 'lucide-react';
import { Topic } from '@/types';

interface Platform {
  name: string;
  base: string;
  suffix: string;
  identifier: string;
  img: string;
}

const PLATFORMS: Platform[] = [
  {
    name: 'Leetcode',
    base: 'https://leetcode.com/problems/',
    suffix: '/',
    identifier: 'leetcode',
    img: 'leetcode.svg'
  },
  {
    name: 'GeeksForGeeks',
    base: 'https://www.geeksforgeeks.org/',
    suffix: '/',
    identifier: 'gfg',
    img: 'gfg.svg'
  },
  {
    name: 'InterviewBit',
    base: 'https://www.interviewbit.com/problems/',
    suffix: '/',
    identifier: 'interviewbit',
    img: 'interviewbit.svg'
  },
  {
    name: 'Hackerrank',
    base: 'https://www.hackerrank.com/challenges/',
    suffix: '/problem',
    identifier: 'hackerrank',
    img: 'hackerrank.svg'
  }
];

interface PlatformLinksProps {
  topic: Topic;
}

export const PlatformLinks: React.FC<PlatformLinksProps> = ({ topic }) => {
  // Get available platforms for this topic
  const availablePlatforms = PLATFORMS.filter(platform => {
    const identifier = platform.identifier as keyof Topic;
    return topic[identifier] && typeof topic[identifier] === 'string';
  });

  if (availablePlatforms.length === 0) {
    return null;
  }

  return (
    <div className="my-6 lg:my-8">
      <h3 className="text-lg lg:text-xl font-medium mb-1 text-foreground">Practice on Platforms</h3>
      {/* Additional info */}
      <p className="text-xs text-muted-foreground mb-3">
        Click on any platform to view this problem on their website
      </p>
      <div className="flex flex-wrap gap-2 lg:gap-3">
        {availablePlatforms.map((platform) => {
          const identifier = platform.identifier as keyof Topic;
          const problemId = topic[identifier] as string;
          const url = `${platform.base}${problemId}${platform.suffix}`;
          
          return (
            <a
              key={platform.identifier}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 lg:px-4 py-2 bg-card border border-border rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors duration-200 group min-w-0"
            >
              <div className="flex items-center gap-2 min-w-0">
                <img 
                  src={`${import.meta.env.BASE_URL}assets/img/platform/${platform.img}`} 
                  alt={platform.name}
                  className="w-4 h-4 lg:w-5 lg:h-5 flex-shrink-0"
                  onError={(e) => {
                    // Fallback if image doesn't exist
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
                <span className="font-medium text-xs lg:text-sm truncate">{platform.name}</span>
                <ExternalLink className="w-3 h-3 lg:w-4 lg:h-4 opacity-60 group-hover:opacity-100 transition-opacity flex-shrink-0" />
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
};
