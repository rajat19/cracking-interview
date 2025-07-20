import { useState } from "react";
import { CheckCircle, Circle, Bookmark, BookmarkCheck, Clock, Code } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Topic } from "@/types";

interface TopicContentProps {
  topic: Topic;
}

export function TopicContent({ topic }: TopicContentProps) {
  const [isCompleted, setIsCompleted] = useState(topic.isCompleted || false);
  const [isBookmarked, setIsBookmarked] = useState(topic.isBookmarked || false);

  const toggleComplete = () => {
    setIsCompleted(!isCompleted);
    // In a real app, this would update the backend
  };

  const toggleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    // In a real app, this would update the backend
  };

  const formatContent = (content: string) => {
    // Simple markdown-like formatting
    return content
      .replace(/^# (.*$)/gm, '<h1 class="text-3xl font-bold mb-6 text-foreground">$1</h1>')
      .replace(/^## (.*$)/gm, '<h2 class="text-2xl font-semibold mb-4 mt-8 text-foreground">$1</h2>')
      .replace(/^### (.*$)/gm, '<h3 class="text-xl font-medium mb-3 mt-6 text-foreground">$1</h3>')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-foreground">$1</strong>')
      .replace(/`([^`]+)`/g, '<code class="bg-muted px-2 py-1 rounded text-sm font-mono">$1</code>')
      .replace(/```([\\s\\S]*?)```/g, '<pre class="bg-muted p-4 rounded-lg overflow-x-auto my-4"><code class="text-sm font-mono">$1</code></pre>')
      .replace(/^- (.*$)/gm, '<li class="ml-4 mb-1">• $1</li>')
      .replace(/^\\d+\\. (.*$)/gm, '<li class="ml-4 mb-1">$1</li>')
      .replace(/\\n/g, '<br />');
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <h1 className="text-3xl font-bold text-foreground">{topic.title}</h1>
            <Badge 
              variant="secondary" 
              className={`difficulty-${topic.difficulty}`}
            >
              {topic.difficulty}
            </Badge>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleBookmark}
              className={isBookmarked ? "text-primary border-primary" : ""}
            >
              {isBookmarked ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
            </Button>
            <Button
              variant={isCompleted ? "default" : "outline"}
              size="sm"
              onClick={toggleComplete}
              className={isCompleted ? "bg-success hover:bg-success/80" : ""}
            >
              {isCompleted ? <CheckCircle className="w-4 h-4 mr-2" /> : <Circle className="w-4 h-4 mr-2" />}
              {isCompleted ? "Completed" : "Mark Complete"}
            </Button>
          </div>
        </div>

        <p className="text-lg text-muted-foreground mb-6">{topic.description}</p>

        {/* Complexity Info */}
        {(topic.timeComplexity || topic.spaceComplexity) && (
          <div className="flex items-center space-x-6 p-4 bg-card rounded-lg border border-border">
            {topic.timeComplexity && (
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-primary" />
                <span className="text-sm">
                  <strong>Time:</strong> {topic.timeComplexity}
                </span>
              </div>
            )}
            {topic.spaceComplexity && (
              <div className="flex items-center space-x-2">
                <Code className="w-4 h-4 text-primary" />
                <span className="text-sm">
                  <strong>Space:</strong> {topic.spaceComplexity}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="prose prose-invert max-w-none">
        <div 
          dangerouslySetInnerHTML={{ 
            __html: formatContent(topic.content) 
          }}
          className="text-muted-foreground leading-relaxed"
        />
      </div>

      {/* Examples */}
      {topic.examples && topic.examples.length > 0 && (
        <div className="mt-8">
          <h3 className="text-xl font-medium mb-4 text-foreground">Examples</h3>
          <div className="space-y-4">
            {topic.examples.map((example, index) => (
              <div key={index} className="p-4 bg-card rounded-lg border border-border">
                <pre className="text-sm font-mono text-muted-foreground whitespace-pre-wrap">
                  {example}
                </pre>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Related Topics */}
      {topic.relatedTopics && topic.relatedTopics.length > 0 && (
        <div className="mt-8">
          <h3 className="text-xl font-medium mb-4 text-foreground">Related Topics</h3>
          <div className="flex flex-wrap gap-2">
            {topic.relatedTopics.map((relatedTopic, index) => (
              <Badge key={index} variant="outline" className="cursor-pointer hover:bg-muted">
                {relatedTopic}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}