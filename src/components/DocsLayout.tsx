import { useState, useMemo, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { BookOpen, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import FiltersControls from "@/components/FiltersControls";
import { ITopicDifficulty, ITopic, ITopicList, ITopicCategory } from "@/types/topic";
import { TopicContent } from "@/components/TopicContent";
import { useAuth } from "@/hooks/useAuth";
import { loadTopicsList, loadTopic, getLocalProgress } from "@/lib/contentLoader";
import { preloadUserProgress, getCachedCategoryProgress } from "@/lib/progressStore";
import Navigation from "@/components/Navigation";
import TopicListItem from "@/components/TopicListItem";
import TopicDifficulty from "@/components/TopicDifficulty";
import { categoryFeatureHelpers } from '@/config/categoryConfig';

interface DocsLayoutProps {
  title: string;
  description: string;
  category: ITopicCategory;
}

export function DocsLayout({ title, description, category }: DocsLayoutProps) {
  const { user } = useAuth();
  const [topics, setTopics] = useState<ITopicList[]>([]);
  const [userProgress, setUserProgress] = useState<Record<string, { is_completed: boolean; is_bookmarked: boolean }>>({});
  const [selectedTopic, setSelectedTopic] = useState<ITopic | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<ITopicDifficulty>("all");
  const [topicTagFilter, setTopicTagFilter] = useState<string>("");
  const [companyFilter, setCompanyFilter] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [loadingTopic, setLoadingTopic] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  const fetchQuestions = useCallback(async (): Promise<void> => {
    try {
      const loaded = await loadTopicsList(category);
      setTopics(loaded);
    } catch (error) {
      console.error('Error loading topics:', error);
    } finally {
      setLoading(false);
    }
  }, [category]);

  const loadFullTopic = useCallback(async (topicId: string): Promise<void> => {
    setLoadingTopic(true);
    try {
      const fullTopic = await loadTopic(category, topicId);
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
      const cached = getCachedCategoryProgress(user.uid, category as 'dsa' | 'system-design' | 'behavioral');
      if (Object.keys(cached).length > 0) {
        setUserProgress(cached);
      } else {
        const loaded = await preloadUserProgress(user.uid, category as 'dsa' | 'system-design' | 'behavioral');
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

  useEffect(() => {
    const topicId = searchParams.get('t');
    if (topicId && topicId !== selectedTopic?.id) {
      loadFullTopic(topicId);
    }
    const topicFilterParam = searchParams.get('topic') || '';
    const companyFilterParam = searchParams.get('company') || '';
    setTopicTagFilter(topicFilterParam);
    setCompanyFilter(companyFilterParam);
  }, [searchParams, loadFullTopic, selectedTopic?.id]);

  const topicsWithProgress = useMemo(() => {
    return topics.map(topic => ({
      ...topic,
      isCompleted: userProgress[topic.id]?.is_completed || false,
      isBookmarked: userProgress[topic.id]?.is_bookmarked || false
    }));
  }, [topics, userProgress]);

  const handleTopicSelect = useCallback(async (topicId: string) => {
    if (selectedTopic?.id === topicId) return;
    await loadFullTopic(topicId);
    // Reflect selection in URL for shareability
    const next = new URLSearchParams(searchParams);
    next.set('t', topicId);
    setSearchParams(next);
    // Close sidebar on mobile after selection
    setSidebarOpen(false);
  }, [selectedTopic?.id, loadFullTopic, searchParams, setSearchParams]);

  const filteredTopics = useMemo(() => {
    return topicsWithProgress.filter(topic => {
      const matchesSearch = topic.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDifficulty = difficultyFilter === "all" || topic.difficulty === difficultyFilter;
      const matchesTopicTag = !topicTagFilter || (topic.relatedTopics || []).map(t => t.toLowerCase()).includes(topicTagFilter.toLowerCase());
      const matchesCompany = !companyFilter || (topic.companies || []).map(c => c.toLowerCase()).includes(companyFilter.toLowerCase());
      return matchesSearch && matchesDifficulty && matchesTopicTag && matchesCompany;
    });
  }, [topicsWithProgress, searchQuery, difficultyFilter, topicTagFilter, companyFilter]);

  const { allTags, allCompanies } = useMemo(() => {
    const tagSet = new Set<string>();
    const companySet = new Set<string>();
    for (const t of topics) {
      (t.relatedTopics || []).forEach(tag => tag && tagSet.add(tag));
      (t.companies || []).forEach(comp => comp && companySet.add(comp));
    }
    return {
      allTags: Array.from(tagSet).sort((a, b) => a.localeCompare(b)),
      allCompanies: Array.from(companySet).sort((a, b) => a.localeCompare(b)),
    };
  }, [topics]);

  const updateSearchParams = (next: URLSearchParams) => {
    // Keep empty values out of URL
    if (next.get('topic') === '') next.delete('topic');
    if (next.get('company') === '') next.delete('company');
    setSearchParams(next);
  };

  const handleSetTopicTagFilter = (value: string) => {
    setTopicTagFilter(value);
    const next = new URLSearchParams(searchParams);
    if (value) next.set('topic', value); else next.delete('topic');
    updateSearchParams(next);
  };

  const handleSetCompanyFilter = (value: string) => {
    setCompanyFilter(value);
    const next = new URLSearchParams(searchParams);
    if (value) next.set('company', value); else next.delete('company');
    updateSearchParams(next);
  };

  const handleClearFilters = () => {
    setTopicTagFilter('');
    setCompanyFilter('');
    const next = new URLSearchParams(searchParams);
    next.delete('topic');
    next.delete('company');
    updateSearchParams(next);
  };

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
        <div className="lg:hidden">
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

          {sidebarOpen && (
            <>
              <div 
                className="fixed inset-0 bg-black/50 z-40"
                onClick={() => setSidebarOpen(false)}
              />
              <div className="fixed top-0 left-0 w-80 h-full bg-card border-r border-border z-50 flex flex-col overflow-visible">
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
                <FiltersControls
                  variant="mobile"
                  searchQuery={searchQuery}
                  onChangeSearch={setSearchQuery}
                  difficultyFilter={difficultyFilter}
                  onChangeDifficulty={setDifficultyFilter}
                  topicTagFilter={topicTagFilter}
                  companyFilter={companyFilter}
                  allTags={allTags}
                  allCompanies={allCompanies}
                  onChangeTopic={handleSetTopicTagFilter}
                  onChangeCompany={handleSetCompanyFilter}
                  onClear={handleClearFilters}
                />

                <div className="flex-1 overflow-y-auto">
                  {filteredTopics.map((topic) => (
                    <TopicListItem
                      key={topic.id}
                      topic={topic}
                      isActive={selectedTopic?.id === topic.id}
                      onClick={() => handleTopicSelect(topic.id)}
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
                onFilterByTag={(tag) => {
                  handleSetTopicTagFilter(tag);
                  setSidebarOpen(true);
                }}
                onFilterByCompany={(comp) => {
                  handleSetCompanyFilter(comp);
                  setSidebarOpen(true);
                }}
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
            <div className="hidden lg:flex h-[calc(100vh-64px)] overflow-visible">
          {/* Desktop Sidebar */}
          <div className="w-80 border-r border-border bg-card/30 backdrop-blur-sm flex flex-col h-full overflow-visible">
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
        <FiltersControls
          variant="desktop"
          searchQuery={searchQuery}
          onChangeSearch={setSearchQuery}
          difficultyFilter={difficultyFilter}
          onChangeDifficulty={setDifficultyFilter}
          topicTagFilter={topicTagFilter}
          companyFilter={companyFilter}
          allTags={allTags}
          allCompanies={allCompanies}
          onChangeTopic={handleSetTopicTagFilter}
          onChangeCompany={handleSetCompanyFilter}
          onClear={handleClearFilters}
        />

        {/* Topics List */}
        <div className="flex-1 overflow-y-auto">
          {filteredTopics.map((topic) => (
            <TopicListItem
              key={topic.id}
              topic={topic}
              isActive={selectedTopic?.id === topic.id}
              onClick={() => handleTopicSelect(topic.id)}
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
                {selectedTopic && categoryFeatureHelpers.shouldShowDifficulty(category) && (
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
                  onFilterByTag={(tag) => {
                    handleSetTopicTagFilter(tag);
                    // Keep sidebar closed on desktop, user can see list filtered
                  }}
                  onFilterByCompany={(comp) => {
                    handleSetCompanyFilter(comp);
                  }}
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