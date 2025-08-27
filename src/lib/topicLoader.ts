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

// Extract common difficulty logic using configuration
const getDifficultyForCategory = (category: ITopicCategory, frontmatterDifficulty?: string): ITopic['difficulty'] => {
  // Only process difficulty if it's enabled for this category
  if (!config.showDifficulty(category)) {
    return 'medium'; // Default for categories without difficulty
  }
  
  // For categories with difficulty enabled, parse from frontmatter
  if (frontmatterDifficulty) {
    const diff = frontmatterDifficulty.toLowerCase();
    return diff === 'easy' || diff === 'hard' ? diff : 'medium';
  }
  
  return 'medium'; // Default fallback
};

// Extract common related topics logic
const getRelatedTopics = (fm: UniversalFrontmatterData): string[] | undefined => {
  return Array.isArray(fm.topics) ? fm.topics : 
         Array.isArray(fm.tags) ? fm.tags : undefined;
};

// Extract common code loading logic using API route
const loadCodeForTopic = async (
  category: ITopicCategory, 
  topicId: string, 
  codeModules: Record<string, () => Promise<string>>,
  availableLanguages?: string[]
): Promise<Record<string, ISolutionEntry>> => {
  const solutions: Record<string, ISolutionEntry> = {};
  
  // Use languages specified in MDX frontmatter or fallback to common ones
  const languagesToTry = availableLanguages || ['java', 'py', 'cpp', 'c', 'js', 'ts', 'go', 'cs'];
  
  for (const ext of languagesToTry) {
    try {
      const filePath = `/src/content/${category}/code/${topicId}/solution.${ext}`;
      const response = await fetch(`/api/content?path=${encodeURIComponent(filePath)}`);
      
      if (response.ok) {
        const code = await response.text();
        solutions[ext] = { language: ext, code: code.trim() };
      }
    } catch (error) {
      // Silently continue - not all problems have all languages
    }
  }
  
  return solutions;
};

// File system based loader for Next.js
const dynamicLoader = async (modules: Record<string, () => Promise<string>>, path: string): Promise<string> => {
  // For Next.js, we'll use direct file system access or API routes
  // This is a simplified approach - in production you'd want proper API endpoints
  try {
    const response = await fetch(`/api/content?path=${encodeURIComponent(path)}`);
    if (!response.ok) {
      throw new Error(`Failed to load content: ${response.statusText}`);
    }
    return await response.text();
  } catch (error) {
    console.error(`Failed to load content from ${path}:`, error);
    throw error;
  }
};

// Get appropriate modules based on category (now always MDX)
const getContentModules = (category: ITopicCategory): Record<string, () => Promise<string>> => {
  // Since we're using API routes for content loading, return empty object
  // Content will be loaded via dynamicLoader function instead
  return {};
};

// Category-specific path builders (now always MDX)
const getContentPath = (category: ITopicCategory): string => {
  // All categories now use consistent posts/ structure with MDX
  return `/src/content/${category}/posts/**/*.mdx`;
};

// Map frontmatter to topic based on category
const mapFrontmatterToTopic = (
  id: string,
  fm: UniversalFrontmatterData,
  content: string,
  category: ITopicCategory
): ITopic => {
  const difficulty = getDifficultyForCategory(category, fm.difficulty);
  const relatedTopics = getRelatedTopics(fm);
  
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
  try {
    // Direct import for Next.js
    const indexData = await import(`@/data/${category}-index.json`);
    if (!indexData) {
      throw new Error(`Unable to load ${category} index`);
    }
    const items = indexData.default || indexData;
    if (Array.isArray(items) && items.length >= 0) {
      return items.map((item: any) => ({
        ...item,
        isCompleted: false,
        isBookmarked: false
      }));
    }
  } catch (error) {
    console.warn(`Failed to load ${category} index from cache:`, error);
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
    return path.includes(`/content/${category}/posts/`);
  });



  for (const [path, moduleLoader] of relevantModules) {
    try {
      const raw = await moduleLoader();
      const parsed = fm<UniversalFrontmatterData>(raw);
      const data = parsed.attributes || {};
      const id = generateSlugFromPath(path, category);
      
      const difficulty = getDifficultyForCategory(category, data.difficulty);
      const related = getRelatedTopics(data);
      
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
    // Construct the file path for this topic
    const filePath = `/src/content/${category}/posts/${topicId}.mdx`;
    
    // Load content using the API route
    const raw = await dynamicLoader({}, filePath);
    const parsed = fm<UniversalFrontmatterData>(raw);
    const data = parsed.attributes || {};
    const content = parsed.body || '';
    
    const topic = mapFrontmatterToTopic(topicId, data, content, category);
    
    // Load solutions/code examples if the category supports them
    if (config.hasSolutions(category)) {
      // Extract available languages from frontmatter
      const availableLanguages = Array.isArray(data.langs) ? data.langs : undefined;
      const solutions = await loadTopicSolution(category, topicId, availableLanguages);
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
  topicId: string,
  availableLanguages?: string[]
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
    // Use the unified code loading function with empty modules (API route approach)
    const solutions = await loadCodeForTopic(category, topicId, {}, availableLanguages);
    
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