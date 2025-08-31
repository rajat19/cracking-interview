import { doc, getDoc, setDoc, getDocs, collection } from 'firebase/firestore';
import { db } from '@/integrations/firebase/client';
import { ITopicCategory } from '@/types/topic';

export interface UserProgressDoc {
  is_completed: boolean;
  is_bookmarked: boolean;
  updated_at: number;
}

const PROGRESS_CACHE_PREFIX = 'progress_cache_v1';

function makeCategoryCacheKey(userId: string, category: ITopicCategory): string {
  return `${PROGRESS_CACHE_PREFIX}:${userId}:${category}`;
}

function readCategoryCache(
  userId: string,
  category: ITopicCategory
): Record<string, UserProgressDoc> {
  try {
    const raw = localStorage.getItem(makeCategoryCacheKey(userId, category));
    return raw ? (JSON.parse(raw) as Record<string, UserProgressDoc>) : {};
  } catch {
    return {};
  }
}

function writeCategoryCache(
  userId: string,
  category: ITopicCategory,
  data: Record<string, UserProgressDoc>
): void {
  localStorage.setItem(makeCategoryCacheKey(userId, category), JSON.stringify(data));
}

function upsertIntoCategoryCache(
  userId: string,
  category: ITopicCategory,
  topicId: string,
  value: UserProgressDoc
): void {
  const existing = readCategoryCache(userId, category);
  existing[topicId] = value;
  writeCategoryCache(userId, category, existing);
}

export async function getUserProgress(
  userId: string,
  category: ITopicCategory,
  topicId: string
): Promise<UserProgressDoc | null> {
  // Cache-first
  const cached = readCategoryCache(userId, category)[topicId];
  if (cached) return cached;

  const ref = doc(db, 'users', userId, 'progress', `${category}:${topicId}`);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  const value = snap.data() as UserProgressDoc;
  upsertIntoCategoryCache(userId, category, topicId, value);
  return value;
}

export async function upsertUserProgress(
  userId: string,
  category: ITopicCategory,
  topicId: string,
  updates: { isCompleted?: boolean; isBookmarked?: boolean }
): Promise<void> {
  const ref = doc(db, 'users', userId, 'progress', `${category}:${topicId}`);
  const existing = await getDoc(ref);
  const base: UserProgressDoc = {
    is_completed: false,
    is_bookmarked: false,
    updated_at: Date.now(),
  };
  const next: UserProgressDoc = {
    ...(existing.exists() ? (existing.data() as UserProgressDoc) : base),
    is_completed:
      updates.isCompleted ??
      (existing.exists() ? (existing.data() as UserProgressDoc).is_completed : base.is_completed),
    is_bookmarked:
      updates.isBookmarked ??
      (existing.exists() ? (existing.data() as UserProgressDoc).is_bookmarked : base.is_bookmarked),
    updated_at: Date.now(),
  };
  await setDoc(ref, next);
  // Update cache
  upsertIntoCategoryCache(userId, category, topicId, next);
}

/**
 * Preload all progress documents for the user, caches by category key.
 * Note: We fetch the whole subcollection and filter by id prefix `${category}:`.
 */
export async function preloadUserProgress(
  userId: string,
  category: ITopicCategory
): Promise<Record<string, UserProgressDoc>> {
  const colRef = collection(db, 'users', userId, 'progress');
  const snapshot = await getDocs(colRef);
  const result: Record<string, UserProgressDoc> = {};
  snapshot.forEach(docSnap => {
    const id = docSnap.id; // `${category}:${topicId}`
    if (!id.startsWith(`${category}:`)) return;
    const topicId = id.slice(category.length + 1);
    result[topicId] = docSnap.data() as UserProgressDoc;
  });
  writeCategoryCache(userId, category, result);
  return result;
}

export function getCachedCategoryProgress(
  userId: string,
  category: ITopicCategory
): Record<string, UserProgressDoc> {
  return readCategoryCache(userId, category);
}
