import type { ITopicCategory, IProblemSet } from '@/types/topic';
import { dsaProblemSets } from './dsa';
import { systemDesignProblemSets } from './system-design';
import { behavioralProblemSets } from './behavioral';
import { oodProblemSets } from './ood';
import { designPatternProblemSets } from './design-pattern';

// Global constants for preview limits
export const PROBLEM_SET_PREVIEW_LIMIT = {
  mobile: 4,
  desktop: 10,
};

const problemSetsMap: Record<ITopicCategory, IProblemSet[]> = {
  dsa: dsaProblemSets,
  'system-design': systemDesignProblemSets,
  behavioral: behavioralProblemSets,
  ood: oodProblemSets,
  'design-pattern': designPatternProblemSets,
};

/**
 * Get problem sets for a specific category
 */
export function getProblemSets(category: ITopicCategory): IProblemSet[] {
  return problemSetsMap[category] || [];
}

/**
 * Get a specific problem set by category and ID
 */
export function getProblemSet(category: ITopicCategory, setId: string): IProblemSet | null {
  const sets = getProblemSets(category);
  return sets.find(set => set.id === setId) || null;
}

/**
 * Check if a category has any problem sets configured
 */
export function hasProblemSets(category: ITopicCategory): boolean {
  return getProblemSets(category).length > 0;
}

