import { useState, useMemo, useEffect, useCallback } from "react";
import { Search, BookOpen, Menu, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Topic } from "@/types";
import { TopicContent } from "@/components/TopicContent";
import { useAuth } from "@/hooks/useAuth";
import { loadTopicsList, loadTopic, getLocalProgress } from "@/lib/contentLoader";
import { preloadUserProgress, getCachedCategoryProgress } from "@/lib/progressStore";
import type { TopicCategoryId } from "@/lib/contentLoader";
import Navigation from "@/components/Navigation";
import TopicListItem from "@/components/TopicListItem";
import TopicDifficulty from "@/components/TopicDifficulty";

interface DocsLayoutProps {
  title: string;
  description: string;
  category: TopicCategoryId;
}

export function DocsLayout({ title, description, category }: DocsLayoutProps) {
  const { user } = useAuth();
  const [topics, setTopics] = useState<Omit<Topic, 'content' | 'solutions'>[]>([]);
  const [userProgress, setUserProgress] = useState<Record<string, { is_completed: boolean; is_bookmarked: boolean }>>({});
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [loadingTopic, setLoadingTopic] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const fetchQuestions = useCallback(async (): Promise<void> => {
    try {
      // Load only topic metadata initially for faster loading
      const loaded = await loadTopicsList(category as 'dsa' | 'system-design' | 'behavioral');
      setTopics(loaded);
      // Do not auto-load the first topic to keep initial load light
    } catch (error) {
      console.error('Error loading topics:', error);
    } finally {
      setLoading(false);
    }
  }, [category]);

  const loadFullTopic = useCallback(async (topicId: string): Promise<void> => {
    setLoadingTopic(true);
    try {
      const fullTopic = await loadTopic(category as 'dsa' | 'system-design' | 'behavioral', topicId);
      if (fullTopic) {
        setSelectedTopic(fullTopic);
      }
    } catch (error) {
      console.error('Error loading topic:', error);
    } finally {
      setLoadingTopic(false);
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
  }, [category, user]);

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

  const handleTopicSelect = useCallback(async (topic: Omit<Topic, 'content' | 'solutions'>) => {
    if (selectedTopic?.id === topic.id) return;
    await loadFullTopic(topic.id);
    // Close sidebar on mobile after selection
    setSidebarOpen(false);
  }, [selectedTopic?.id, loadFullTopic]);

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
      <div className="min-h-[calc(100vh-64px)] bg-background">
        {/* Mobile Layout */}
        <div className="lg:hidden">
          {/* Mobile Toggle */}
          <div className="sticky top-0 z-50 bg-background border-b border-border p-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="bg-background shadow-sm"
            >
              {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              <span className="ml-2 text-sm">{sidebarOpen ? 'Close' : 'Topics'}</span>
            </Button>
          </div>

          {/* Mobile Sidebar */}
          {sidebarOpen && (
            <>
              <div 
                className="fixed inset-0 bg-black/50 z-40"
                onClick={() => setSidebarOpen(false)}
              />
              <div className="fixed top-0 left-0 w-80 h-full bg-card border-r border-border z-50 flex flex-col overflow-hidden">
                <div className="p-4 border-b border-border">
                  <div className="flex items-center justify-between mb-4">
                    <h1 className="text-xl font-bold text-foreground">{title}</h1>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSidebarOpen(false)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">{description}</p>
                  
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
                <div className="p-3 border-b border-border space-y-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Search topics..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 text-sm"
                    />
                  </div>
                  
                  <div className="flex gap-1 flex-wrap">
                    <Button
                      variant={difficultyFilter === "all" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setDifficultyFilter("all")}
                      className="text-xs px-2"
                    >
                      All
                    </Button>
                    <Button
                      variant={difficultyFilter === "easy" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setDifficultyFilter("easy")}
                      className="difficulty-easy text-xs px-2"
                    >
                      Easy
                    </Button>
                    <Button
                      variant={difficultyFilter === "medium" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setDifficultyFilter("medium")}
                      className="difficulty-medium text-xs px-2"
                    >
                      Medium
                    </Button>
                    <Button
                      variant={difficultyFilter === "hard" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setDifficultyFilter("hard")}
                      className="difficulty-hard text-xs px-2"
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
                      onClick={() => handleTopicSelect(topic)}
                    />
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Mobile Content */}
          <div className="w-full">
            {loadingTopic ? (
              <div className="flex items-center justify-center h-64">
                <div className="flex flex-col items-center space-y-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <p className="text-muted-foreground">Loading topic...</p>
                </div>
              </div>
            ) : selectedTopic ? (
              <TopicContent 
                topic={selectedTopic} 
                category={category}
                onProgressUpdate={fetchUserProgress}
              />
            ) : (
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                <div className="text-center">
                  <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">Select a topic to get started</h3>
                  <p>Choose from the topics to begin your learning journey.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden lg:flex h-[calc(100vh-64px)] overflow-hidden">
          {/* Desktop Sidebar */}
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
        <div className="p-3 lg:p-4 border-b border-border space-y-2 lg:space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 text-sm"
            />
          </div>
          
          <div className="flex gap-1 lg:gap-2 flex-wrap">
            <Button
              variant={difficultyFilter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setDifficultyFilter("all")}
              className="text-xs px-2 lg:px-3"
            >
              All
            </Button>
            <Button
              variant={difficultyFilter === "easy" ? "default" : "outline"}
              size="sm"
              onClick={() => setDifficultyFilter("easy")}
              className="difficulty-easy text-xs px-2 lg:px-3"
            >
              Easy
            </Button>
            <Button
              variant={difficultyFilter === "medium" ? "default" : "outline"}
              size="sm"
              onClick={() => setDifficultyFilter("medium")}
              className="difficulty-medium text-xs px-2 lg:px-3"
            >
              Medium
            </Button>
            <Button
              variant={difficultyFilter === "hard" ? "default" : "outline"}
              size="sm"
              onClick={() => setDifficultyFilter("hard")}
              className="difficulty-hard text-xs px-2 lg:px-3"
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
              onClick={() => handleTopicSelect(topic)}
            />
          ))}
          </div>
          </div>

          {/* Desktop Main Content */}
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            {/* Top Bar */}
            <div className="border-b border-border bg-card/30 backdrop-blur-sm p-4 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <h2 className="font-semibold text-foreground text-xl">
                  {selectedTopic?.title || "Select a topic"}
                </h2>
                {selectedTopic && (
                  <TopicDifficulty difficulty={selectedTopic.difficulty} />
                )}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto page-transition">
              {loadingTopic ? (
                <div className="flex items-center justify-center h-full">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <p className="text-muted-foreground">Loading topic...</p>
                  </div>
                </div>
              ) : selectedTopic ? (
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
      </div>
    </>
  );
}