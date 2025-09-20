import fs from 'node:fs';
import path from 'node:path';
import fm from 'front-matter';

const categories = ['dsa', 'system-design', 'ood', 'behavioral', 'design-pattern'] as const;
type Category = typeof categories[number];

const outputDir = path.join(process.cwd(), 'src/generated');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

type SolutionEntry = {
  language: string;
  code: string;
  subPath: string;
  fileName: string;
};

type SolutionsMap = Record<string, SolutionEntry>;

interface FrontmatterAttrs {
  title?: string;
  difficulty?: string;
  companies?: string[];
  tags?: string[];
  langs?: string[];
  tc?: string;
  sc?: string;
  leetcode?: string;
  gfg?: string;
  leetid?: string;
  [key: string]: unknown;
}

interface TopicContent {
  id: string;
  title: string;
  difficulty: string;
  companies: string[];
  tags: string[];
  langs: string[];
  tc?: string;
  sc?: string;
  leetcode?: string;
  gfg?: string;
  leetid?: string;
  content: string;
  body: string;
  solutions: SolutionsMap;
}

function loadCodeSolutions(category: Category, topicId: string): SolutionsMap {
  const codeDir = path.join(process.cwd(), `src/content/${category}/code/${topicId}`);
  const solutions: SolutionsMap = {};

  if (!fs.existsSync(codeDir)) {
    return solutions;
  }

  function scanDirectory(dir: string, subPath = ''): void {
    try {
      const items = fs.readdirSync(dir);

      for (const item of items) {
        const itemPath = path.join(dir, item);
        const stat = fs.statSync(itemPath);

        if (stat.isDirectory()) {
          scanDirectory(itemPath, path.join(subPath, item));
        } else if (stat.isFile()) {
          const ext = path.extname(item).slice(1);
          const baseName = path.basename(item, path.extname(item));

          if (baseName === 'solution' && ext) {
            try {
              const code = fs.readFileSync(itemPath, 'utf-8');
              const solutionKey = subPath ? `${subPath.replace(/\//g, '_')}_${ext}` : ext;
              solutions[solutionKey] = {
                language: ext,
                code: code.trim(),
                subPath: subPath || '',
                fileName: item,
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

async function generateStaticContent(): Promise<void> {
  console.log('🚀 Starting static content generation...');

  const allContent: Partial<Record<Category, Record<string, TopicContent>>> = {};

  for (const category of categories) {
    console.log(`📁 Processing ${category} category...`);

    const postsDir = path.join(process.cwd(), `src/content/${category}/posts`);

    if (!fs.existsSync(postsDir)) {
      console.log(`⚠️  Directory not found: ${postsDir}`);
      continue;
    }

    const files = fs.readdirSync(postsDir).filter(file => file.endsWith('.mdx'));
    console.log(`📄 Found ${files.length} MDX files in ${category}`);

    allContent[category] = {} as Record<string, TopicContent>;

    for (const file of files) {
      const filePath = path.join(postsDir, file);
      const topicId = path.basename(file, '.mdx');

      try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const parsed = fm<FrontmatterAttrs>(content);

        const solutions = loadCodeSolutions(category, topicId);
        const solutionCount = Object.keys(solutions).length;

        (allContent[category] as Record<string, TopicContent>)[topicId] = {
          id: topicId,
          title: parsed.attributes.title || topicId,
          difficulty: (parsed.attributes.difficulty as string) || 'medium',
          companies: (parsed.attributes.companies as string[]) || [],
          tags: (parsed.attributes.tags as string[]) || [],
          langs: (parsed.attributes.langs as string[]) || [],
          tc: parsed.attributes.tc as string | undefined,
          sc: parsed.attributes.sc as string | undefined,
          leetcode: parsed.attributes.leetcode as string | undefined,
          gfg: parsed.attributes.gfg as string | undefined,
          leetid: parsed.attributes.leetid as string | undefined,
          content: content,
          body: parsed.body as string,
          solutions: solutions,
        };

        console.log(`✅ Processed: ${category}/${topicId} (${solutionCount} solutions)`);
      } catch (error: any) {
        console.error(`❌ Error processing ${category}/${file}:`, error.message);
      }
    }
  }

  const contentMapPath = path.join(outputDir, 'content-map.json');
  fs.writeFileSync(contentMapPath, JSON.stringify(allContent, null, 2));
  console.log(`📦 Generated content map: ${contentMapPath}`);

  for (const category of categories) {
    const catContent = allContent[category];
    if (catContent) {
      const categoryContentWithoutSolutions: Record<string, Omit<TopicContent, 'solutions'>> = {};
      for (const [topicId, topic] of Object.entries(catContent)) {
        const { solutions: _solutions, ...rest } = topic;
        categoryContentWithoutSolutions[topicId] = rest;
      }

      const categoryPath = path.join(outputDir, `${category}-content.json`);
      fs.writeFileSync(categoryPath, JSON.stringify(categoryContentWithoutSolutions, null, 2));
      console.log(
        `📦 Generated ${category} content: ${categoryPath} (${Object.keys(catContent).length} topics)`
      );

      const categoryIndex = Object.entries(catContent).map(([topicId, topic]) => ({
        id: topicId,
        title: topic.title,
        difficulty: topic.difficulty,
        timeComplexity: topic.tc,
        spaceComplexity: topic.sc,
        description: topic.content
          ? String(topic.body || '')
              .replace(/```[\s\S]*?```/g, '')
              .replace(/[#>*_`>-]/g, ' ')
              .replace(/\s+/g, ' ')
              .trim()
              .slice(0, 200) + '…'
          : '',
        companies: Array.isArray(topic.companies) ? topic.companies : [],
        tags: Array.isArray(topic.tags) ? topic.tags : [],
      }));

      const indexPath = path.join(outputDir, `${category}-index.json`);
      fs.writeFileSync(indexPath, JSON.stringify(categoryIndex, null, 2));
      console.log(`📦 Generated ${category} index: ${indexPath}`);
    }
  }

  for (const category of categories) {
    const catContent = allContent[category];
    if (catContent) {
      const solutionsDir = path.join(outputDir, 'solutions', category);
      if (!fs.existsSync(solutionsDir)) {
        fs.mkdirSync(solutionsDir, { recursive: true });
      }

      for (const [topicId, topic] of Object.entries(catContent)) {
        if (topic.solutions && Object.keys(topic.solutions).length > 0) {
          const solutionPath = path.join(solutionsDir, `${topicId}.json`);
          fs.writeFileSync(solutionPath, JSON.stringify(topic.solutions, null, 2));
          console.log(
            `🔧 Generated solutions for ${category}/${topicId}: ${Object.keys(topic.solutions).length} solutions`
          );
        }
      }
    }
  }

  const stats: Record<Category, number> = {
    dsa: 0,
    'system-design': 0,
    ood: 0,
    behavioral: 0,
    'design-pattern': 0,
  };
  for (const category of categories) {
    stats[category] = Object.keys(allContent[category] || {}).length;
  }

  const statsPath = path.join(outputDir, 'content-stats.json');
  fs.writeFileSync(statsPath, JSON.stringify(stats, null, 2));
  console.log(`📊 Generated stats: ${statsPath}`);

  console.log('🎉 Static content generation completed!');
  console.log('📈 Summary:', stats);
}

generateStaticContent().catch(console.error);


