import { useEffect, useState } from "react";
import { CheckCircle, Circle, Bookmark, BookmarkCheck, Clock, Code } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Topic } from "@/types";
import { updateLocalProgress } from "@/lib/contentLoader";
import type { TopicCategoryId } from "@/lib/contentLoader";
import MarkdownContent from '@/components/MarkdownContent';
import { SolutionTabs } from '@/components/SolutionTabs';
import { PlatformLinks } from '@/components/PlatformLinks';
import { useAuth } from '@/hooks/useAuth';
import { getUserProgress, upsertUserProgress } from '@/lib/progressStore';
import { useNavigate } from 'react-router-dom';

interface TopicContentProps {
  topic: Topic;
  category: TopicCategoryId;
  onProgressUpdate: () => Promise<void>;
}

export function TopicContent({ topic, category, onProgressUpdate }: TopicContentProps) {
  const [isCompleted, setIsCompleted] = useState(topic.isCompleted || false);
  const [isBookmarked, setIsBookmarked] = useState(topic.isBookmarked || false);
  const [activeLanguage, setActiveLanguage] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  const toggleComplete = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    const newCompleted = !isCompleted;
    setIsCompleted(newCompleted);
    await updateProgress(topic.id, { isCompleted: newCompleted });
  };

  const toggleBookmark = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    const newBookmarked = !isBookmarked;
    setIsBookmarked(newBookmarked);
    await updateProgress(topic.id, { isBookmarked: newBookmarked });
  };

  const updateProgress = async (questionId: string, updates: { isCompleted?: boolean; isBookmarked?: boolean }) => {
    try {
      if (user) {
        await upsertUserProgress(user.id, category, questionId, updates);
      } else {
        updateLocalProgress(category, questionId, updates);
      }
      onProgressUpdate();
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  // Initialize the default active solution language when topic changes
  useEffect(() => {
    if (topic.solutions && Object.keys(topic.solutions).length > 0) {
      const first = Object.values(topic.solutions)[0]?.language ?? null;
      setActiveLanguage(first);
    } else {
      setActiveLanguage(null);
    }
  }, [topic.id, topic.solutions]);

  // Load initial user progress if signed in
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!user) return;
      try {
        const doc = await getUserProgress(user.id, category, topic.id);
        if (!mounted || !doc) return;
        setIsCompleted(!!doc.is_completed);
        setIsBookmarked(!!doc.is_bookmarked);
      } catch (e) {
        // no-op
      }
    })();
    return () => {
      mounted = false;
    };
  }, [user, category, topic.id]);

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
    <div className="w-full p-4 lg:p-8 lg:max-w-4xl lg:mx-auto">
      {/* Header */}
      <div className="mb-6 lg:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">{topic.title}</h1>
            <Badge 
              variant="secondary" 
              className={`difficulty-${topic.difficulty} w-fit`}
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

      {/* Related Topics */}
      {topic.relatedTopics && topic.relatedTopics.length > 0 && (
        <div className="my-8">
          <h3 className="text-xl font-medium mb-4 text-foreground">Related Topics</h3>
          <div className="flex flex-wrap gap-2">
            {topic.relatedTopics.map((relatedTopic, index) => (
              <div key={index} className="badge badge-secondary p-4">{relatedTopic}</div>
            ))}
          </div>
        </div>
      )}

      {/* Companies */}
      {topic.companies && topic.companies.length > 0 && (
        <div className="my-6 lg:my-8">
          <h3 className="text-lg lg:text-xl font-medium mb-3 lg:mb-4 text-foreground">Companies</h3>
          <div className="flex flex-wrap gap-2">
            {topic.companies.map((company, index) => (
              <button className="btn bg-white text-black border-[#e5e5e5] text-xs lg:text-sm px-2 lg:px-3 py-1 lg:py-2" key={index}>
                <img src={`/src/assets/img/company/${company}.svg`} alt={company} className="w-3 h-3 lg:w-4 lg:h-4" />
                {company}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Platform Links */}
      <PlatformLinks topic={topic} />

      {/* Content */}
      <MarkdownContent content={topic.content} />

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

      {/* Solutions */}
      {topic.solutions && Object.keys(topic.solutions).length > 0 && (
        <SolutionTabs solutions={topic.solutions} />
      )}
    </div>
  );
}