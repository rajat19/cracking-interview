import type { ITopic, ITopicCategory, ITopicList } from '@/types/topic';
import {
  loadDSATopicsList,
  loadDSATopic,
  clearDSACache
} from './loaders/dsaLoader';
import {
  loadSystemDesignTopicsList,
  loadSystemDesignTopic,
  clearSystemDesignCache
} from './loaders/systemDesignLoader';
import {
  loadBehavioralTopicsList,
  loadBehavioralTopic,
  clearBehavioralCache
} from './loaders/behavioralLoader';
import {
  loadOODTopicsList,
  loadOODTopic,
  clearOODCache
} from './loaders/oodLoader';

// Load topic metadata (title, difficulty, etc.) without full content
export async function loadTopicsList(category: ITopicCategory): Promise<ITopicList[]> {
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
export async function loadTopic(category: ITopicCategory, topicId: string): Promise<ITopic | null> {
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

// Progress management functions
export function getLocalProgress(category: ITopicCategory): Record<string, { is_completed: boolean; is_bookmarked: boolean }> {
  try {
    const raw = localStorage.getItem(`progress:${category}`);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function updateLocalProgress(
  category: ITopicCategory,
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