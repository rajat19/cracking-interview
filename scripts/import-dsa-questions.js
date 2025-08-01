#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import matter from 'gray-matter';
import fs from 'fs-extra';
import { glob } from 'glob';
import path from 'path';

// Supabase configuration
const SUPABASE_URL = "https://nzjcbqwffrnpgebuntvh.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY environment variable is required');
  console.log('Get your service role key from: https://supabase.com/dashboard/project/nzjcbqwffrnpgebuntvh/settings/api');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

/**
 * Extract examples from markdown content
 */
function extractExamples(content) {
  const examples = [];
  const exampleRegex = /\*\*Example[s]?\s*(\d+):\*\*\s*\n```[\s\S]*?\n```/g;
  let match;
  
  while ((match = exampleRegex.exec(content)) !== null) {
    examples.push(match[0].trim());
  }
  
  return examples.length > 0 ? examples : null;
}

/**
 * Parse a single markdown file and return DSA question data
 */
async function parseMarkdownFile(filePath) {
  try {
    const fileContent = await fs.readFile(filePath, 'utf8');
    const { data: frontMatter, content } = matter(fileContent);
    
    // Extract examples from content
    const examples = extractExamples(content);
    
    // Map frontmatter to database schema
    const dsaQuestion = {
      title: frontMatter.title,
      difficulty: frontMatter.difficulty || 'medium',
      time_complexity: frontMatter.tc || null,
      space_complexity: frontMatter.sc || null,
      content: content.trim(),
      examples: examples,
      related_topics: frontMatter.topics || null,
      leetcode_identifier: frontMatter.leetcode || (frontMatter.leetid ? String(frontMatter.leetid) : null),
      hackerrank_identifier: frontMatter.hackerrank || null,
      gfg_identifier: frontMatter.gfg || null
    };
    
    // Validate required fields
    if (!dsaQuestion.title) {
      throw new Error('Title is required');
    }
    
    if (!dsaQuestion.content) {
      throw new Error('Content is required');
    }
    
    return dsaQuestion;
  } catch (error) {
    console.error(`❌ Error parsing file ${filePath}:`, error.message);
    return null;
  }
}

/**
 * Insert DSA question into database
 */
async function insertDSAQuestion(questionData) {
  try {
    const { data, error } = await supabase
      .from('dsa_questions')
      .insert([questionData])
      .select();
    
    if (error) {
      throw error;
    }
    
    return data[0];
  } catch (error) {
    console.error(`❌ Error inserting question "${questionData.title}":`, error.message);
    return null;
  }
}

/**
 * Main function to process all markdown files
 */
async function main() {
  console.log('🚀 Starting DSA questions import...');
  
  const contentDir = 'src/content';
  
  // Check if content directory exists
  if (!await fs.pathExists(contentDir)) {
    console.error(`❌ Content directory "${contentDir}" does not exist`);
    console.log('Please create the directory and add your markdown files');
    process.exit(1);
  }
  
  // Find all markdown files
  const markdownFiles = await glob('**/*.{md,markdown}', {
    cwd: contentDir,
    absolute: true
  });
  
  if (markdownFiles.length === 0) {
    console.log(`ℹ️  No markdown files found in "${contentDir}"`);
    return;
  }
  
  console.log(`📁 Found ${markdownFiles.length} markdown file(s)`);
  
  let successCount = 0;
  let errorCount = 0;
  
  // Process each file
  for (const filePath of markdownFiles) {
    const fileName = path.basename(filePath);
    console.log(`\n📄 Processing: ${fileName}`);
    
    // Parse markdown file
    const questionData = await parseMarkdownFile(filePath);
    if (!questionData) {
      errorCount++;
      continue;
    }
    
    // Check if question already exists
    const { data: existing } = await supabase
      .from('dsa_questions')
      .select('id')
      .eq('title', questionData.title)
      .single();
    
    if (existing) {
      console.log(`⚠️  Question "${questionData.title}" already exists, skipping...`);
      continue;
    }
    
    // Insert into database
    const insertedQuestion = await insertDSAQuestion(questionData);
    if (insertedQuestion) {
      console.log(`✅ Successfully imported: ${questionData.title}`);
      successCount++;
    } else {
      errorCount++;
    }
  }
  
  // Summary
  console.log('\n📊 Import Summary:');
  console.log(`✅ Successfully imported: ${successCount} questions`);
  console.log(`❌ Failed: ${errorCount} questions`);
  console.log(`📁 Total processed: ${markdownFiles.length} files`);
  
  if (successCount > 0) {
    console.log('\n🎉 Import completed successfully!');
  }
}

// Run the script
main().catch(error => {
  console.error('💥 Script failed:', error);
  process.exit(1);
});