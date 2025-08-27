"use client";

import React from 'react';
import { ExternalLink } from 'lucide-react';
import { ITopic } from '@/types/topic';

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
    img: 'hackerrank.svg',
  },
  {
    name: 'Youtube',
    base: 'https://www.youtube.com/results?search_query=',
    suffix: '',
    identifier: 'title',
    img: 'youtube.svg',
  },
  {
    name: 'Metacareers',
    base: 'https://www.metacareers.com/profile/coding_practice_question/?problem_id=',
    suffix: '',
    identifier: 'metacareers',
    img: 'meta.svg',
  },
  {
    name: 'HelloInterview',
    base: 'https://www.hellointerview.com/learn/',
    suffix: '',
    identifier: 'hellointerview',
    img: 'hellointerview.svg'
  }
];

interface PlatformLinksProps {
  topic: ITopic;
}

const PlatformLink = ({ platform, topic }: { platform: Platform, topic: ITopic }) => {
  const identifier = platform.identifier as keyof ITopic;
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
          src={`/assets/img/platform/${platform.img}`} 
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
      <h3 className="text-lg lg:text-xl font-medium mb-1 text-foreground">Practice on Platforms</h3>
      {/* Additional info */}
      <p className="text-xs text-muted-foreground mb-3">
        Click on any platform to view this problem on their website
      </p>
      <div className="flex flex-wrap gap-2 lg:gap-3">
        {availablePlatforms.map((platform) => {
          return (
            <PlatformLink key={platform.identifier} platform={platform} topic={topic} />
          );
        })}
      </div>
    </div>
  );
};
