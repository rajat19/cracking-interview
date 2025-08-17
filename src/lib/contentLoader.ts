import type { Topic } from '@/types/topic';
import {
  loadDSATopicsList,
  loadDSATopic,
  loadDSATopics,
  clearDSACache
} from './loaders/dsaLoader';
import {
  loadSystemDesignTopicsList,
  loadSystemDesignTopic,
  loadSystemDesignTopics,
  clearSystemDesignCache
} from './loaders/systemDesignLoader';
import {
  loadBehavioralTopicsList,
  loadBehavioralTopic,
  loadBehavioralTopics,
  clearBehavioralCache
} from './loaders/behavioralLoader';
import {
  loadOODTopicsList,
  loadOODTopic,
  loadOODTopics,
  clearOODCache
} from './loaders/oodLoader';

export type TopicCategoryId = 'dsa' | 'system-design' | 'behavioral' | 'ood';

// Load topic metadata (title, difficulty, etc.) without full content
export async function loadTopicsList(category: TopicCategoryId): Promise<Omit<Topic, 'content' | 'solutions'>[]> {
  switch (category) {
    case 'dsa':
      return loadDSATopicsList();
    case 'system-design':
      return loadSystemDesignTopicsList();
    case 'behavioral':
      return loadBehavioralTopicsList();
    case 'ood':
      return loadOODTopicsList();
    default:
      return [];
  }
}

// Load a specific topic with full content and solutions
export async function loadTopic(category: TopicCategoryId, topicId: string): Promise<Topic | null> {
  switch (category) {
    case 'dsa':
      return loadDSATopic(topicId);
    case 'system-design':
      return loadSystemDesignTopic(topicId);
    case 'behavioral':
      return loadBehavioralTopic(topicId);
    case 'ood':
      return loadOODTopic(topicId);
    default:
      return null;
  }
}

// Legacy function for backward compatibility - loads all topics with full content
export async function loadTopics(category: TopicCategoryId): Promise<Topic[]> {
  switch (category) {
    case 'dsa':
      return loadDSATopics();
    case 'system-design':
      return loadSystemDesignTopics();
    case 'behavioral':
      return loadBehavioralTopics();
    case 'ood':
      return loadOODTopics();
    default:
      return [];
  }
}

// Progress management functions
export function getLocalProgress(category: TopicCategoryId): Record<string, { is_completed: boolean; is_bookmarked: boolean }> {
  try {
    const raw = localStorage.getItem(`progress:${category}`);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function updateLocalProgress(
  category: TopicCategoryId,
  topicId: string,
  updates: { isCompleted?: boolean; isBookmarked?: boolean }
) {
  const current = getLocalProgress(category);
  const existing = current[topicId] || { is_completed: false, is_bookmarked: false };
  const next = {
    ...current,
    [topicId]: {
      is_completed: updates.isCompleted ?? existing.is_completed,
      is_bookmarked: updates.isBookmarked ?? existing.is_bookmarked,
    }
  };
  localStorage.setItem(`progress:${category}`, JSON.stringify(next));
}

// Clear cache when needed
export function clearTopicsCache() {
  clearDSACache();
  clearSystemDesignCache();
  clearBehavioralCache();
  clearOODCache();
}