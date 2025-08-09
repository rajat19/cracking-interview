import { useState, useMemo, useEffect, useCallback } from "react";
import { Search, BookOpen } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Topic } from "@/types";
import { TopicContent } from "@/components/TopicContent";
import { useAuth } from "@/hooks/useAuth";
import { loadTopics, getLocalProgress } from "@/lib/contentLoader";
import { preloadUserProgress, getCachedCategoryProgress } from "@/lib/progressStore";
import type { TopicCategoryId } from "@/lib/contentLoader";
import Navigation from "@/components/Navigation";
import TopicListItem from "@/components/TopicListItem";

interface DocsLayoutProps {
  title: string;
  description: string;
  category: TopicCategoryId;
}

export function DocsLayout({ title, description, category }: DocsLayoutProps) {
  const { user } = useAuth();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [userProgress, setUserProgress] = useState<Record<string, { is_completed: boolean; is_bookmarked: boolean }>>({});
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  const fetchQuestions = useCallback(async (): Promise<void> => {
    try {
      const loaded = await loadTopics(category as 'dsa' | 'system-design' | 'behavioral');
      setTopics(loaded);
      if (loaded.length > 0) {
        setSelectedTopic(prev => prev ?? loaded[0]);
      }
    } catch (error) {
      console.error('Error loading topics:', error);
    } finally {
      setLoading(false);
    }
  }, [category]);

  const fetchUserProgress = useCallback(async (): Promise<void> => {
    if (user) {
      const cached = getCachedCategoryProgress(user.id, category as 'dsa' | 'system-design' | 'behavioral');
      if (Object.keys(cached).length > 0) {
        setUserProgress(cached);
      } else {
        const loaded = await preloadUserProgress(user.id, category as 'dsa' | 'system-design' | 'behavioral');
        setUserProgress(loaded);
      }
    } else {
      const progress = getLocalProgress(category as 'dsa' | 'system-design' | 'behavioral');
      setUserProgress(progress);
    }
  }, [category, user?.id]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  useEffect(() => {
    if (topics.length > 0) {
      fetchUserProgress();
    }
  }, [topics, fetchUserProgress]);

  const getTableName = (_category: string) => 'local';

  const topicsWithProgress = useMemo(() => {
    return topics.map(topic => ({
      ...topic,
      isCompleted: userProgress[topic.id]?.is_completed || false,
      isBookmarked: userProgress[topic.id]?.is_bookmarked || false
    }));
  }, [topics, userProgress]);

  const filteredTopics = useMemo(() => {
    return topicsWithProgress.filter(topic => {
      const matchesSearch = topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          topic.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDifficulty = difficultyFilter === "all" || topic.difficulty === difficultyFilter;
      return matchesSearch && matchesDifficulty;
    });
  }, [topicsWithProgress, searchQuery, difficultyFilter]);

  const completedCount = topicsWithProgress.filter(t => t.isCompleted).length;
  const progressPercentage = topicsWithProgress.length > 0 ? Math.round((completedCount / topicsWithProgress.length) * 100) : 0;

  if (loading) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">Loading questions...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navigation />
      <div className="h-[calc(100vh-64px)] bg-background flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-80 border-r border-border bg-card/30 backdrop-blur-sm flex flex-col h-full overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-border">
          
          <h1 className="text-2xl font-bold text-foreground mb-2">{title}</h1>
          <p className="text-sm text-muted-foreground mb-4">{description}</p>
          
          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="text-foreground font-medium">{completedCount}/{topicsWithProgress.length}</span>
            </div>
            <div className="progress-indicator">
              <div 
                className="progress-fill" 
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="p-4 border-b border-border space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2">
            <Button
              variant={difficultyFilter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setDifficultyFilter("all")}
            >
              All
            </Button>
            <Button
              variant={difficultyFilter === "easy" ? "default" : "outline"}
              size="sm"
              onClick={() => setDifficultyFilter("easy")}
              className="difficulty-easy"
            >
              Easy
            </Button>
            <Button
              variant={difficultyFilter === "medium" ? "default" : "outline"}
              size="sm"
              onClick={() => setDifficultyFilter("medium")}
              className="difficulty-medium"
            >
              Medium
            </Button>
            <Button
              variant={difficultyFilter === "hard" ? "default" : "outline"}
              size="sm"
              onClick={() => setDifficultyFilter("hard")}
              className="difficulty-hard"
            >
              Hard
            </Button>
          </div>
        </div>

        {/* Topics List */}
        <div className="flex-1 overflow-y-auto">
          {filteredTopics.map((topic) => (
            <TopicListItem
              key={topic.id}
              topic={topic}
              isActive={selectedTopic?.id === topic.id}
              onClick={() => setSelectedTopic(topic)}
            />
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Bar */}
        <div className="border-b border-border bg-card/30 backdrop-blur-sm p-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <h2 className="font-semibold text-foreground">
              {selectedTopic?.title || "Select a topic"}
            </h2>
            {selectedTopic && (
              <Badge 
                variant="secondary" 
                className={`difficulty-${selectedTopic.difficulty}`}
              >
                {selectedTopic.difficulty}
              </Badge>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto page-transition">
          {selectedTopic ? (
            <TopicContent 
              topic={selectedTopic} 
              category={category}
              onProgressUpdate={fetchUserProgress}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">Select a topic to get started</h3>
                <p>Choose from the topics in the sidebar to begin your learning journey.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  );
}