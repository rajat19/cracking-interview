import categoryConfigData from './categoryConfig.json';
import type { TopicCategoryId } from '@/lib/contentLoader';

export interface CategoryFeatures {
  solutionTabs: boolean;
  mdxRenderer: boolean;
  platformLinks: boolean;
  examples: boolean;
  bookmarkable: boolean;
  progressTracking: boolean;
}

export interface CategoryDifficulty {
  enabled: boolean;
  levels: string[];
}

export interface CategoryConfig {
  name: string;
  features: CategoryFeatures;
  contentType: 'markdown' | 'mdx';
  difficulty: CategoryDifficulty;
}

export type CategoryConfigMap = Record<TopicCategoryId, CategoryConfig>;

// Type-safe configuration object
export const categoryConfig = categoryConfigData as CategoryConfigMap;

// Utility functions
export function getCategoryConfig(categoryId: TopicCategoryId): CategoryConfig {
  const config = categoryConfig[categoryId];
  if (!config) {
    throw new Error(`No configuration found for category: ${categoryId}`);
  }
  return config;
}

export function getCategoryFeatures(categoryId: TopicCategoryId): CategoryFeatures {
  return getCategoryConfig(categoryId).features;
}

export function isCategoryFeatureEnabled(categoryId: TopicCategoryId, feature: keyof CategoryFeatures): boolean {
  return getCategoryFeatures(categoryId)[feature];
}

export function getCategoryName(categoryId: TopicCategoryId): string {
  return getCategoryConfig(categoryId).name;
}

export function getCategoryContentType(categoryId: TopicCategoryId): 'markdown' | 'mdx' {
  return getCategoryConfig(categoryId).contentType;
}

export function isCategoryDifficultyEnabled(categoryId: TopicCategoryId): boolean {
  return getCategoryConfig(categoryId).difficulty.enabled;
}

export function getCategoryDifficultyLevels(categoryId: TopicCategoryId): string[] {
  return getCategoryConfig(categoryId).difficulty.levels;
}

// Helper functions for common feature checks
export const categoryFeatureHelpers = {
  shouldShowSolutionTabs: (categoryId: TopicCategoryId) => 
    isCategoryFeatureEnabled(categoryId, 'solutionTabs'),
  
  shouldUseMDXRenderer: (categoryId: TopicCategoryId) => 
    isCategoryFeatureEnabled(categoryId, 'mdxRenderer'),
  
  shouldShowPlatformLinks: (categoryId: TopicCategoryId) => 
    isCategoryFeatureEnabled(categoryId, 'platformLinks'),
  
  shouldShowExamples: (categoryId: TopicCategoryId) => 
    isCategoryFeatureEnabled(categoryId, 'examples'),
  
  shouldShowBookmark: (categoryId: TopicCategoryId) => 
    isCategoryFeatureEnabled(categoryId, 'bookmarkable'),
  
  shouldTrackProgress: (categoryId: TopicCategoryId) => 
    isCategoryFeatureEnabled(categoryId, 'progressTracking'),
  
  shouldShowDifficulty: (categoryId: TopicCategoryId) => 
    isCategoryDifficultyEnabled(categoryId),
};
