import fm from 'front-matter';
import type { Topic } from '@/types';

export type TopicCategoryId = 'dsa' | 'system-design' | 'behavioral';

// Cache for loaded topics to avoid re-loading
const topicsCache = new Map<TopicCategoryId, Topic[]>();
const topicCache = new Map<string, Topic>();
const solutionsCache = new Map<string, Record<string, { language: string; code: string; path: string }>>();

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
    companies: fm.companies || undefined,
    // Platform identifiers
    leetcode: fm.leetcode || undefined,
    gfg: fm.gfg || undefined,
    interviewbit: fm.interviewbit || undefined,
    hackerrank: fm.hackerrank || undefined,
    solutions: undefined,
  };
}

// Load topic metadata (title, difficulty, etc.) without full content
export async function loadTopicsList(category: TopicCategoryId): Promise<Omit<Topic, 'content' | 'solutions'>[]> {
  if (category !== 'dsa') {
    return [];
  }

  // Prefer a prebuilt lightweight JSON index for fast initial load
  try {
    const indexModule = await import('@/data/dsa-index.json');
    const items = (indexModule as any).default as Omit<Topic, 'content' | 'solutions'>[];
    if (Array.isArray(items) && items.length >= 0) {
      return items;
    }
  } catch {
    // If index is missing or invalid, fall back to scanning markdown
  }

  // Fallback: scan markdown files and parse frontmatter in the client (slower)
  const modules = import.meta.glob('/src/content/dsa/**/*.md', { query: '?raw', import: 'default' }) as unknown as Record<string, () => Promise<string>>;
  
  const topics: Omit<Topic, 'content' | 'solutions'>[] = [];
  
  for (const [path, moduleLoader] of Object.entries(modules)) {
    try {
      const raw = await moduleLoader();
      const parsed = fm<any>(raw);
      const data = parsed.attributes || {};
      const content = parsed.body || '';
      const id = generateSlugFromPath(path);
      
      const difficulty = (data.difficulty || 'medium').toLowerCase();
      const related = Array.isArray(data.topics) ? data.topics : undefined;
      
      topics.push({
        id,
        title: data.title || id,
        difficulty: difficulty === 'easy' || difficulty === 'hard' ? difficulty : 'medium',
        timeComplexity: data.tc || undefined,
        spaceComplexity: data.sc || undefined,
        description: data.description || createExcerpt(content),
        companies: data.companies || undefined,
        // Platform identifiers
        leetcode: data.leetcode || undefined,
        gfg: data.gfg || undefined,
        interviewbit: data.interviewbit || undefined,
        hackerrank: data.hackerrank || undefined,
        examples: undefined,
        relatedTopics: related,
      });
    } catch (error) {
      console.warn(`Failed to load topic metadata for ${path}:`, error);
    }
  }
  
  topics.sort((a, b) => a.title.localeCompare(b.title));
  return topics;
}

// Load a specific topic with full content and solutions
export async function loadTopic(category: TopicCategoryId, topicId: string): Promise<Topic | null> {
  const cacheKey = `${category}:${topicId}`;
  
  // Check cache first
  if (topicCache.has(cacheKey)) {
    return topicCache.get(cacheKey)!;
  }
  
  if (category === 'dsa') {
    try {
      // Load the specific markdown file
      const moduleLoader = import.meta.glob('/src/content/dsa/**/*.md', { query: '?raw', import: 'default' }) as unknown as Record<string, () => Promise<string>>;
      
      // Find the correct module path for this topic
      const modulePath = Object.keys(moduleLoader).find(path => {
        const id = generateSlugFromPath(path);
        return id === topicId;
      });
      
      if (!modulePath) {
        console.warn(`Topic ${topicId} not found`);
        return null;
      }
      
      const raw = await moduleLoader[modulePath]();
      const parsed = fm<any>(raw);
      const data = parsed.attributes || {};
      const content = parsed.body || '';
      
      const topic = mapFrontmatterToTopic(category, topicId, data, content);
      
      // Load solutions for this topic
      const solutions = await loadTopicSolutions(topicId);
      if (solutions) {
        topic.solutions = solutions;
      }
      
      // Cache the loaded topic
      topicCache.set(cacheKey, topic);
      
      return topic;
    } catch (error) {
      console.error(`Failed to load topic ${topicId}:`, error);
      return null;
    }
  }
  
  return null;
}

// Load solutions for a specific topic
export async function loadTopicSolutions(topicId: string): Promise<Record<string, { language: string; code: string; path: string }> | null> {
  // Check cache first
  if (solutionsCache.has(topicId)) {
    return solutionsCache.get(topicId)!;
  }
  
  try {
    const solutionModules = import.meta.glob('/src/content/solutions/**/*.*', { query: '?raw', import: 'default' }) as unknown as Record<string, () => Promise<string>>;
    
    const solutions: Record<string, { language: string; code: string; path: string }> = {};
    
    for (const [solPath, moduleLoader] of Object.entries(solutionModules)) {
      const normalized = solPath.replace(/\\/g, '/');
      const parts = normalized.split('/');
      const solutionsIndex = parts.findIndex(p => p === 'solutions');
      if (solutionsIndex === -1 || solutionsIndex + 1 >= parts.length) continue;
      
      const problemDir = parts[solutionsIndex + 1];
      if (problemDir !== topicId) continue;
      
      const fileName = parts[parts.length - 1];
      const ext = (fileName.split('.').pop() || '').toLowerCase();
      const language = mapExtToLanguage(ext);
      if (!language) continue;
      
      try {
        const raw = await moduleLoader();
        solutions[language] = { language, code: raw, path: normalized };
      } catch (error) {
        console.warn(`Failed to load solution ${solPath}:`, error);
      }
    }
    
    // Cache the solutions
    solutionsCache.set(topicId, solutions);
    
    return Object.keys(solutions).length > 0 ? solutions : null;
  } catch (error) {
    console.error(`Failed to load solutions for topic ${topicId}:`, error);
    return null;
  }
}

// Legacy function for backward compatibility - now loads topics list only for better performance
export async function loadTopics(category: TopicCategoryId): Promise<Topic[]> {
  // Check cache first
  if (topicsCache.has(category)) {
    return topicsCache.get(category)!;
  }
  
  if (category === 'dsa') {
    const modules = import.meta.glob('/src/content/dsa/**/*.md', { query: '?raw', import: 'default' }) as unknown as Record<string, () => Promise<string>>;
    const solutionModules = import.meta.glob('/src/content/solutions/**/*.*', { query: '?raw', import: 'default' }) as unknown as Record<string, () => Promise<string>>;

    const nameToSolutions: Record<string, Record<string, { language: string; code: string; path: string }>> = {};
    
    // Load all solutions eagerly for now (can be optimized further if needed)
    for (const [solPath, moduleLoader] of Object.entries(solutionModules)) {
      try {
        const raw = await moduleLoader();
        const normalized = solPath.replace(/\\/g, '/');
        const parts = normalized.split('/');
        const solutionsIndex = parts.findIndex(p => p === 'solutions');
        if (solutionsIndex === -1 || solutionsIndex + 1 >= parts.length) continue;
        const problemDir = parts[solutionsIndex + 1];
        const fileName = parts[parts.length - 1];
        const ext = (fileName.split('.').pop() || '').toLowerCase();
        const language = mapExtToLanguage(ext);
        if (!language) continue;
        const entry = { language, code: raw, path: normalized };
        nameToSolutions[problemDir] ||= {};
        nameToSolutions[problemDir][language] = entry;
      } catch (error) {
        console.warn(`Failed to load solution ${solPath}:`, error);
      }
    }

    const topics: Topic[] = [];
    
    // Load all topics with full content for legacy compatibility
    for (const [path, moduleLoader] of Object.entries(modules)) {
      try {
        const raw = await moduleLoader();
        const parsed = fm<any>(raw);
        const data = parsed.attributes || {};
        const content = parsed.body || '';
        const id = generateSlugFromPath(path);
        const topic = mapFrontmatterToTopic('dsa', id, data as any, content);
        const problemKey = id;
        if (nameToSolutions[problemKey]) {
          topic.solutions = nameToSolutions[problemKey];
        }
        topics.push(topic);
      } catch (error) {
        console.warn(`Failed to load topic ${path}:`, error);
      }
    }
    
    topics.sort((a, b) => a.title.localeCompare(b.title));
    
    // Cache the result
    topicsCache.set(category, topics);
    
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

// Clear cache when needed
export function clearTopicsCache() {
  topicsCache.clear();
  topicCache.clear();
  solutionsCache.clear();
}