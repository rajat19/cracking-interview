import { notFound } from 'next/navigation';
import { getAllTopicsForCategory, getTopicWithContent, generateAllTopicParams } from '@/lib/ssgHelpers';
import { DocsLayoutSSG } from '@/components/layout/DocsLayoutSSG';
import type { ITopicCategory } from '@/types/topic';

interface PageProps {
  params: Promise<{
    category: string;
    topicId?: string[];
  }>;
}

// This tells Next.js which routes to pre-generate at build time
export async function generateStaticParams() {
  const allParams = await generateAllTopicParams();
  
  return allParams.map(({ category, topicId }) => ({
    category,
    topicId: topicId ? [topicId] : undefined,
  }));
}

// Generate metadata for each page
export async function generateMetadata({ params }: PageProps) {
  const { category, topicId } = await params;
  const actualTopicId = topicId?.[0];
  
  const categoryTitles = {
    'dsa': 'Data Structures & Algorithms',
    'system-design': 'System Design',
    'ood': 'Object-Oriented Design',
    'behavioral': 'Behavioral Questions'
  };

  if (actualTopicId) {
    const topic = await getTopicWithContent(category as ITopicCategory, actualTopicId);
    return {
      title: topic ? `${topic.title} - ${categoryTitles[category as keyof typeof categoryTitles]}` : 'Topic Not Found',
      description: topic ? `Learn about ${topic.title} with detailed explanations and code solutions.` : 'Topic not found',
    };
  }

  return {
    title: categoryTitles[category as keyof typeof categoryTitles] || 'Interview Preparation',
    description: `Master ${categoryTitles[category as keyof typeof categoryTitles]} with comprehensive practice problems and solutions.`,
  };
}

export default async function TopicsPage({ params }: PageProps) {
  const { category, topicId } = await params;
  const actualTopicId = topicId?.[0];
  
  // Validate category
  const validCategories = ['dsa', 'system-design', 'ood', 'behavioral'];
  if (!validCategories.includes(category)) {
    notFound();
  }

  // Load all topics for the category
  const allTopics = await getAllTopicsForCategory(category as ITopicCategory);
  
  // Load specific topic if requested
  let selectedTopic = null;
  if (actualTopicId) {
    selectedTopic = await getTopicWithContent(category as ITopicCategory, actualTopicId);
    if (!selectedTopic) {
      notFound();
    }
  }

  const categoryConfig = {
    'dsa': {
      title: 'Data Structures & Algorithms',
      description: 'Master coding interviews with comprehensive DSA topics'
    },
    'system-design': {
      title: 'System Design',
      description: 'Learn to design scalable systems and architectures'
    },
    'ood': {
      title: 'Object-Oriented Design',
      description: 'Master object-oriented design principles and patterns'
    },
    'behavioral': {
      title: 'Behavioral Questions',
      description: 'Prepare for behavioral interviews with proven frameworks'
    }
  };

  const config = categoryConfig[category as keyof typeof categoryConfig];

  return (
    <DocsLayoutSSG
      title={config.title}
      description={config.description}
      category={category as ITopicCategory}
      allTopics={allTopics}
      selectedTopic={selectedTopic}
    />
  );
}
