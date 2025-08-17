import fm from 'front-matter';
import type { Topic } from '@/types/topic';

// Type for behavioral frontmatter data
interface BehavioralFrontmatterData {
  title?: string;
  description?: string;
  tags?: string[];
  companies?: string[];
  author?: string;
  [key: string]: unknown;
}

// Cache for loaded topics to avoid re-loading
const behavioralTopicsCache = new Map<string, Topic[]>();
const behavioralTopicCache = new Map<string, Topic>();

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
  fm: BehavioralFrontmatterData,
  content: string
): Topic {
  return {
    id,
    title: fm.title || id,
    difficulty: 'medium' as const, // Behavioral questions are generally medium difficulty
    timeComplexity: undefined,
    spaceComplexity: undefined,
    description: fm.description || createExcerpt(content),
    content: content.trim(),
    examples: undefined,
    relatedTopics: Array.isArray(fm.tags) ? fm.tags : undefined,
    companies: fm.companies || undefined,
    leetcode: undefined,
    gfg: undefined,
    interviewbit: undefined,
    hackerrank: undefined,
    solutions: undefined,
  };
}

// Load behavioral topic metadata (title, difficulty, etc.) without full content
export async function loadBehavioralTopicsList(): Promise<Omit<Topic, 'content' | 'solutions'>[]> {
  // Load behavioral content
  const modules = import.meta.glob('/src/content/behavioral/**/*.md', { query: '?raw', import: 'default' }) as unknown as Record<string, () => Promise<string>>;
  
  const topics: Omit<Topic, 'content' | 'solutions'>[] = [];
  
  for (const [path, moduleLoader] of Object.entries(modules)) {
    try {
      const raw = await moduleLoader();
      const parsed = fm<BehavioralFrontmatterData>(raw);
      const data = parsed.attributes || {};
      const content = parsed.body || '';
      const id = generateSlugFromPath(path);
      
      topics.push({
        id,
        title: data.title || id,
        difficulty: 'medium' as const,
        timeComplexity: undefined,
        spaceComplexity: undefined,
        description: data.description || createExcerpt(content),
        companies: data.companies || undefined,
        leetcode: undefined,
        gfg: undefined,
        interviewbit: undefined,
        hackerrank: undefined,
        examples: undefined,
        relatedTopics: Array.isArray(data.tags) ? data.tags : undefined,
      });
    } catch (error) {
      console.warn(`Failed to load behavioral topic for ${path}:`, error);
    }
  }
  
  topics.sort((a, b) => a.title.localeCompare(b.title));
  return topics;
}

// Load a specific behavioral topic with full content
export async function loadBehavioralTopic(topicId: string): Promise<Topic | null> {
  const cacheKey = `behavioral:${topicId}`;
  
  // Check cache first
  if (behavioralTopicCache.has(cacheKey)) {
    return behavioralTopicCache.get(cacheKey)!;
  }
  
  try {
    // Load behavioral content
    const moduleLoader = import.meta.glob('/src/content/behavioral/**/*.md', { query: '?raw', import: 'default' }) as unknown as Record<string, () => Promise<string>>;
    
    // Find the correct module path for this topic
    const modulePath = Object.keys(moduleLoader).find(path => {
      const id = generateSlugFromPath(path);
      return id === topicId;
    });
    
    if (!modulePath) {
      console.warn(`Behavioral topic ${topicId} not found`);
      return null;
    }
    
    const raw = await moduleLoader[modulePath]();
    const parsed = fm<BehavioralFrontmatterData>(raw);
    const data = parsed.attributes || {};
    const content = parsed.body || '';
    
    const topic = mapFrontmatterToTopic(topicId, data, content);
    
    // Cache the loaded topic
    behavioralTopicCache.set(cacheKey, topic);
    
    return topic;
  } catch (error) {
    console.error(`Failed to load behavioral topic ${topicId}:`, error);
    return null;
  }
}

// Legacy function for backward compatibility - loads all behavioral topics with full content
export async function loadBehavioralTopics(): Promise<Topic[]> {
  const cacheKey = 'all-behavioral-topics';
  
  // Check cache first
  if (behavioralTopicsCache.has(cacheKey)) {
    return behavioralTopicsCache.get(cacheKey)!;
  }
  
  // For behavioral, load all topics with full content
  const modules = import.meta.glob('/src/content/behavioral/**/*.md', { query: '?raw', import: 'default' }) as unknown as Record<string, () => Promise<string>>;
  
  const topics: Topic[] = [];
  
  for (const [path, moduleLoader] of Object.entries(modules)) {
    try {
      const raw = await moduleLoader();
      const parsed = fm<BehavioralFrontmatterData>(raw);
      const data = parsed.attributes || {};
      const content = parsed.body || '';
      const id = generateSlugFromPath(path);
      const topic = mapFrontmatterToTopic(id, data, content);
      topics.push(topic);
    } catch (error) {
      console.warn(`Failed to load behavioral topic ${path}:`, error);
    }
  }
  
  topics.sort((a, b) => a.title.localeCompare(b.title));
  
  // Cache the result
  behavioralTopicsCache.set(cacheKey, topics);
  
  return topics;
}

// Clear behavioral cache when needed
export function clearBehavioralCache() {
  behavioralTopicsCache.clear();
  behavioralTopicCache.clear();
}
