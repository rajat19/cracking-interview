import { useState, useMemo, useEffect } from "react";
import { Search, BookOpen, Clock, Code, CheckCircle, Bookmark, BookmarkCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Topic } from "@/types";
import { TopicContent } from "@/components/TopicContent";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";

interface DocsLayoutProps {
  title: string;
  description: string;
  category: string;
}

export function DocsLayout({ title, description, category }: DocsLayoutProps) {
  const { user } = useAuth();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [userProgress, setUserProgress] = useState<Record<string, { is_completed: boolean; is_bookmarked: boolean }>>({});
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuestions();
  }, [category]);

  useEffect(() => {
    if (user && topics.length > 0) {
      fetchUserProgress();
    }
  }, [user, topics]);

  const fetchQuestions = async () => {
    try {
      const tableName = getTableName(category);
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .order('created_at');

      if (error) throw error;

      const mappedTopics: Topic[] = data?.map(q => ({
        id: q.id,
        title: q.title,
        difficulty: q.difficulty as "easy" | "medium" | "hard",
        timeComplexity: (q as any).time_complexity,
        spaceComplexity: (q as any).space_complexity,
        description: q.description,
        content: q.content,
        examples: q.examples || [],
        relatedTopics: q.related_topics || [],
        isCompleted: false,
        isBookmarked: false
      })) || [];

      setTopics(mappedTopics);
      if (mappedTopics.length > 0 && !selectedTopic) {
        setSelectedTopic(mappedTopics[0]);
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProgress = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_progress')
        .select('question_id, is_completed, is_bookmarked')
        .eq('user_id', user.id)
        .eq('question_type', category === 'system-design' ? 'system_design' : category);

      if (error) throw error;

      const progressMap: Record<string, { is_completed: boolean; is_bookmarked: boolean }> = {};
      data?.forEach(progress => {
        progressMap[progress.question_id] = {
          is_completed: progress.is_completed,
          is_bookmarked: progress.is_bookmarked
        };
      });

      setUserProgress(progressMap);
    } catch (error) {
      console.error('Error fetching user progress:', error);
    }
  };

  const getTableName = (category: string) => {
    switch (category) {
      case 'dsa': return 'dsa_questions';
      case 'system-design': return 'system_design_questions';
      case 'behavioral': return 'behavioral_questions';
      default: return 'dsa_questions';
    }
  };

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
      <div className="min-h-screen bg-background flex">
        {/* Sidebar */}
        <div className="w-80 border-r border-border bg-card/30 backdrop-blur-sm">
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
        <div className="overflow-y-auto max-h-[calc(100vh-400px)]">
          {filteredTopics.map((topic) => (
            <div
              key={topic.id}
              className={`topic-list-item m-2 ${selectedTopic?.id === topic.id ? 'active' : ''}`}
              onClick={() => setSelectedTopic(topic)}
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-medium text-foreground text-sm leading-tight">
                  {topic.title}
                </h3>
                <div className="flex items-center space-x-1 ml-2">
                  {topic.isCompleted && (
                    <CheckCircle className="w-4 h-4 text-success" />
                  )}
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
                <Badge 
                  variant="secondary" 
                  className={`text-xs difficulty-${topic.difficulty}`}
                >
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
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
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