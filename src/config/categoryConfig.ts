import { ITopicCategory } from '@/types/topic';
import { Brain, Code, Layers, Users } from 'lucide-react';

export interface CategoryFeatures {
  solutionTabs: boolean;
  mdxRenderer: boolean;
  index: boolean;
}

export interface CategoryDifficulty {
  enabled: boolean;
  levels: string[];
}

export interface CategoryConfig {
  title: string;
  description: string;
  display?: {
    icon: React.ElementType;
    gradient: string;
    statsLabel: string;
    statsKey: 'dsaQuestions' | 'systemDesignQuestions' | 'oodQuestions' | 'behavioralQuestions';
  };
  features: CategoryFeatures;
  contentType: 'markdown' | 'mdx';
  difficulty: CategoryDifficulty;
}

export type CategoryConfigMap = Record<ITopicCategory, CategoryConfig>;

export const categoryConfig: CategoryConfigMap = {
  dsa: {
    title: 'Data Structures & Algorithms',
    description: 'Master coding interviews with comprehensive DSA topics',
    display: {
      icon: Code,
      gradient: 'from-blue-500 to-cyan-500',
      statsLabel: 'Problems',
      statsKey: 'dsaQuestions',
    },
    features: {
      solutionTabs: true,
      mdxRenderer: true,
      index: true,
    },
    contentType: 'mdx',
    difficulty: {
      enabled: true,
      levels: ['all', 'easy', 'medium', 'hard'],
    },
  },
  'system-design': {
    title: 'System Design',
    description: 'Learn to design scalable systems and architectures',
    display: {
      icon: Brain,
      gradient: 'from-purple-500 to-pink-500',
      statsLabel: 'Designs',
      statsKey: 'systemDesignQuestions',
    },
    features: {
      solutionTabs: false,
      mdxRenderer: true,
      index: true,
    },
    contentType: 'mdx',
    difficulty: {
      enabled: false,
      levels: [],
    },
  },
  behavioral: {
    title: 'Behavioral',
    description: 'Prepare for behavioral interviews with proven frameworks',
    display: {
      icon: Users,
      gradient: 'from-green-500 to-emerald-500',
      statsLabel: 'Questions',
      statsKey: 'behavioralQuestions',
    },
    features: {
      solutionTabs: false,
      mdxRenderer: true,
      index: true,
    },
    contentType: 'mdx',
    difficulty: {
      enabled: false,
      levels: [],
    },
  },
  ood: {
    title: 'Object-Oriented Design',
    description: 'Master object-oriented design principles and patterns',
    display: {
      icon: Layers,
      gradient: 'from-orange-500 to-red-500',
      statsLabel: 'Concepts',
      statsKey: 'oodQuestions',
    },
    features: {
      solutionTabs: false,
      mdxRenderer: true,
      index: true,
    },
    contentType: 'mdx',
    difficulty: {
      enabled: false,
      levels: [],
    },
  },
};

// Utility functions
export function getConfig(categoryId: ITopicCategory): CategoryConfig {
  const config = categoryConfig[categoryId];
  if (!config) {
    throw new Error(`No configuration found for category: ${categoryId}`);
  }
  return config;
}

export function getFeatures(categoryId: ITopicCategory): CategoryFeatures {
  return getConfig(categoryId).features;
}

export function isFeatureEnabled(
  categoryId: ITopicCategory,
  feature: keyof CategoryFeatures
): boolean {
  return getConfig(categoryId).features[feature];
}

export function getName(categoryId: ITopicCategory): string {
  return getConfig(categoryId).title;
}

export function getContentType(categoryId: ITopicCategory): 'markdown' | 'mdx' {
  return getConfig(categoryId).contentType;
}

export function isDifficultyEnabled(categoryId: ITopicCategory): boolean {
  return getConfig(categoryId).difficulty.enabled;
}

export function getDifficultyLevels(categoryId: ITopicCategory): string[] {
  return getConfig(categoryId).difficulty.levels;
}
