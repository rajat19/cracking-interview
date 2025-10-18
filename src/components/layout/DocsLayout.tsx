'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { BookOpen, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import FiltersControls from '@/components/filters/FiltersControls';
import { ITopicDifficulty, ITopic, ITopicList, ITopicCategory } from '@/types/topic';
import { TopicContent } from '@/components/topic/TopicContent';
import { useAuth } from '@/hooks/useAuth';
import { loadTopicsList, loadTopic, getLocalProgress } from '@/lib/contentLoader';
import { preloadUserProgress, getCachedCategoryProgress } from '@/lib/progressStore';

import TopicListItem from '@/components/TopicListItem';
import TopicDifficulty from '@/components/TopicDifficulty';
import config from '@/config';
import TopicDefault from '@/components/topic/TopicDefault';
import TopicLoading from '@/components/topic/TopicLoading';
import SearchSuggest from '@/components/filters/SearchSuggest';
import { ProblemSetsHome } from '@/components/ProblemSetsHome';
import { hasProblemSets } from '@/config/problem-sets';

interface DocsLayoutProps {
  title: string;
  description: string;
  category: ITopicCategory;
}

export function DocsLayout({ title, description, category }: DocsLayoutProps) {
  const { user } = useAuth();
  const [topics, setTopics] = useState<ITopicList[]>([]);
  const [userProgress, setUserProgress] = useState<
    Record<string, { is_completed: boolean; is_bookmarked: boolean }>
  >({});
  const [selectedTopic, setSelectedTopic] = useState<ITopic | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<ITopicDifficulty>('all');
  const [topicTagFilter, setTopicTagFilter] = useState<string>('');
  const [companyFilter, setCompanyFilter] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [loadingTopic, setLoadingTopic] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const searchParams = useSearchParams();
  const { replace } = useRouter();

  const fetchQuestions = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      const loaded = await loadTopicsList(category);
      setTopics(loaded);
    } catch (error) {
      console.error('Error loading topics:', error);
    } finally {
      setLoading(false);
    }
  }, [category]);

  const loadFullTopic = useCallback(
    async (topicId: string): Promise<void> => {
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
    },
    [category]
  );

  const fetchUserProgress = useCallback(async (): Promise<void> => {
    if (user) {
      const cached = getCachedCategoryProgress(user.uid, category);
      if (Object.keys(cached).length > 0) {
        setUserProgress(cached);
      } else {
        const loaded = await preloadUserProgress(user.uid, category);
        setUserProgress(loaded);
      }
    } else {
      const progress = getLocalProgress(category);
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
    const topicFilterParam = searchParams.get('topic') || '';
    const companyFilterParam = searchParams.get('company') || '';
    
    setTopicTagFilter(topicFilterParam);
    setCompanyFilter(companyFilterParam);
    
    if (!topicId) {
      // Clear selected topic when no 't' param in URL
      if (selectedTopic !== null) {
        setSelectedTopic(null);
      }
      return;
    }
    
    if (topicId !== selectedTopic?.id) {
      // Load topic if it's different from current
      loadFullTopic(topicId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, loadFullTopic]);

  const topicsWithProgress = useMemo(() => {
    return topics.map(topic => ({
      ...topic,
      isCompleted: userProgress[topic.id]?.is_completed || false,
      isBookmarked: userProgress[topic.id]?.is_bookmarked || false,
    }));
  }, [topics, userProgress]);

  const handleTopicSelect = useCallback(
    async (topicId: string) => {
      if (selectedTopic?.id === topicId) return;
      await loadFullTopic(topicId);
      // Reflect selection in URL for shareability
      const next = new URLSearchParams(searchParams);
      next.set('t', topicId);
      replace(`?${next.toString()}`);
      // Close sidebar on mobile after selection
      setSidebarOpen(false);
    },
    [selectedTopic?.id, loadFullTopic, searchParams, replace]
  );

  const filteredTopics = useMemo(() => {
    return topicsWithProgress.filter(topic => {
      const matchesSearch = topic.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDifficulty = difficultyFilter === 'all' || topic.difficulty === difficultyFilter;
      const matchesTopicTag =
        !topicTagFilter ||
        (topic.tags || []).map(t => t.toLowerCase()).includes(topicTagFilter.toLowerCase());
      const matchesCompany =
        !companyFilter ||
        (topic.companies || []).map(c => c.toLowerCase()).includes(companyFilter.toLowerCase());
      return matchesSearch && matchesDifficulty && matchesTopicTag && matchesCompany;
    });
  }, [topicsWithProgress, searchQuery, difficultyFilter, topicTagFilter, companyFilter]);

  const searchSuggestions = useMemo(
    () =>
      searchQuery.trim() === ''
        ? []
        : topicsWithProgress
            .filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()))
            .slice(0, 20)
            .map(t => ({ id: t.id, title: t.title })),
    [topicsWithProgress, searchQuery]
  );

  const { allTags, allCompanies } = useMemo(() => {
    const tagSet = new Set<string>();
    const companySet = new Set<string>();
    for (const t of topics) {
      (t.tags || []).forEach(tag => tag && tagSet.add(tag));
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
    replace(`?${next.toString()}`);
  };

  const handleSetTopicTagFilter = (value: string) => {
    setTopicTagFilter(value);
    const next = new URLSearchParams(searchParams);
    if (value) next.set('topic', value);
    else next.delete('topic');
    updateSearchParams(next);
  };

  const handleSetCompanyFilter = (value: string) => {
    setCompanyFilter(value);
    const next = new URLSearchParams(searchParams);
    if (value) next.set('company', value);
    else next.delete('company');
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
  const progressPercentage =
    topicsWithProgress.length > 0
      ? Math.round((completedCount / topicsWithProgress.length) * 100)
      : 0;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">Loading questions...</div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-background">
      <div className="lg:hidden">
        <div className="sticky top-16 z-40 border-b border-border bg-background p-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="bg-background shadow-sm"
          >
            {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            <span className="ml-2 text-sm">{sidebarOpen ? 'Close' : 'Topics'}</span>
          </Button>
        </div>

        {sidebarOpen && (
          <>
            <div className="fixed inset-0 z-40 bg-black/50" onClick={() => setSidebarOpen(false)} />
            <div className="fixed left-0 top-0 z-50 flex h-full w-80 flex-col overflow-visible border-r border-border bg-card">
              <div className="border-b border-border p-4">
                <div className="mb-4 flex items-center justify-between">
                  <h1 className="text-xl font-bold text-foreground">{title}</h1>
                  <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <p className="mb-3 text-xs text-muted-foreground">{description}</p>

                {/* Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium text-foreground">
                      {completedCount}/{topicsWithProgress.length}
                    </span>
                  </div>
                  <div className="progress-indicator">
                    <div className="progress-fill" style={{ width: `${progressPercentage}%` }} />
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
                {filteredTopics.map(topic => (
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
            <TopicLoading />
          ) : selectedTopic ? (
            <TopicContent
              topic={selectedTopic}
              category={category}
              onProgressUpdate={fetchUserProgress}
              onFilterByTag={tag => {
                handleSetTopicTagFilter(tag);
                setSidebarOpen(true);
              }}
              onFilterByCompany={comp => {
                handleSetCompanyFilter(comp);
                setSidebarOpen(true);
              }}
            />
          ) : (
            <div className="space-y-4 p-4">
              <SearchSuggest
                searchQuery={searchQuery}
                onChangeSearch={setSearchQuery}
                suggestions={searchSuggestions}
                onSelectSuggestion={id => handleTopicSelect(id)}
              />
              {hasProblemSets(category) ? (
                <ProblemSetsHome
                  category={category}
                  topicsWithProgress={topicsWithProgress}
                  onTopicSelect={handleTopicSelect}
                  selectedTopicId={(selectedTopic as ITopic | null)?.id}
                />
              ) : (
                <TopicDefault />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden h-[calc(100vh-64px)] overflow-visible lg:flex">
        {/* Desktop Sidebar */}
        <div className="flex h-full w-80 flex-col overflow-visible border-r border-border bg-card/30 backdrop-blur-sm">
          {/* Header */}
          <div className="border-b border-border p-6">
            <h1 className="mb-2 text-2xl font-bold text-foreground">{title}</h1>
            <p className="mb-4 text-sm text-muted-foreground">{description}</p>

            {/* Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium text-foreground">
                  {completedCount}/{topicsWithProgress.length}
                </span>
              </div>
              <div className="progress-indicator">
                <div className="progress-fill" style={{ width: `${progressPercentage}%` }} />
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
            {filteredTopics.map(topic => (
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
        <div className="flex h-full flex-1 flex-col overflow-hidden">
          {/* Top Bar */}
          <div className="flex items-center justify-between border-b border-border bg-card/30 p-4 backdrop-blur-sm">
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-semibold text-foreground">
                {selectedTopic?.title || 'Select a topic'}
              </h2>
              {selectedTopic && config.showDifficulty(category) && (
                <TopicDifficulty difficulty={selectedTopic.difficulty} />
              )}
            </div>
          </div>

          {/* Content */}
          <div className="page-transition flex-1 overflow-y-auto">
            {loadingTopic ? (
              <TopicLoading />
            ) : selectedTopic ? (
              <TopicContent
                topic={selectedTopic}
                category={category}
                onProgressUpdate={fetchUserProgress}
                onFilterByTag={tag => {
                  handleSetTopicTagFilter(tag);
                  // Keep sidebar closed on desktop, user can see list filtered
                }}
                onFilterByCompany={comp => {
                  handleSetCompanyFilter(comp);
                }}
              />
            ) : hasProblemSets(category) ? (
              <ProblemSetsHome
                category={category}
                topicsWithProgress={topicsWithProgress}
                onTopicSelect={handleTopicSelect}
                selectedTopicId={(selectedTopic as ITopic | null)?.id}
              />
            ) : (
              <TopicDefault />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
