"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { BookOpen, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import FiltersControls from "@/components/filters/FiltersControls";
import { ITopicDifficulty, ITopic, ITopicList, ITopicCategory } from "@/types/topic";
import { TopicContent } from "@/components/TopicContent";
import { useAuth } from "@/hooks/useAuth";
import { getLocalProgress } from "@/lib/contentLoader";
import { preloadUserProgress, getCachedCategoryProgress } from "@/lib/progressStore";

import TopicListItem from "@/components/TopicListItem";
import TopicDifficulty from "@/components/TopicDifficulty";
import config from '@/config';

interface DocsLayoutSSGProps {
  title: string;
  description: string;
  category: ITopicCategory;
  allTopics: ITopicList[];
  selectedTopic: ITopic | null;
}

export function DocsLayoutSSG({ 
  title, 
  description, 
  category, 
  allTopics, 
  selectedTopic
}: DocsLayoutSSGProps) {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  
  const [userProgress, setUserProgress] = useState<Record<string, { is_completed: boolean; is_bookmarked: boolean }>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<ITopicDifficulty>("all");
  const [topicTagFilter, setTopicTagFilter] = useState<string>("");
  const [companyFilter, setCompanyFilter] = useState<string>("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
    fetchUserProgress();
  }, [fetchUserProgress]);

  // Initialize filters from URL search params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const topicFilterParam = urlParams.get('topic') || '';
    const companyFilterParam = urlParams.get('company') || '';
    setTopicTagFilter(topicFilterParam);
    setCompanyFilter(companyFilterParam);
  }, []);

  const topicsWithProgress = useMemo(() => {
    return allTopics.map(topic => ({
      ...topic,
      isCompleted: userProgress[topic.id]?.is_completed || false,
      isBookmarked: userProgress[topic.id]?.is_bookmarked || false
    }));
  }, [allTopics, userProgress]);

  const handleTopicSelect = useCallback((topicId: string) => {
    if (selectedTopic?.id === topicId) return;
    
    // Navigate to the topic page
    const newPath = `/topics/${category}/${topicId}`;
    const params = new URLSearchParams();
    
    // Preserve existing filters
    if (topicTagFilter) params.set('topic', topicTagFilter);
    if (companyFilter) params.set('company', companyFilter);
    
    const queryString = params.toString();
    router.push(queryString ? `${newPath}?${queryString}` : newPath);
    
    // Close sidebar on mobile after selection
    setSidebarOpen(false);
  }, [selectedTopic?.id, category, topicTagFilter, companyFilter, router]);

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
    for (const t of allTopics) {
      (t.relatedTopics || []).forEach(tag => tag && tagSet.add(tag));
      (t.companies || []).forEach(comp => comp && companySet.add(comp));
    }
    return {
      allTags: Array.from(tagSet).sort((a, b) => a.localeCompare(b)),
      allCompanies: Array.from(companySet).sort((a, b) => a.localeCompare(b)),
    };
  }, [allTopics]);

  const updateURL = (newParams: URLSearchParams) => {
    // Keep empty values out of URL
    if (newParams.get('topic') === '') newParams.delete('topic');
    if (newParams.get('company') === '') newParams.delete('company');
    
    const queryString = newParams.toString();
    const newPath = selectedTopic 
      ? `/topics/${category}/${selectedTopic.id}`
      : `/topics/${category}`;
    
    router.push(queryString ? `${newPath}?${queryString}` : newPath);
  };

  const handleSetTopicTagFilter = (value: string) => {
    setTopicTagFilter(value);
    const params = new URLSearchParams(window.location.search);
    if (value) params.set('topic', value); else params.delete('topic');
    updateURL(params);
  };

  const handleSetCompanyFilter = (value: string) => {
    setCompanyFilter(value);
    const params = new URLSearchParams(window.location.search);
    if (value) params.set('company', value); else params.delete('company');
    updateURL(params);
  };

  const handleClearFilters = () => {
    setTopicTagFilter('');
    setCompanyFilter('');
    const params = new URLSearchParams();
    updateURL(params);
  };

  const completedCount = topicsWithProgress.filter(t => t.isCompleted).length;
  const progressPercentage = topicsWithProgress.length > 0 ? Math.round((completedCount / topicsWithProgress.length) * 100) : 0;

  return (
    <div className="min-h-[calc(100vh-64px)] bg-background">
      <div className="lg:hidden">
        <div className="sticky top-16 z-40 bg-background border-b border-border p-3">
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
            {selectedTopic ? (
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
                {selectedTopic && config.showDifficulty(category) && (
                  <TopicDifficulty difficulty={selectedTopic.difficulty} />
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
  );
}
