#!/usr/bin/env node

import fs from 'fs-extra';
import path from 'path';
import url from 'url';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

async function main() {
  const jekyllRoot = process.env.JEKYLL_ROOT || path.resolve(__dirname, '../../interview-questions');
  const sourceDir = path.resolve(jekyllRoot, 'posts/_questions');
  const targetDir = path.resolve(__dirname, '../src/content/dsa');
  const sourceSolutionsDir = path.resolve(jekyllRoot, '_includes/code');
  const targetSolutionsDir = path.resolve(__dirname, '../src/content/solutions');

  const exists = await fs.pathExists(sourceDir);
  if (!exists) {
    console.error(`Source directory not found: ${sourceDir}`);
    process.exit(1);
  }

  await fs.ensureDir(targetDir);
  await fs.ensureDir(targetSolutionsDir);

  const files = await fs.readdir(sourceDir);
  const mdFiles = files.filter(f => f.endsWith('.md'));
  let copied = 0;

  for (const file of mdFiles) {
    const src = path.join(sourceDir, file);
    const dest = path.join(targetDir, file);
    await fs.copy(src, dest);
    copied++;
  }

  console.log(`Copied ${copied} markdown files to ${targetDir}`);

  // Copy solutions tree if present
  if (await fs.pathExists(sourceSolutionsDir)) {
    await fs.copy(sourceSolutionsDir, targetSolutionsDir, { overwrite: true });
    console.log(`Copied solutions to ${targetSolutionsDir}`);
  } else {
    console.warn(`Solutions directory not found: ${sourceSolutionsDir}`);
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});


