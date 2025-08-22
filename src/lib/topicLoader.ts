import fm from 'front-matter';
import type { ISolutionEntry, ITopic, ITopicCategory, ITopicList } from '@/types/topic';
import config from '@/config';

// Universal frontmatter interface that covers all categories
interface UniversalFrontmatterData {
  title?: string;
  author?: string;
  difficulty?: string;
  tc?: string;
  sc?: string;
  description?: string;
  topics?: string[];
  tags?: string[];
  companies?: string[];
  categories?: string;
  leetcode?: string;
  gfg?: string;
  interviewbit?: string;
  hackerrank?: string;
  hellointerview?: string;
  metacareers?: string;
  [key: string]: unknown;
}

// Centralized cache for all categories
const topicCache = new Map<string, ITopic>();
const topicsListCache = new Map<string, ITopicList[]>();
const solutionsCache = new Map<string, Record<string, ISolutionEntry>>();

const generateSlugFromPath = (filePath: string, category: ITopicCategory): string => {
  const parts = filePath.replace(/\\/g, '/').split('/');
  const fileName = parts[parts.length - 1];
  const contentType = config.getContentType(category);
  const extension = contentType === 'mdx' ? '\\.mdx$' : '\\.md$';
  return fileName.replace(new RegExp(extension), '');
};

const createExcerpt = (markdown: string, maxLength = 200): string => {
  const text = markdown
    .replace(/```[\s\S]*?```/g, '')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/[#>*_`>-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return text.length > maxLength ? text.slice(0, maxLength - 1) + '…' : text;
};

// Dynamic module loaders for different content types
const indexModules = import.meta.glob('/src/data/*-index.json', {
  import: 'default',
  query: 'raw',
}) as unknown as Record<string, () => Promise<string>>;

const markdownModules = import.meta.glob('/src/content/**/*.md', {
  import: 'default',
  query: 'raw',
}) as unknown as Record<string, () => Promise<string>>;

const mdxModules = import.meta.glob('/src/content/**/*.mdx', {
  import: 'default',
  query: 'raw',
}) as unknown as Record<string, () => Promise<string>>;

const solutionModules = import.meta.glob('/src/content/**/solutions/**/*.*', {
  import: 'default',
  query: 'raw',
}) as unknown as Record<string, () => Promise<string>>;

const codeModules = import.meta.glob('/src/content/**/code/**/*.*', {
  import: 'default',
  query: 'raw',
}) as unknown as Record<string, () => Promise<string>>;

const dynamicLoader = async (modules: Record<string, () => Promise<string>>, path: string): Promise<string> => {
  const moduleLoader = modules[path];
  if (!moduleLoader) {
    throw new Error(`Module not found: ${path}`);
  }
  return await moduleLoader();
};

// Get appropriate modules based on category
const getContentModules = (category: ITopicCategory): Record<string, () => Promise<string>> => {
  const contentType = config.getContentType(category);
  return contentType === 'mdx' ? mdxModules : markdownModules;
};

// Category-specific path builders
const getContentPath = (category: ITopicCategory): string => {
  const contentType = config.getContentType(category);
  const extension = contentType === 'mdx' ? 'mdx' : 'md';
  
  // Special handling for system-design which has designs subfolder
  if (category === 'system-design') {
    return `/src/content/${category}/designs/**/*.${extension}`;
  }
  
  return `/src/content/${category}/**/*.${extension}`;
};

// Map frontmatter to topic based on category
const mapFrontmatterToTopic = (
  id: string,
  fm: UniversalFrontmatterData,
  content: string,
  category: ITopicCategory
): ITopic => {
  // Category-specific difficulty handling
  let difficulty: ITopic['difficulty'] = 'medium';
  
  if (category === 'dsa' && fm.difficulty) {
    const diff = fm.difficulty.toLowerCase();
    difficulty = diff === 'easy' || diff === 'hard' ? diff : 'medium';
  } else if (category === 'system-design') {
    difficulty = 'hard'; // System design problems are generally hard
  } else {
    difficulty = 'medium'; // Default for behavioral and ood
  }
  
  // Handle related topics/tags
  const relatedTopics = Array.isArray(fm.topics) ? fm.topics : 
                       Array.isArray(fm.tags) ? fm.tags : undefined;
  
  return {
    id,
    title: fm.title || id,
    author: fm.author || undefined,
    difficulty,
    timeComplexity: fm.tc || undefined,
    spaceComplexity: fm.sc || undefined,
    description: fm.description || createExcerpt(content),
    content: content.trim(),
    examples: undefined,
    relatedTopics,
    companies: fm.companies || undefined,
    leetcode: category === 'dsa' ? fm.leetcode : undefined,
    gfg: category === 'dsa' ? fm.gfg : undefined,
    interviewbit: category === 'dsa' ? fm.interviewbit : undefined,
    hackerrank: category === 'dsa' ? fm.hackerrank : undefined,
    hellointerview: category === 'dsa' ? fm.hellointerview : undefined,
    metacareers: category === 'dsa' ? fm.metacareers : undefined,
    solutions: undefined,
  };
};

const loadFromCache = async (category: ITopicCategory): Promise<ITopicList[] | null> => {
  const indexPath = `/src/data/${category}-index.json`;

  try {
    const rawData = await dynamicLoader(indexModules, indexPath);
    const items = JSON.parse(rawData);
    if (Array.isArray(items) && items.length >= 0) {
      return items;
    }
  } catch {
    // If index is missing or invalid, fall back to scanning markdown
  }
  return null;
};

// 1. Load topics list for a specific category
export const loadTopicsList = async (category: ITopicCategory): Promise<ITopicList[]> => {
  const cacheKey = `${category}-topics-list`;
  
  // Check memory cache first
  if (topicsListCache.has(cacheKey)) {
    return topicsListCache.get(cacheKey)!;
  }
  
  // Try to load from prebuilt index if available
  if (config.hasIndex(category)) {
    const cacheResult = await loadFromCache(category);
    if (cacheResult != null) {
      topicsListCache.set(cacheKey, cacheResult);
      return cacheResult;
    }
  }

  // Fallback: scan content files and parse frontmatter
  const topics: ITopicList[] = [];
  const contentModules = getContentModules(category);
  const contentPath = getContentPath(category);
  
  // Filter modules that match our category path pattern
  const relevantModules = Object.entries(contentModules).filter(([path]) => {
    if (category === 'system-design') {
      return path.includes('/system-design/designs/');
    }
    return path.includes(`/content/${category}/`);
  });

  for (const [path, moduleLoader] of relevantModules) {
    try {
      const raw = await moduleLoader();
      const parsed = fm<UniversalFrontmatterData>(raw);
      const data = parsed.attributes || {};
      const id = generateSlugFromPath(path, category);
      
      // Category-specific difficulty handling
      let difficulty: ITopicList['difficulty'] = 'medium';
      if (category === 'dsa' && data.difficulty) {
        const diff = data.difficulty.toLowerCase();
        difficulty = diff === 'easy' || diff === 'hard' ? diff : 'medium';
      } else if (category === 'system-design') {
        difficulty = 'hard';
      }
      
      const related = Array.isArray(data.topics) ? data.topics : 
                     Array.isArray(data.tags) ? data.tags : undefined;
      
      topics.push({
        id,
        title: data.title || id,
        difficulty,
        timeComplexity: data.tc || undefined,
        spaceComplexity: data.sc || undefined,
        companies: data.companies || undefined,
        relatedTopics: related,
      });
    } catch (error) {
      console.warn(`Failed to load ${category} topic metadata for ${path}:`, error);
    }
  }
  
  topics.sort((a, b) => a.title.localeCompare(b.title));
  
  // Cache the result
  topicsListCache.set(cacheKey, topics);
  return topics;
};

// 2. Load a specific topic with full content
export const loadTopic = async (category: ITopicCategory, topicId: string): Promise<ITopic | null> => {
  const cacheKey = `${category}:${topicId}`;
  
  // Check cache first
  if (topicCache.has(cacheKey)) {
    return topicCache.get(cacheKey)!;
  }
  
  try {
    const contentModules = getContentModules(category);
    
    // Find the correct module path for this topic
    const modulePath = Object.keys(contentModules).find(path => {
      if (category === 'system-design' && !path.includes('/designs/')) {
        return false; // Only look in designs folder for system-design
      }
      if (!path.includes(`/content/${category}/`)) {
        return false; // Must be in the correct category folder
      }
      const id = generateSlugFromPath(path, category);
      return id === topicId;
    });
    
    if (!modulePath) {
      console.warn(`${category} topic ${topicId} not found`);
      return null;
    }
    
    const raw = await contentModules[modulePath]();
    const parsed = fm<UniversalFrontmatterData>(raw);
    const data = parsed.attributes || {};
    const content = parsed.body || '';
    
    const topic = mapFrontmatterToTopic(topicId, data, content, category);
    
    // Load solutions/code examples if the category supports them
    if (config.hasSolutions(category)) {
      const solutions = await loadTopicSolution(category, topicId);
      if (solutions) {
        topic.solutions = solutions;
      }
    }
    
    // Cache the loaded topic
    topicCache.set(cacheKey, topic);
    
    return topic;
  } catch (error) {
    console.error(`Failed to load ${category} topic ${topicId}:`, error);
    return null;
  }
};

// 3. Load solutions for a specific topic (category-dependent)
export const loadTopicSolution = async (
  category: ITopicCategory, 
  topicId: string
): Promise<Record<string, ISolutionEntry> | null> => {
  const cacheKey = `${category}:${topicId}:solutions`;
  
  // Check cache first
  if (solutionsCache.has(cacheKey)) {
    return solutionsCache.get(cacheKey)!;
  }
  
  // Only certain categories have solutions
  if (!config.hasSolutions(category)) {
    return null;
  }
  
  try {
    const solutions: Record<string, ISolutionEntry> = {};
    
    if (category === 'dsa') {
      // DSA solutions are in /solutions/{topicId}/ folder
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
          solutions[ext] = { language: ext, code: raw };
        } catch (error) {
          console.warn(`Failed to load ${category} solution ${solPath}:`, error);
        }
      }
    } else if (category === 'system-design') {
      // System design code examples are in /code/{topicId}/ folder
      const folderToTopicMap: Record<string, string> = {
        'library-management': 'library-management',
        'parking-lot': 'parking-lot',
        'online-shopping': 'online-shopping',
        'stack-overflow': 'stack-overflow',
        'movie-booking': 'movie-booking'
      };
      
      for (const [codePath, moduleLoader] of Object.entries(codeModules)) {
        const normalized = codePath.replace(/\\/g, '/');
        const parts = normalized.split('/');
        const codeIndex = parts.findIndex(p => p === 'code');
        if (codeIndex === -1 || codeIndex + 1 >= parts.length) continue;
        
        const problemDir = parts[codeIndex + 1];
        const mappedTopicId = folderToTopicMap[problemDir];
        if (mappedTopicId !== topicId) continue;
        
        const fileName = parts[parts.length - 1];
        const ext = (fileName.split('.').pop() || '').toLowerCase();
        
        try {
          const raw = await moduleLoader();
          solutions[fileName] = { language: ext, code: raw };
        } catch (error) {
          console.warn(`Failed to load ${category} code ${codePath}:`, error);
        }
      }
    }
    
    // Cache the solutions if any were found
    if (Object.keys(solutions).length > 0) {
      solutionsCache.set(cacheKey, solutions);
      return solutions;
    }
    
    return null;
  } catch (error) {
    console.error(`Failed to load ${category} solutions for topic ${topicId}:`, error);
    return null;
  }
};

// 4. Clear cache for a specific category or all categories
export const clearTopicCache = (category?: ITopicCategory) => {
  if (category) {
    // Clear cache for specific category
    const keysToDelete: string[] = [];
    
    topicCache.forEach((_, key) => {
      if (key.startsWith(`${category}:`)) {
        keysToDelete.push(key);
      }
    });
    
    topicsListCache.forEach((_, key) => {
      if (key.startsWith(`${category}-`)) {
        keysToDelete.push(key);
      }
    });
    
    solutionsCache.forEach((_, key) => {
      if (key.startsWith(`${category}:`)) {
        keysToDelete.push(key);
      }
    });
    
    keysToDelete.forEach(key => {
      topicCache.delete(key);
      topicsListCache.delete(key);
      solutionsCache.delete(key);
    });
  } else {
    // Clear all caches
    topicCache.clear();
    topicsListCache.clear();
    solutionsCache.clear();
  }
};