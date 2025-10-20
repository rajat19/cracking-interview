'use client';

import { useMemo, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import type { IProblemSet, ITopicList, ITopicCategory, ITopicDifficulty } from '@/types/topic';
import TopicListItem from '@/components/TopicListItem';
import { Button } from '@/components/ui/button';
import DifficultyFilter from '@/components/filters/DifficultyFilter';
import { useAuth } from '@/hooks/useAuth';
import { getLocalProgress } from '@/lib/contentLoader';
import { preloadUserProgress, getCachedCategoryProgress } from '@/lib/progressStore';

interface ProblemSetDetailProps {
  problemSet: IProblemSet;
  allTopics: ITopicList[];
  category: ITopicCategory;
}

export function ProblemSetDetail({ problemSet, allTopics, category }: ProblemSetDetailProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [userProgress, setUserProgress] = useState<
    Record<string, { is_completed: boolean; is_bookmarked: boolean }>
  >({});
  const [difficultyFilter, setDifficultyFilter] = useState<ITopicDifficulty>('all');

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
    fetchUserProgress();
  }, [fetchUserProgress]);

  const topicsMap = useMemo(() => {
    const map = new Map<string, ITopicList>();
    allTopics.forEach(topic => {
      map.set(topic.id, topic);
    });
    return map;
  }, [allTopics]);

  const orderedTopics = useMemo(() => {
    const topics: ITopicList[] = [];

    for (const questionId of problemSet.questions) {
      const topic = topicsMap.get(questionId);
      if (topic) {
        topics.push({
          ...topic,
          isCompleted: userProgress[topic.id]?.is_completed || false,
          isBookmarked: userProgress[topic.id]?.is_bookmarked || false,
        });
      }
    }

    return topics;
  }, [problemSet.questions, topicsMap, userProgress]);

  const filteredTopics = useMemo(() => {
    return orderedTopics.filter(topic => {
      const matchesDifficulty = difficultyFilter === 'all' || topic.difficulty === difficultyFilter;
      return matchesDifficulty;
    });
  }, [orderedTopics, difficultyFilter]);

  const completedCount = filteredTopics.filter(t => t.isCompleted).length;
  const progressPercentage =
    orderedTopics.length > 0 ? Math.round((completedCount / orderedTopics.length) * 100) : 0;

  const handleTopicClick = (topicId: string) => {
    router.push(`/topics/${category}?t=${topicId}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/topics/${category}`)}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to {category.toUpperCase()}
          </Button>

          <h1 className="mb-3 text-4xl font-bold text-foreground">{problemSet.name}</h1>
          <p className="mb-4 text-lg text-muted-foreground">{problemSet.description}</p>

          {/* Stats */}
          <div className="flex items-center space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-success" />
              <span className="font-medium text-foreground">
                {completedCount} / {filteredTopics.length} completed
              </span>
            </div>
            <div className="text-muted-foreground">{progressPercentage}% progress</div>
          </div>

          {/* Progress Bar */}
          <div className="progress-indicator mt-4">
            <div className="progress-fill" style={{ width: `${progressPercentage}%` }} />
          </div>
        </div>

        {/* Difficulty Filter */}
        <div className="mb-6">
          <DifficultyFilter
            difficultyFilter={difficultyFilter}
            onChangeDifficulty={setDifficultyFilter}
            variant="desktop"
          />
        </div>

        {/* Topics Grid */}
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          {filteredTopics.map(topic => (
            <TopicListItem
              key={topic.id}
              topic={topic}
              isActive={false}
              onClick={() => handleTopicClick(topic.id)}
            />
          ))}
        </div>

        {filteredTopics.length === 0 && (
          <div className="rounded-lg border border-border bg-card p-8 text-center">
            <p className="text-muted-foreground">
              {difficultyFilter === 'all'
                ? 'No topics found in this problem set.'
                : `No ${difficultyFilter} difficulty topics found. Try selecting a different difficulty.`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
