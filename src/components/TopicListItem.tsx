'use client';

import { CheckCircle, Bookmark, BookmarkCheck, Clock, Code } from 'lucide-react';
import type { ITopicList } from '@/types/topic';
import TopicDifficulty from '@/components/TopicDifficulty';
import { Complexity } from '@/components/Complexity';

interface TopicListItemProps {
  topic: ITopicList;
  isActive: boolean;
  onClick: () => void;
}

export function TopicListItem({ topic, isActive, onClick }: TopicListItemProps) {
  return (
    <div className={`topic-list-item m-2 ${isActive ? 'active' : ''}`} onClick={onClick}>
      <div className="mb-2 flex items-start justify-between gap-2">
        <h3 className="line-clamp-2 flex-1 text-sm font-medium leading-tight text-foreground">
          {topic.title}
        </h3>
        <div className="flex flex-shrink-0 items-center space-x-1">
          {topic.isCompleted && <CheckCircle className="h-4 w-4 text-success" />}
          {topic.isBookmarked ? (
            <BookmarkCheck className="h-4 w-4 text-primary" />
          ) : (
            <Bookmark className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <TopicDifficulty difficulty={topic.difficulty} />
        {(topic.timeComplexity || topic.spaceComplexity) && (
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            {topic.timeComplexity && (
              <span className="flex items-center">
                <Clock className="mr-1 h-3 w-3" />
                {Complexity(topic.timeComplexity)}
              </span>
            )}
            {topic.spaceComplexity && (
              <span className="flex items-center">
                <Code className="mr-1 h-3 w-3" />
                {Complexity(topic.spaceComplexity)}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default TopicListItem;
