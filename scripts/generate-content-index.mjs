#!/usr/bin/env node

import fs from 'fs-extra';
import path from 'path';
import { glob } from 'glob';
import matter from 'gray-matter';

const ROOT = process.cwd();
const CONTENT_DIR = path.join(ROOT, 'src', 'content', 'dsa');
const OUT_DIR = path.join(ROOT, 'src', 'data');
const OUT_FILE = path.join(OUT_DIR, 'dsa-index.json');

function generateSlugFromPath(filePath) {
  const parts = filePath.replace(/\\/g, '/').split('/');
  const fileName = parts[parts.length - 1];
  return fileName.replace(/\.md$/, '');
}

function createExcerpt(markdown, maxLength = 200) {
  const text = markdown
    .replace(/```[\s\S]*?```/g, '')
    .replace(/\!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/[##>*_`>-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return text.length > maxLength ? text.slice(0, maxLength - 1) + '…' : text;
}

async function main() {
  const exists = await fs.pathExists(CONTENT_DIR);
  if (!exists) {
    console.error(`Content directory not found: ${CONTENT_DIR}`);
    process.exit(1);
  }

  const files = await glob('**/*.md', { cwd: CONTENT_DIR, absolute: true });
  const items = [];

  for (const absPath of files) {
    try {
      const raw = await fs.readFile(absPath, 'utf8');
      const { data, content } = matter(raw);
      const id = generateSlugFromPath(absPath);

      const difficulty = (data.difficulty || 'medium').toLowerCase();
      const related = Array.isArray(data.topics) ? data.topics : undefined;

      items.push({
        id,
        title: data.title || id,
        difficulty: difficulty === 'easy' || difficulty === 'hard' ? difficulty : 'medium',
        timeComplexity: data.tc || undefined,
        spaceComplexity: data.sc || undefined,
        description: data.description || createExcerpt(content),
        companies: data.companies || undefined,
        leetcode: data.leetcode || undefined,
        gfg: data.gfg || undefined,
        interviewbit: data.interviewbit || undefined,
        hackerrank: data.hackerrank || undefined,
        examples: undefined,
        relatedTopics: related,
      });
    } catch (e) {
      console.warn(`Failed to parse ${absPath}:`, e.message);
    }
  }

  items.sort((a, b) => a.title.localeCompare(b.title));
  await fs.ensureDir(OUT_DIR);
  await fs.writeJson(OUT_FILE, items, { spaces: 2 });
  console.log(`Wrote ${items.length} items to ${OUT_FILE}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});


