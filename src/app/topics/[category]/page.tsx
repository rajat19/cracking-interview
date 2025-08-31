import { Suspense } from 'react';
import { DocsLayout } from '@/components/layout/DocsLayout';
import { getConfig } from '@/config/categoryConfig';
import type { ITopicCategory } from '@/types/topic';

interface PageProps {
  params: {
    category: string;
  };
}

export function generateStaticParams() {
  return [
    { category: 'dsa' },
    { category: 'system-design' },
    { category: 'ood' },
    { category: 'behavioral' },
  ];
}

export default async function TopicsPage({ params }: PageProps) {
  const category = (await params).category as ITopicCategory;
  const cfg = getConfig(category);
  return (
    <Suspense fallback={<div />}>
      <DocsLayout title={cfg.title} description={cfg.description} category={category} />
    </Suspense>
  );
}
