import { ITopicCategory } from '@/types/topic';
import categoryConfigData from './categoryConfig.json';

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
  name: string;
  features: CategoryFeatures;
  contentType: 'markdown' | 'mdx';
  difficulty: CategoryDifficulty;
}

export type CategoryConfigMap = Record<ITopicCategory, CategoryConfig>;
export const categoryConfig = categoryConfigData as CategoryConfigMap;

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

export function isFeatureEnabled(categoryId: ITopicCategory, feature: keyof CategoryFeatures): boolean {
  return getConfig(categoryId)[feature];
}

export function getName(categoryId: ITopicCategory): string {
  return getConfig(categoryId).name;
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
