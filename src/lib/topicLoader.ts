import fm from 'front-matter';
import type { ISolutionEntry, ITopic, ITopicCategory, ITopicList } from '@/types/topic';
import config from '@/config';

// Import all index files statically for better reliability
import dsaIndex from '@/generated/dsa-index.json';
import systemDesignIndex from '@/generated/system-design-index.json';
import oodIndex from '@/generated/ood-index.json';
import behavioralIndex from '@/generated/behavioral-index.json';
import designPatternIndex from '@/generated/design-pattern-index.json';

// Import pre-generated content maps statically
import dsaContent from '@/generated/dsa-content.json';
import systemDesignContent from '@/generated/system-design-content.json';
import oodContent from '@/generated/ood-content.json';
import behavioralContent from '@/generated/behavioral-content.json';
import designPatternContent from '@/generated/design-pattern-content.json';
// Full content map (contains solutions per topic)
import fullContentMap from '@/generated/content-map.json';

// Static content maps for immediate access
const CONTENT_MAPS: Record<string, any> = {
  dsa: dsaContent,
  'system-design': systemDesignContent,
  ood: oodContent,
  behavioral: behavioralContent,
  'design-pattern': designPatternContent,
};

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
  leetid?: string;
  gfg?: string;
  interviewbit?: string;
  hackerrank?: string;
  hellointerview?: string;
  metacareers?: string;
  neetcode?: string;
  codingninjas?: string;
  codechef?: string;
  scaler?: string;
  wikipedia?: string;
  sourcemaking?: string;
  refactoring?: string;
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
const getDifficultyForCategory = (
  category: ITopicCategory,
  frontmatterDifficulty?: string
): ITopic['difficulty'] => {
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
const getRelatedTags = (fm: UniversalFrontmatterData): string[] | undefined => {
  return Array.isArray(fm.tags) ? fm.tags : undefined;
};

// For static export, code loading is disabled
const loadCodeForTopic = async (
  category: ITopicCategory,
  topicId: string,
  codeModules: Record<string, () => Promise<string>>,
  availableLanguages?: string[]
): Promise<Record<string, ISolutionEntry>> => {
  // console.log(`Loading solutions for: ${category}/${topicId}`);

  // Prefer solutions from the full content map (includes solutions)
  const categoryMap: any = (fullContentMap as any)[category];
  if (categoryMap && categoryMap[topicId] && categoryMap[topicId].solutions) {
    const solutions = categoryMap[topicId].solutions as Record<string, ISolutionEntry>;
    if (solutions && Object.keys(solutions).length > 0) {
      // console.log(`Found ${Object.keys(solutions).length} pre-generated solutions for ${topicId}`);
      return solutions;
    }
  }

  // console.warn(`No pre-generated solutions found for ${category}/${topicId}`);
  return {};
};

// For static export, use pre-generated content from SSG
const dynamicLoader = async (
  modules: Record<string, () => Promise<string>>,
  path: string
): Promise<string> => {
  const pathParts = path.split('/');
  const fileName = pathParts[pathParts.length - 1].replace('.mdx', '');
  const category = pathParts[3];

  // console.log(`Loading content for: ${category}/${fileName}`);

  // Get the actual content from the pre-generated static maps
  const contentMap = CONTENT_MAPS[category];

  if (contentMap && contentMap[fileName] && contentMap[fileName].content) {
    // console.log(`Found pre-generated content for ${fileName}`);
    return contentMap[fileName].content;
  }

  // If content not found, throw error instead of fallback
  console.error(`Content not found for ${category}/${fileName}`);
  throw new Error(
    `Content not found: ${category}/${fileName}. Make sure to run 'npm run generate:content' before building.`
  );
};

// Placeholder functions removed - SSG should provide all content

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
  const tags = getRelatedTags(fm);

  return {
    id,
    ...fm,
    title: fm.title || id,
    difficulty,
    timeComplexity: fm.tc,
    spaceComplexity: fm.sc,
    description: fm.description || createExcerpt(content),
    content: content.trim(),
    tags,
    solutions: undefined,
  };
};

const indexMap = {
  dsa: dsaIndex,
  'system-design': systemDesignIndex,
  ood: oodIndex,
  behavioral: behavioralIndex,
  'design-pattern': designPatternIndex,
} as const;

const loadFromCache = async (category: ITopicCategory): Promise<ITopicList[] | null> => {
  try {
    // console.log(`Loading index for category: ${category}`);
    const items = indexMap[category];

    if (!items) {
      console.error(`No index data found for category: ${category}`);
      return null;
    }

    // console.log(`Loaded ${items.length} items for category: ${category}`);

    if (Array.isArray(items) && items.length >= 0) {
      return items.map((item: any) => ({
        ...item,
        isCompleted: false,
        isBookmarked: false,
      }));
    }
  } catch (error) {
    console.error(`Failed to load ${category} index from cache:`, error);
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
      const tags = getRelatedTags(data);

      topics.push({
        id,
        title: data.title || id,
        difficulty,
        timeComplexity: data.tc || undefined,
        spaceComplexity: data.sc || undefined,
        companies: data.companies || undefined,
        tags,
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
export const loadTopic = async (
  category: ITopicCategory,
  topicId: string
): Promise<ITopic | null> => {
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
