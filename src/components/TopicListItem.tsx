import React from "react";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Bookmark, BookmarkCheck, Clock, Code } from "lucide-react";
import type { Topic } from "@/types";

interface TopicListItemProps {
  topic: Topic;
  isActive: boolean;
  onClick: () => void;
}

export function TopicListItem({ topic, isActive, onClick }: TopicListItemProps) {
  return (
    <div
      className={`topic-list-item m-2 ${isActive ? "active" : ""}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-medium text-foreground text-sm leading-tight">
          {topic.title}
        </h3>
        <div className="flex items-center space-x-1 ml-2">
          {topic.isCompleted && <CheckCircle className="w-4 h-4 text-success" />}
          {topic.isBookmarked ? (
            <BookmarkCheck className="w-4 h-4 text-primary" />
          ) : (
            <Bookmark className="w-4 h-4 text-muted-foreground" />
          )}
        </div>
      </div>

      <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
        {topic.description}
      </p>

      <div className="flex items-center justify-between">
        <Badge variant="secondary" className={`text-xs difficulty-${topic.difficulty}`}>
          {topic.difficulty}
        </Badge>
        {(topic.timeComplexity || topic.spaceComplexity) && (
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            {topic.timeComplexity && (
              <span className="flex items-center">
                <Clock className="w-3 h-3 mr-1" />
                {topic.timeComplexity}
              </span>
            )}
            {topic.spaceComplexity && (
              <span className="flex items-center">
                <Code className="w-3 h-3 mr-1" />
                {topic.spaceComplexity}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default TopicListItem;


