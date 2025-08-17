import fm from 'front-matter';
import type { Topic } from '@/types/topic';

// Type for system design frontmatter data
interface SystemDesignFrontmatterData {
  title?: string;
  author?: string;
  categories?: string;
  tags?: string[];
  description?: string;
  [key: string]: unknown;
}

// Cache for loaded topics to avoid re-loading
const systemDesignTopicsCache = new Map<string, Topic[]>();
const systemDesignTopicCache = new Map<string, Topic>();
const systemDesignCodeCache = new Map<string, Record<string, { language: string; code: string; path: string }>>();

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
  fm: SystemDesignFrontmatterData,
  content: string,
  isDesignProblem: boolean = false
): Topic {
  return {
    id,
    title: fm.title || id,
    difficulty: isDesignProblem ? 'hard' : 'medium', // Design problems are harder than concepts
    description: fm.description || createExcerpt(content),
    content: content.trim(),
    examples: undefined,
    relatedTopics: Array.isArray(fm.tags) ? fm.tags : undefined,
    companies: undefined,
    solutions: undefined,
  };
}

// Load system design topic metadata (title, difficulty, etc.) without full content
export async function loadSystemDesignTopicsList(): Promise<Omit<Topic, 'content' | 'solutions'>[]> {
  // Load system design content from designs folder only (concepts moved to OOD)
  const designModules = import.meta.glob('/src/content/system-design/designs/**/*.md', { query: '?raw', import: 'default' }) as unknown as Record<string, () => Promise<string>>;
  
  const topics: Omit<Topic, 'content' | 'solutions'>[] = [];
  
  // Process designs
  for (const [path, moduleLoader] of Object.entries(designModules)) {
    try {
      const raw = await moduleLoader();
      const parsed = fm<SystemDesignFrontmatterData>(raw);
      const data = parsed.attributes || {};
      const content = parsed.body || '';
      const id = generateSlugFromPath(path);
      
      topics.push({
        id,
        title: data.title || id,
        difficulty: 'hard' as const, // System design problems are generally hard
        timeComplexity: undefined,
        spaceComplexity: undefined,
        description: data.description || createExcerpt(content),
        companies: undefined,
        relatedTopics: Array.isArray(data.tags) ? data.tags : undefined,
      });
    } catch (error) {
      console.warn(`Failed to load system design for ${path}:`, error);
    }
  }
  
  topics.sort((a, b) => a.title.localeCompare(b.title));
  return topics;
}

// Load a specific system design topic with full content and code examples
export async function loadSystemDesignTopic(topicId: string): Promise<Topic | null> {
  const cacheKey = `system-design:${topicId}`;
  
  // Check cache first
  if (systemDesignTopicCache.has(cacheKey)) {
    return systemDesignTopicCache.get(cacheKey)!;
  }
  
  try {
    // Load system design content from designs folder only (concepts moved to OOD)
    const designModules = import.meta.glob('/src/content/system-design/designs/**/*.md', { query: '?raw', import: 'default' }) as unknown as Record<string, () => Promise<string>>;
    
    const allModules = { ...designModules };
    
    // Find the correct module path for this topic
    const modulePath = Object.keys(allModules).find(path => {
      const id = generateSlugFromPath(path);
      return id === topicId;
    });
    
    if (!modulePath) {
      console.warn(`System design topic ${topicId} not found`);
      return null;
    }
    
    const raw = await allModules[modulePath]();
    const parsed = fm<SystemDesignFrontmatterData>(raw);
    const data = parsed.attributes || {};
    const content = parsed.body || '';
    
    // Check if this is a design problem (from designs folder)
    const isDesignProblem = modulePath.includes('/designs/');
    const topic = mapFrontmatterToTopic(topicId, data, content, isDesignProblem);
    
    // System design topics don't have code solutions, but might have code examples
    // Load code examples if they exist in the code folder
    const codeExamples = await loadSystemDesignCode(topicId);
    if (codeExamples) {
      topic.solutions = codeExamples;
    }
    
    // Cache the loaded topic
    systemDesignTopicCache.set(cacheKey, topic);
    
    return topic;
  } catch (error) {
    console.error(`Failed to load system design topic ${topicId}:`, error);
    return null;
  }
}

// Load system design code examples for a specific topic
export async function loadSystemDesignCode(topicId: string): Promise<Record<string, { language: string; code: string; path: string }> | null> {
  // Check cache first
  if (systemDesignCodeCache.has(topicId)) {
    return systemDesignCodeCache.get(topicId)!;
  }

  try {
    const codeModules = import.meta.glob('/src/content/system-design/code/**/*.*', { query: '?raw', import: 'default' }) as unknown as Record<string, () => Promise<string>>;
    
    const codeExamples: Record<string, { language: string; code: string; path: string }> = {};
    
    for (const [codePath, moduleLoader] of Object.entries(codeModules)) {
      const normalized = codePath.replace(/\\/g, '/');
      const parts = normalized.split('/');
      const codeIndex = parts.findIndex(p => p === 'code');
      if (codeIndex === -1 || codeIndex + 1 >= parts.length) continue;
      
      const problemDir = parts[codeIndex + 1];
      
      // Map system design folder names to topic IDs
      const folderToTopicMap: Record<string, string> = {
        'library': '2020-10-15-library-management-system',
        'parking': '2020-10-25-parking-lot',
        'shopping': '2020-10-28-online-shopping',
        'stack-overflow': '2020-10-30-stack-overflow',
        'movie-booking': '2020-11-22-movie-booking'
      };
      
      const mappedTopicId = folderToTopicMap[problemDir];
      if (mappedTopicId !== topicId) continue;
      
      const fileName = parts[parts.length - 1];
      const ext = (fileName.split('.').pop() || '').toLowerCase();
      
      try {
        const raw = await moduleLoader();
        codeExamples[ext] = { language: ext, code: raw, path: normalized };
      } catch (error) {
        console.warn(`Failed to load system design code ${codePath}:`, error);
      }
    }
    
    // Cache the code examples
    systemDesignCodeCache.set(topicId, codeExamples);
    
    return Object.keys(codeExamples).length > 0 ? codeExamples : null;
  } catch (error) {
    console.error(`Failed to load system design code for topic ${topicId}:`, error);
    return null;
  }
}

// Legacy function for backward compatibility - loads all system design topics with full content
export async function loadSystemDesignTopics(): Promise<Topic[]> {
  const cacheKey = 'all-system-design-topics';
  
  // Check cache first
  if (systemDesignTopicsCache.has(cacheKey)) {
    return systemDesignTopicsCache.get(cacheKey)!;
  }
  
  // For system design, load all topics with full content from designs folder only
  const designModules = import.meta.glob('/src/content/system-design/designs/**/*.md', { query: '?raw', import: 'default' }) as unknown as Record<string, () => Promise<string>>;
  
  const topics: Topic[] = [];
  
  // Process designs
  for (const [path, moduleLoader] of Object.entries(designModules)) {
    try {
      const raw = await moduleLoader();
      const parsed = fm<SystemDesignFrontmatterData>(raw);
      const data = parsed.attributes || {};
      const content = parsed.body || '';
      const id = generateSlugFromPath(path);
      const topic = mapFrontmatterToTopic(id, data, content, true);
      
      // Load code examples for system design topics
      const codeExamples = await loadSystemDesignCode(id);
      if (codeExamples) {
        topic.solutions = codeExamples;
      }
      
      topics.push(topic);
    } catch (error) {
      console.warn(`Failed to load system design ${path}:`, error);
    }
  }
  
  topics.sort((a, b) => a.title.localeCompare(b.title));
  
  // Cache the result
  systemDesignTopicsCache.set(cacheKey, topics);
  
  return topics;
}

// Clear system design cache when needed
export function clearSystemDesignCache() {
  systemDesignTopicsCache.clear();
  systemDesignTopicCache.clear();
  systemDesignCodeCache.clear();
}
