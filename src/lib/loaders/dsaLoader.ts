import fm from 'front-matter';
import type { Topic } from '@/types/topic';

// Type for frontmatter data
interface DSAFrontmatterData {
  title?: string;
  difficulty?: string;
  tc?: string;
  sc?: string;
  description?: string;
  topics?: string[];
  companies?: string[];
  leetcode?: string;
  gfg?: string;
  interviewbit?: string;
  hackerrank?: string;
  hellointerview?: string;
  metacareers?: string;
  [key: string]: unknown;
}

// Cache for loaded topics to avoid re-loading
const dsaTopicsCache = new Map<string, Topic[]>();
const dsaTopicCache = new Map<string, Topic>();
const dsaSolutionsCache = new Map<string, Record<string, { language: string; code: string; path: string }>>();

function generateSlugFromPath(filePath: string): string {
  const parts = filePath.replace(/\\/g, '/').split('/');
  const fileName = parts[parts.length - 1];
  return fileName.replace(/\.md$/, '');
}

function createExcerpt(markdown: string, maxLength = 200): string {
  const text = markdown
    .replace(/```[\s\S]*?```/g, '')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/[#>*_`>-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return text.length > maxLength ? text.slice(0, maxLength - 1) + '…' : text;
}

function mapFrontmatterToTopic(
  id: string,
  fm: DSAFrontmatterData,
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
    leetcode: fm.leetcode || undefined,
    gfg: fm.gfg || undefined,
    interviewbit: fm.interviewbit || undefined,
    hackerrank: fm.hackerrank || undefined,
    hellointerview: fm.hellointerview || undefined,
    metacareers: fm.metacareers || undefined,
    solutions: undefined,
  };
}

// Load DSA topic metadata (title, difficulty, etc.) without full content
export async function loadDSATopicsList(): Promise<Omit<Topic, 'content' | 'solutions'>[]> {
  // Prefer a prebuilt lightweight JSON index for fast initial load
  try {
    const indexModule = await import('@/data/dsa-index.json');
    const items = (indexModule as { default: Omit<Topic, 'content' | 'solutions'>[] }).default;
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
      const parsed = fm<DSAFrontmatterData>(raw);
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
        hellointerview: data.hellointerview || undefined,
        metacareers: data.metacareers || undefined,
        examples: undefined,
        relatedTopics: related,
      });
    } catch (error) {
      console.warn(`Failed to load DSA topic metadata for ${path}:`, error);
    }
  }
  
  topics.sort((a, b) => a.title.localeCompare(b.title));
  return topics;
}

// Load a specific DSA topic with full content and solutions
export async function loadDSATopic(topicId: string): Promise<Topic | null> {
  const cacheKey = `dsa:${topicId}`;
  
  // Check cache first
  if (dsaTopicCache.has(cacheKey)) {
    return dsaTopicCache.get(cacheKey)!;
  }
  
  try {
    // Load the specific markdown file
    const moduleLoader = import.meta.glob('/src/content/dsa/**/*.md', { query: '?raw', import: 'default' }) as unknown as Record<string, () => Promise<string>>;
    
    // Find the correct module path for this topic
    const modulePath = Object.keys(moduleLoader).find(path => {
      const id = generateSlugFromPath(path);
      return id === topicId;
    });
    
    if (!modulePath) {
      console.warn(`DSA topic ${topicId} not found`);
      return null;
    }
    
    const raw = await moduleLoader[modulePath]();
    const parsed = fm<DSAFrontmatterData>(raw);
    const data = parsed.attributes || {};
    const content = parsed.body || '';
    
    const topic = mapFrontmatterToTopic(topicId, data, content);
    
    // Load solutions for this topic
    const solutions = await loadDSATopicSolutions(topicId);
    if (solutions) {
      topic.solutions = solutions;
    }
    
    // Cache the loaded topic
    dsaTopicCache.set(cacheKey, topic);
    
    return topic;
  } catch (error) {
    console.error(`Failed to load DSA topic ${topicId}:`, error);
    return null;
  }
}

// Load solutions for a specific DSA topic
export async function loadDSATopicSolutions(topicId: string): Promise<Record<string, { language: string; code: string; path: string }> | null> {
  // Check cache first
  if (dsaSolutionsCache.has(topicId)) {
    return dsaSolutionsCache.get(topicId)!;
  }
  
  try {
    const solutionModules = import.meta.glob('/src/content/dsa/solutions/**/*.*', { query: '?raw', import: 'default' }) as unknown as Record<string, () => Promise<string>>;
    
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
      
      try {
        const raw = await moduleLoader();
        solutions[ext] = { language: ext, code: raw, path: normalized };
      } catch (error) {
        console.warn(`Failed to load DSA solution ${solPath}:`, error);
      }
    }
    
    // Cache the solutions
    dsaSolutionsCache.set(topicId, solutions);
    
    return Object.keys(solutions).length > 0 ? solutions : null;
  } catch (error) {
    console.error(`Failed to load DSA solutions for topic ${topicId}:`, error);
    return null;
  }
}

// Legacy function for backward compatibility - loads all DSA topics with full content
export async function loadDSATopics(): Promise<Topic[]> {
  const cacheKey = 'all-dsa-topics';
  
  // Check cache first
  if (dsaTopicsCache.has(cacheKey)) {
    return dsaTopicsCache.get(cacheKey)!;
  }
  
  const modules = import.meta.glob('/src/content/dsa/**/*.md', { query: '?raw', import: 'default' }) as unknown as Record<string, () => Promise<string>>;
  const solutionModules = import.meta.glob('/src/content/dsa/solutions/**/*.*', { query: '?raw', import: 'default' }) as unknown as Record<string, () => Promise<string>>;

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
      const entry = { language: ext, code: raw, path: normalized };
      nameToSolutions[problemDir] ||= {};
      nameToSolutions[problemDir][ext] = entry;
    } catch (error) {
      console.warn(`Failed to load DSA solution ${solPath}:`, error);
    }
  }

  const topics: Topic[] = [];
  
  // Load all topics with full content for legacy compatibility
  for (const [path, moduleLoader] of Object.entries(modules)) {
    try {
      const raw = await moduleLoader();
      const parsed = fm<DSAFrontmatterData>(raw);
      const data = parsed.attributes || {};
      const content = parsed.body || '';
      const id = generateSlugFromPath(path);
      const topic = mapFrontmatterToTopic(id, data, content);
      const problemKey = id;
      if (nameToSolutions[problemKey]) {
        topic.solutions = nameToSolutions[problemKey];
      }
      topics.push(topic);
    } catch (error) {
      console.warn(`Failed to load DSA topic ${path}:`, error);
    }
  }
  
  topics.sort((a, b) => a.title.localeCompare(b.title));
  
  // Cache the result
  dsaTopicsCache.set(cacheKey, topics);
  
  return topics;
}

// Clear DSA cache when needed
export function clearDSACache() {
  dsaTopicsCache.clear();
  dsaTopicCache.clear();
  dsaSolutionsCache.clear();
}
