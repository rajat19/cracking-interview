import { ITopicCategory } from '@/types/topic';
import categoryConfigData from './categoryConfig.json';

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

export type CategoryConfigMap = Record<ITopicCategory, CategoryConfig>;

// Type-safe configuration object
export const categoryConfig = categoryConfigData as CategoryConfigMap;

// Utility functions
export function getCategoryConfig(categoryId: ITopicCategory): CategoryConfig {
  const config = categoryConfig[categoryId];
  if (!config) {
    throw new Error(`No configuration found for category: ${categoryId}`);
  }
  return config;
}

export function getCategoryFeatures(categoryId: ITopicCategory): CategoryFeatures {
  return getCategoryConfig(categoryId).features;
}

export function isCategoryFeatureEnabled(categoryId: ITopicCategory, feature: keyof CategoryFeatures): boolean {
  return getCategoryFeatures(categoryId)[feature];
}

export function getCategoryName(categoryId: ITopicCategory): string {
  return getCategoryConfig(categoryId).name;
}

export function getCategoryContentType(categoryId: ITopicCategory): 'markdown' | 'mdx' {
  return getCategoryConfig(categoryId).contentType;
}

export function isCategoryDifficultyEnabled(categoryId: ITopicCategory): boolean {
  return getCategoryConfig(categoryId).difficulty.enabled;
}

export function getCategoryDifficultyLevels(categoryId: ITopicCategory): string[] {
  return getCategoryConfig(categoryId).difficulty.levels;
}

// Helper functions for common feature checks
export const categoryFeatureHelpers = {
  shouldShowSolutionTabs: (categoryId: ITopicCategory) => 
    isCategoryFeatureEnabled(categoryId, 'solutionTabs'),
  
  shouldUseMDXRenderer: (categoryId: ITopicCategory) => 
    isCategoryFeatureEnabled(categoryId, 'mdxRenderer'),
  
  shouldShowPlatformLinks: (categoryId: ITopicCategory) => 
    isCategoryFeatureEnabled(categoryId, 'platformLinks'),
  
  shouldShowExamples: (categoryId: ITopicCategory) => 
    isCategoryFeatureEnabled(categoryId, 'examples'),
  
  shouldShowBookmark: (categoryId: ITopicCategory) => 
    isCategoryFeatureEnabled(categoryId, 'bookmarkable'),
  
  shouldTrackProgress: (categoryId: ITopicCategory) => 
    isCategoryFeatureEnabled(categoryId, 'progressTracking'),
  
  shouldShowDifficulty: (categoryId: ITopicCategory) => 
    isCategoryDifficultyEnabled(categoryId),
};
