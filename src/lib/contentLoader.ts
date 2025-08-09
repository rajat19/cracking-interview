import fm from 'front-matter';
import type { Topic } from '@/types';

export type TopicCategoryId = 'dsa' | 'system-design' | 'behavioral';

function generateSlugFromPath(filePath: string): string {
  const parts = filePath.replace(/\\/g, '/').split('/');
  const fileName = parts[parts.length - 1];
  return fileName.replace(/\.md$/, '');
}

function createExcerpt(markdown: string, maxLength = 200): string {
  const text = markdown
    .replace(/```[\s\S]*?```/g, '')
    .replace(/\!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/[#>*_`>-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return text.length > maxLength ? text.slice(0, maxLength - 1) + '…' : text;
}

function mapFrontmatterToTopic(
  category: TopicCategoryId,
  id: string,
  fm: Record<string, any>,
  content: string
): Topic {
  const difficulty = (fm.difficulty || 'medium').toLowerCase();
  const related = Array.isArray(fm.topics) ? fm.topics : undefined;

  return {
    id,
    title: fm.title || id,
    difficulty: difficulty === 'easy' || difficulty === 'hard' ? difficulty : 'medium',
    timeComplexity: fm.tc || undefined,
    spaceComplexity: fm.sc || undefined,
    description: fm.description || createExcerpt(content),
    content: content.trim(),
    examples: undefined,
    relatedTopics: related,
    solutions: undefined,
  };
}

export async function loadTopics(category: TopicCategoryId): Promise<Topic[]> {
  if (category === 'dsa') {
    const modules = import.meta.glob('/src/content/dsa/**/*.md', { query: '?raw', import: 'default', eager: true }) as unknown as Record<string, string>;
    const solutionModules = import.meta.glob('/src/content/solutions/**/*.*', { query: '?raw', import: 'default', eager: true }) as unknown as Record<string, string>;

    const nameToSolutions: Record<string, Record<string, { language: string; code: string; path: string }>> = {};
    for (const [solPath, raw] of Object.entries(solutionModules)) {
      const normalized = solPath.replace(/\\/g, '/');
      const parts = normalized.split('/');
      const solutionsIndex = parts.findIndex(p => p === 'solutions');
      if (solutionsIndex === -1 || solutionsIndex + 1 >= parts.length) continue;
      const problemDir = parts[solutionsIndex + 1];
      const fileName = parts[parts.length - 1];
      const ext = (fileName.split('.').pop() || '').toLowerCase();
      const language = mapExtToLanguage(ext);
      if (!language) continue;
      const entry = { language, code: raw as string, path: normalized };
      nameToSolutions[problemDir] ||= {};
      nameToSolutions[problemDir][language] = entry;
    }

    const topics: Topic[] = Object.entries(modules).map(([path, raw]) => {
      const parsed = fm<any>(raw);
      const data = parsed.attributes || {};
      const content = parsed.body || '';
      const id = generateSlugFromPath(path);
      const topic = mapFrontmatterToTopic('dsa', id, data as any, content);
      const problemKey = id;
      if (nameToSolutions[problemKey]) {
        topic.solutions = nameToSolutions[problemKey];
      }
      return topic;
    });
    topics.sort((a, b) => a.title.localeCompare(b.title));
    return topics;
  }

  return [];
}

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

function mapExtToLanguage(ext: string): string | null {
  switch (ext) {
    case 'java': return 'java';
    case 'py': return 'python';
    case 'cpp': return 'cpp';
    case 'c': return 'c';
    case 'js': return 'javascript';
    case 'ts': return 'typescript';
    case 'go': return 'go';
    case 'rb': return 'ruby';
    default: return null;
  }
}


