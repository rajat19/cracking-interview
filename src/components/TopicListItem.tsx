'use client';

import { CheckCircle, Bookmark, BookmarkCheck, Clock, Code } from 'lucide-react';
import type { ITopicList } from '@/types/topic';
import TopicDifficulty from '@/components/TopicDifficulty';
import { formatComplexity } from '@/lib/complexityFormatter';

interface TopicListItemProps {
  topic: ITopicList;
  isActive: boolean;
  onClick: () => void;
}

export function TopicListItem({ topic, isActive, onClick }: TopicListItemProps) {
  return (
    <div className={`topic-list-item m-2 ${isActive ? 'active' : ''}`} onClick={onClick}>
      <div className="mb-2 flex items-start justify-between">
        <h3 className="text-sm font-medium leading-tight text-foreground">{topic.title}</h3>
        <div className="ml-2 flex items-center space-x-1">
          {topic.isCompleted && <CheckCircle className="h-4 w-4 text-success" />}
          {topic.isBookmarked ? (
            <BookmarkCheck className="h-4 w-4 text-primary" />
          ) : (
            <Bookmark className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <TopicDifficulty difficulty={topic.difficulty} />
        {(topic.timeComplexity || topic.spaceComplexity) && (
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            {topic.timeComplexity && (
              <span className="flex items-center">
                <Clock className="mr-1 h-3 w-3" />
                {formatComplexity(topic.timeComplexity)}
              </span>
            )}
            {topic.spaceComplexity && (
              <span className="flex items-center">
                <Code className="mr-1 h-3 w-3" />
                {formatComplexity(topic.spaceComplexity)}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default TopicListItem;
