import type { ITopic, ITopicCategory, ITopicList } from '@/types/topic';
import {
  loadTopicsList as loadUnifiedTopicsList,
  loadTopic as loadUnifiedTopic,
  clearTopicCache,
} from './topicLoader';

// Load topic metadata (title, difficulty, etc.) without full content
export async function loadTopicsList(category: ITopicCategory): Promise<ITopicList[]> {
  return loadUnifiedTopicsList(category);
}

// Load a specific topic with full content and solutions
export async function loadTopic(category: ITopicCategory, topicId: string): Promise<ITopic | null> {
  return loadUnifiedTopic(category, topicId);
}

// Progress management functions
export function getLocalProgress(
  category: ITopicCategory
): Record<string, { is_completed: boolean; is_bookmarked: boolean }> {
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
    },
  };
  localStorage.setItem(`progress:${category}`, JSON.stringify(next));
}

// Clear cache when needed
export function clearTopicsCache(category?: ITopicCategory) {
  clearTopicCache(category);
}
