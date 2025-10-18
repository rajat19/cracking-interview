'use client';

import { useMemo } from 'react';
import type { ITopicCategory, ITopicList } from '@/types/topic';
import { getProblemSets } from '@/config/problem-sets';
import { ProblemSetPreview } from './ProblemSetPreview';

interface ProblemSetsHomeProps {
  category: ITopicCategory;
  topicsWithProgress: ITopicList[];
  onTopicSelect: (topicId: string) => void;
  selectedTopicId?: string;
}

export function ProblemSetsHome({
  category,
  topicsWithProgress,
  onTopicSelect,
  selectedTopicId,
}: ProblemSetsHomeProps) {
  const problemSets = useMemo(() => getProblemSets(category), [category]);

  const topicsMap = useMemo(() => {
    const map = new Map<string, ITopicList>();
    topicsWithProgress.forEach(topic => {
      map.set(topic.id, topic);
    });
    return map;
  }, [topicsWithProgress]);

  if (problemSets.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6 p-6">
      <div className="mb-6">
        <h1 className="mb-2 text-3xl font-bold text-foreground">Curated Problem Sets</h1>
        <p className="text-muted-foreground">
          Start with these carefully curated collections to master coding interview patterns
        </p>
      </div>

      {problemSets.map(problemSet => (
        <ProblemSetPreview
          key={problemSet.id}
          problemSet={problemSet}
          category={category}
          topicsMap={topicsMap}
          onTopicSelect={onTopicSelect}
          selectedTopicId={selectedTopicId}
        />
      ))}
    </div>
  );
}

