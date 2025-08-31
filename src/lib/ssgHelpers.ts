import fs from 'fs/promises';
import path from 'path';
import fm from 'front-matter';
import type { ITopic, ITopicCategory, ITopicList, ISolutionEntry } from '@/types/topic';

// Server-side content loading for SSG
export async function getAllTopicsForCategory(category: ITopicCategory): Promise<ITopicList[]> {
  try {
    const indexPath = path.join(process.cwd(), `src/data/${category}-index.json`);
    const content = await fs.readFile(indexPath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`Error loading ${category} index:`, error);
    return [];
  }
}

export async function getAllTopicIds(category: ITopicCategory): Promise<string[]> {
  const topics = await getAllTopicsForCategory(category);
  return topics.map(topic => topic.id);
}

// Load code solutions for a topic (handles subdirectories)
function loadCodeSolutions(
  category: ITopicCategory,
  topicId: string
): Record<string, ISolutionEntry> {
  const codeDir = path.join(process.cwd(), `src/content/${category}/code/${topicId}`);
  const solutions: Record<string, ISolutionEntry> = {};

  if (!require('fs').existsSync(codeDir)) {
    return solutions;
  }

  // Recursive function to scan directories for solution files
  function scanDirectory(dir: string, subPath = '') {
    try {
      const items = require('fs').readdirSync(dir);

      for (const item of items) {
        const itemPath = path.join(dir, item);
        const stat = require('fs').statSync(itemPath);

        if (stat.isDirectory()) {
          // Recursively scan subdirectories
          scanDirectory(itemPath, path.join(subPath, item));
        } else if (stat.isFile()) {
          const ext = path.extname(item).slice(1); // Remove the dot
          const baseName = path.basename(item, path.extname(item));

          // Only process solution files
          if (baseName === 'solution' && ext) {
            try {
              const code = require('fs').readFileSync(itemPath, 'utf-8');
              const solutionKey = subPath ? `${subPath.replace(/\//g, '_')}_${ext}` : ext;
              solutions[solutionKey] = {
                language: ext,
                code: code.trim(),
              };
            } catch (error: any) {
              console.warn(`⚠️  Failed to read code file: ${itemPath}`, error.message);
            }
          }
        }
      }
    } catch (error: any) {
      console.warn(`⚠️  Error reading directory: ${dir}`, error.message);
    }
  }

  scanDirectory(codeDir);
  return solutions;
}

export async function getTopicWithContent(
  category: ITopicCategory,
  topicId: string
): Promise<ITopic | null> {
  try {
    // Load topic metadata
    const topics = await getAllTopicsForCategory(category);
    const topicMeta = topics.find(t => t.id === topicId);
    if (!topicMeta) {
      return null;
    }

    // Load MDX content
    const mdxPath = path.join(process.cwd(), `src/content/${category}/posts/${topicId}.mdx`);
    let content = '';
    let frontmatter: any = {};

    try {
      const mdxContent = await fs.readFile(mdxPath, 'utf-8');
      const parsed = fm(mdxContent);
      content = parsed.body;
      frontmatter = parsed.attributes;
    } catch (error) {
      console.warn(`No MDX content found for ${category}/${topicId}`);
    }

    // Load code solutions
    const solutions = loadCodeSolutions(category, topicId);

    return {
      ...topicMeta,
      content,
      solutions,
      description: frontmatter.description || '', // Add description from frontmatter
      // Override with frontmatter if available
      title: frontmatter.title || topicMeta.title,
      difficulty: frontmatter.difficulty || topicMeta.difficulty,
      companies: frontmatter.companies || topicMeta.companies || [],
      relatedTopics: frontmatter.topics || topicMeta.relatedTopics || [],
    };
  } catch (error) {
    console.error(`Error loading topic ${category}/${topicId}:`, error);
    return null;
  }
}

// Generate all possible topic combinations for static params
export async function generateAllTopicParams(): Promise<
  Array<{ category: string; topicId?: string }>
> {
  const categories: ITopicCategory[] = ['dsa', 'system-design', 'ood', 'behavioral'];
  const params: Array<{ category: string; topicId?: string }> = [];

  for (const category of categories) {
    // Add category-only params (for the main category pages)
    params.push({ category });

    // Add category + topic params (for specific topic pages)
    const topicIds = await getAllTopicIds(category);
    for (const topicId of topicIds) {
      params.push({ category, topicId });
    }
  }

  return params;
}
