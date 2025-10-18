import fs from 'node:fs';
import path from 'node:path';
import { mkdir, writeFile } from 'node:fs/promises';
import { createInterface } from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

// Optional: reuse language extension mapping from the app
// If this import ever fails in CLI context, we fall back to a local mapping below
let LANGUAGE_EXT_MAP: Record<string, { name: string; extension: string }>; // lazy init

async function loadLanguageMap(): Promise<Record<string, { name: string; extension: string }>> {
  if (LANGUAGE_EXT_MAP) return LANGUAGE_EXT_MAP;
  try {
    // Prefer importing from app config to keep mapping consistent
    const mod = await import('../src/config/language');
    LANGUAGE_EXT_MAP = (mod as any).LANGUAGES_MAP ?? (mod as any).default ?? {};
    return LANGUAGE_EXT_MAP;
  } catch {
    // Fallback minimal map
    LANGUAGE_EXT_MAP = {
      java: { name: 'Java', extension: 'java' },
      py: { name: 'Python', extension: 'py' },
      js: { name: 'JavaScript', extension: 'js' },
      ts: { name: 'TypeScript', extension: 'ts' },
      cpp: { name: 'C++', extension: 'cpp' },
      c: { name: 'C', extension: 'c' },
      go: { name: 'Go', extension: 'go' },
      cs: { name: 'C#', extension: 'cs' },
      rb: { name: 'Ruby', extension: 'rb' },
      rs: { name: 'Rust', extension: 'rs' },
      kt: { name: 'Kotlin', extension: 'kt' },
      swift: { name: 'Swift', extension: 'swift' },
      dart: { name: 'Dart', extension: 'dart' },
      php: { name: 'PHP', extension: 'php' },
      sql: { name: 'SQL', extension: 'sql' },
      sh: { name: 'Bash', extension: 'sh' },
      scala: { name: 'Scala', extension: 'scala' },
    };
    return LANGUAGE_EXT_MAP;
  }
}

// GraphQL query copied from the legacy Python script
const QUESTION_QUERY = `
query questionData($titleSlug: String!) {
  question(titleSlug: $titleSlug) {
    questionId
    title
    titleSlug
    content
    difficulty
    exampleTestcases
    categoryTitle
    topicTags { name slug translatedName }
  }
}`;

type LeetTag = { name: string; slug: string; translatedName?: string | null };
type LeetQuestion = {
  questionId: string;
  title: string;
  titleSlug: string;
  content: string;
  difficulty: string;
  exampleTestcases?: string;
  categoryTitle?: string;
  topicTags: LeetTag[];
};

function formatComplexity(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return '';
  return trimmed.startsWith('O') ? trimmed : `O(${trimmed})`;
}

function decodeHtml(html: string): string {
  return html
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
}

function htmlToMdx(rawHtml: string): string {
  let s = decodeHtml(rawHtml);

  // Normalize excessive blank lines first
  s = s.replace(/\n\n+/g, '\n');

  // Block code: wrap <pre>...</pre> blocks with fenced code
  s = s.replace(/<pre[^>]*>([\s\S]*?)<\/pre>/g, (_m, inner) => {
    return '```' + inner + '```';
  });

  // Inline code
  s = s.replace(/<code>([\s\S]*?)<\/code>/g, (_m, inner) => `\`${inner}\``);

  // Strong/emphasis
  s = s.replace(/<strong[^>]*>([\s\S]*?)<\/strong>/g, '**$1**');
  s = s.replace(/<em>([\s\S]*?)<\/em>/g, '*$1*');

  // Paragraphs → add line breaks
  s = s.replace(/<p>([\s\S]*?)<\/p>/g, '$1\n');

  // Lists
  s = s.replace(/<ul>/g, '');
  s = s.replace(/<\/ul>/g, '');
  s = s.replace(/<li>([\s\S]*?)<\/li>/g, '\n* $1');

  // Minor cleanups
  s = s.replace(/\*\*Input:\*\*/g, 'Input:');
  s = s.replace(/\*\*Output:\*\*/g, 'Output:');
  s = s.replace(/\*\*Explanation:\*\*/g, 'Explanation:');
  s = s.replace(/\u00A0/g, ' '); // non-breaking space

  // Insert a heading before Example 1
  s = s.replace(/(\*\*Example 1:\*\*)/, '---\n## Test Cases\n$1');

  // Collapse 3+ newlines to 2
  s = s.replace(/\n{3,}/g, '\n\n');

  return s.trim();
}

function buildFrontmatter(params: {
  title: string;
  difficulty: string; // lower-case
  tags: string[];
  langs: string[];
  tc?: string;
  sc?: string;
  companies?: string[];
  leetid: string;
  leetcode: string;
  gfg?: string;
  hackerrank?: string;
  interviewbit?: string;
}): string {
  const lines: string[] = ['---'];
  const pushList = (key: string, arr?: string[]) => {
    if (!arr || arr.length === 0) return;
    lines.push(`${key}: [${arr.join(', ')}]`);
  };
  const pushStr = (key: string, val?: string) => {
    if (val === undefined) return;
    lines.push(`${key}: ${val}`);
  };

  lines.push(`title: ${params.title}`);
  lines.push(`difficulty: ${params.difficulty}`);
  pushList('tags', params.tags);
  pushList('langs', params.langs);
  if (params.tc) pushStr('tc', params.tc);
  if (params.sc) pushStr('sc', params.sc);
  pushList('companies', params.companies);
  pushStr('leetid', params.leetid);
  pushStr('leetcode', params.leetcode);
  pushStr('gfg', params.gfg);
  pushStr('hackerrank', params.hackerrank);
  pushStr('interviewbit', params.interviewbit);
  lines.push('---');
  return lines.join('\n');
}

async function fetchQuestion(slug: string): Promise<LeetQuestion> {
  const res = await fetch('https://leetcode.com/graphql', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({ query: QUESTION_QUERY, variables: { titleSlug: slug } }),
  });
  if (!res.ok) {
    throw new Error(`LeetCode API error: ${res.status} ${res.statusText}`);
  }
  const json = (await res.json()) as { data?: { question?: LeetQuestion } };
  const q = json.data?.question;
  if (!q) throw new Error('Question not found. Check the slug.');
  return q;
}

async function ensureDir(dir: string) {
  await mkdir(dir, { recursive: true });
}

async function writeMdxFile(category: string, slug: string, frontmatter: string, body: string) {
  const postsDir = path.join(process.cwd(), 'src', 'content', category, 'posts');
  await ensureDir(postsDir);
  const filePath = path.join(postsDir, `${slug}.mdx`);
  const content = `${frontmatter}\n${body}\n`;
  await writeFile(filePath, content, 'utf8');
  return filePath;
}

async function createSolutionFiles(category: string, slug: string, langs: string[]) {
  const langMap = await loadLanguageMap();
  const codeDir = path.join(process.cwd(), 'src', 'content', category, 'code', slug);
  await ensureDir(codeDir);

  const created: string[] = [];
  for (const lang of langs) {
    const ext = langMap[lang]?.extension ?? lang;
    const filePath = path.join(codeDir, `solution.${ext}`);
    if (!fs.existsSync(filePath)) {
      await writeFile(filePath, '', 'utf8');
      created.push(filePath);
    }
  }
  return created;
}

async function main() {
  const rl = createInterface({ input, output });
  try {
    const slug = (await rl.question('Leetcode slug (titleSlug, e.g., two-sum): ')).trim();
    if (!slug) throw new Error('Slug is required.');

    const category =
      (
        await rl.question(
          'Category [dsa | system-design | ood | behavioral | design-pattern] (default dsa): '
        )
      )
        .trim()
        .toLowerCase() || 'dsa';

    const tcIn = (await rl.question('Time complexity [O(...) or e.g., n log n]: ')).trim();
    const scIn = (await rl.question('Space complexity [O(...) or e.g., n]: ')).trim();
    const langsIn = (await rl.question('Languages (space-separated, default java): ')).trim();
    const companiesIn = (await rl.question('Companies (space-separated, optional): ')).trim();
    const gfg = (await rl.question('GeeksForGeeks slug (optional): ')).trim();
    const hackerrank = (await rl.question('HackerRank slug (optional): ')).trim();
    const interviewbit = (await rl.question('InterviewBit slug (optional): ')).trim();

    const langs = (langsIn || 'java').split(/\s+/).filter(Boolean);
    const companies = companiesIn ? companiesIn.split(/\s+/).filter(Boolean) : [];
    const tc = formatComplexity(tcIn);
    const sc = formatComplexity(scIn);

    const q = await fetchQuestion(slug);

    // Build MDX body
    const body = htmlToMdx(q.content);

    // Prepare frontmatter according to ITopic/frontmatter usage in the app
    const frontmatter = buildFrontmatter({
      title: q.title,
      difficulty: (q.difficulty || 'medium').toLowerCase(),
      tags: (q.topicTags || []).map(t => t.slug).filter(Boolean),
      langs,
      tc,
      sc,
      companies,
      leetid: q.questionId,
      leetcode: q.titleSlug,
      gfg: gfg || undefined,
      hackerrank: hackerrank || undefined,
      interviewbit: interviewbit || undefined,
    });

    const postPath = await writeMdxFile(category, slug, frontmatter, body);
    const createdSolutions = await createSolutionFiles(category, slug, langs);

    output.write(`\nCreated MDX: ${postPath}\n`);
    if (createdSolutions.length > 0) {
      output.write(`Created solution files:\n- ${createdSolutions.join('\n- ')}\n`);
    } else {
      output.write('No new solution files created (already existed).\n');
    }
  } finally {
    rl.close();
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
