'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { IProblemSet, ITopicList, ITopicCategory } from '@/types/topic';
import TopicListItem from '@/components/TopicListItem';
import { PROBLEM_SET_PREVIEW_LIMIT } from '@/config/problem-sets';

interface ProblemSetPreviewProps {
  problemSet: IProblemSet;
  category: ITopicCategory;
  topicsMap: Map<string, ITopicList>;
  onTopicSelect: (topicId: string) => void;
  selectedTopicId?: string;
}

export function ProblemSetPreview({
  problemSet,
  category,
  topicsMap,
  onTopicSelect,
  selectedTopicId,
}: ProblemSetPreviewProps) {
  const previewTopics = useMemo(() => {
    const topics: ITopicList[] = [];

    // Get the appropriate limit based on screen size (will use CSS to handle responsiveness)
    const limit = PROBLEM_SET_PREVIEW_LIMIT.desktop;

    for (const questionId of problemSet.questions.slice(0, limit)) {
      const topic = topicsMap.get(questionId);
      if (topic) {
        topics.push(topic);
      }
    }

    return topics;
  }, [problemSet.questions, topicsMap]);

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="mb-4">
        <h2 className="mb-2 text-2xl font-bold text-foreground">{problemSet.name}</h2>
        <p className="text-sm text-muted-foreground">{problemSet.description}</p>
        <div className="mt-2 text-xs text-muted-foreground">
          {problemSet.questions.length} problems
        </div>
      </div>

      {/* Desktop: Show 10 items in grid (5 per row) */}
      <div className="mb-4 hidden grid-cols-5 gap-2 lg:grid">
        {previewTopics.map(topic => (
          <TopicListItem
            key={topic.id}
            topic={topic}
            isActive={selectedTopicId === topic.id}
            onClick={() => onTopicSelect(topic.id)}
          />
        ))}
      </div>

      {/* Mobile: Show 5 items in grid (1 per row on small, 2 on sm+) */}
      <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:hidden">
        {previewTopics.slice(0, PROBLEM_SET_PREVIEW_LIMIT.mobile).map(topic => (
          <TopicListItem
            key={topic.id}
            topic={topic}
            isActive={selectedTopicId === topic.id}
            onClick={() => onTopicSelect(topic.id)}
          />
        ))}
      </div>

      {problemSet.questions.length > PROBLEM_SET_PREVIEW_LIMIT.mobile && (
        <Link
          href={`/topics/${category}/problem-sets/${problemSet.id}`}
          className="inline-flex items-center text-sm font-medium text-primary hover:underline"
        >
          View all {problemSet.questions.length} problems
          <ArrowRight className="ml-1 h-4 w-4" />
        </Link>
      )}
    </div>
  );
}
