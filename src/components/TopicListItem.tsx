import { CheckCircle, Bookmark, BookmarkCheck, Clock, Code } from "lucide-react";
import type { ITopicList } from "@/types/topic";
import TopicDifficulty from "@/components/TopicDifficulty";

interface TopicListItemProps {
  topic: ITopicList;
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

      <div className="flex items-center justify-between">
        <TopicDifficulty difficulty={topic.difficulty} />
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


