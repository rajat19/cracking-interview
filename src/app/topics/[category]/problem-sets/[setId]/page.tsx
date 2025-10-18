import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import type { ITopicCategory } from '@/types/topic';
import { getProblemSet, getProblemSets } from '@/config/problem-sets';
import { loadTopicsList } from '@/lib/topicLoader';
import { ProblemSetDetail } from '@/components/ProblemSetDetail';

interface PageProps {
  params: Promise<{
    category: string;
    setId: string;
  }>;
}

export async function generateStaticParams() {
  const categories: ITopicCategory[] = [
    'dsa',
    'system-design',
    'ood',
    'behavioral',
    'design-pattern',
  ];

  const params: { category: string; setId: string }[] = [];

  for (const category of categories) {
    const problemSets = getProblemSets(category);
    for (const set of problemSets) {
      params.push({
        category,
        setId: set.id,
      });
    }
  }

  return params;
}

export default async function ProblemSetPage({ params }: PageProps) {
  const { category, setId } = await params;
  const typedCategory = category as ITopicCategory;

  // Get the problem set
  const problemSet = getProblemSet(typedCategory, setId);

  if (!problemSet) {
    notFound();
  }

  // Load all topics for the category
  const allTopics = await loadTopicsList(typedCategory);

  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}>
      <ProblemSetDetail problemSet={problemSet} allTopics={allTopics} category={typedCategory} />
    </Suspense>
  );
}

