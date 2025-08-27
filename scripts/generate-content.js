const fs = require('fs');
const path = require('path');
const fm = require('front-matter');

// Categories to process
const categories = ['dsa', 'system-design', 'ood', 'behavioral'];

// Output directory for generated content
const outputDir = path.join(process.cwd(), 'src/data/generated');

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Function to load code solutions for a topic (handles subdirectories)
function loadCodeSolutions(category, topicId) {
  const codeDir = path.join(process.cwd(), `src/content/${category}/code/${topicId}`);
  const solutions = {};
  
  if (!fs.existsSync(codeDir)) {
    return solutions;
  }
  
  // Recursive function to scan directories for solution files
  function scanDirectory(dir, subPath = '') {
    try {
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const itemPath = path.join(dir, item);
        const stat = fs.statSync(itemPath);
        
        if (stat.isDirectory()) {
          // Recursively scan subdirectories
          scanDirectory(itemPath, path.join(subPath, item));
        } else if (stat.isFile()) {
          const ext = path.extname(item).slice(1); // Remove the dot
          const baseName = path.basename(item, path.extname(item));
          
          // Only process solution files
          if (baseName === 'solution' && ext) {
            try {
              const code = fs.readFileSync(itemPath, 'utf-8');
              const solutionKey = subPath ? `${subPath.replace(/\//g, '_')}_${ext}` : ext;
              solutions[solutionKey] = {
                language: ext,
                code: code.trim(),
                subPath: subPath || '', // Track which subdirectory this came from
                fileName: item
              };
            } catch (error) {
              console.warn(`⚠️  Failed to read code file: ${itemPath}`, error.message);
            }
          }
        }
      }
    } catch (error) {
      console.warn(`⚠️  Error reading directory: ${dir}`, error.message);
    }
  }
  
  scanDirectory(codeDir);
  return solutions;
}

async function generateStaticContent() {
  console.log('🚀 Starting static content generation...');
  
  const allContent = {};
  
  for (const category of categories) {
    console.log(`📁 Processing ${category} category...`);
    
    const postsDir = path.join(process.cwd(), `src/content/${category}/posts`);
    
    if (!fs.existsSync(postsDir)) {
      console.log(`⚠️  Directory not found: ${postsDir}`);
      continue;
    }
    
    const files = fs.readdirSync(postsDir).filter(file => file.endsWith('.mdx'));
    console.log(`📄 Found ${files.length} MDX files in ${category}`);
    
    allContent[category] = {};
    
    for (const file of files) {
      const filePath = path.join(postsDir, file);
      const topicId = path.basename(file, '.mdx');
      
      try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const parsed = fm(content);
        
        // Load code solutions for this topic
        const solutions = loadCodeSolutions(category, topicId);
        const solutionCount = Object.keys(solutions).length;
        
        // Store both metadata and full content
        allContent[category][topicId] = {
          id: topicId,
          title: parsed.attributes.title || topicId,
          difficulty: parsed.attributes.difficulty || 'medium',
          companies: parsed.attributes.companies || [],
          topics: parsed.attributes.topics || [],
          langs: parsed.attributes.langs || [],
          tc: parsed.attributes.tc,
          sc: parsed.attributes.sc,
          leetcode: parsed.attributes.leetcode,
          gfg: parsed.attributes.gfg,
          leetid: parsed.attributes.leetid,
          // Store the full MDX content
          content: content,
          // Store just the body (without frontmatter)
          body: parsed.body,
          // Store code solutions
          solutions: solutions
        };
        
        console.log(`✅ Processed: ${category}/${topicId} (${solutionCount} solutions)`);
      } catch (error) {
        console.error(`❌ Error processing ${category}/${file}:`, error.message);
      }
    }
  }
  
  // Write the complete content map
  const contentMapPath = path.join(outputDir, 'content-map.json');
  fs.writeFileSync(contentMapPath, JSON.stringify(allContent, null, 2));
  console.log(`📦 Generated content map: ${contentMapPath}`);
  
  // Create individual category files (without solutions for smaller size)
  for (const category of categories) {
    if (allContent[category]) {
      const categoryContentWithoutSolutions = {};
      for (const [topicId, topic] of Object.entries(allContent[category])) {
        categoryContentWithoutSolutions[topicId] = {
          ...topic,
          solutions: {} // Remove solutions to keep files small
        };
      }
      
      const categoryPath = path.join(outputDir, `${category}-content.json`);
      fs.writeFileSync(categoryPath, JSON.stringify(categoryContentWithoutSolutions, null, 2));
      console.log(`📦 Generated ${category} content: ${categoryPath} (${Object.keys(allContent[category]).length} topics)`);
    }
  }
  
  // Create individual solution files for better performance
  for (const category of categories) {
    if (allContent[category]) {
      const solutionsDir = path.join(outputDir, 'solutions', category);
      if (!fs.existsSync(solutionsDir)) {
        fs.mkdirSync(solutionsDir, { recursive: true });
      }
      
      for (const [topicId, topic] of Object.entries(allContent[category])) {
        if (topic.solutions && Object.keys(topic.solutions).length > 0) {
          const solutionPath = path.join(solutionsDir, `${topicId}.json`);
          fs.writeFileSync(solutionPath, JSON.stringify(topic.solutions, null, 2));
          console.log(`🔧 Generated solutions for ${category}/${topicId}: ${Object.keys(topic.solutions).length} solutions`);
        }
      }
    }
  }
  
  // Generate summary stats
  const stats = {};
  for (const category of categories) {
    stats[category] = Object.keys(allContent[category] || {}).length;
  }
  
  const statsPath = path.join(outputDir, 'content-stats.json');
  fs.writeFileSync(statsPath, JSON.stringify(stats, null, 2));
  console.log(`📊 Generated stats: ${statsPath}`);
  
  console.log('🎉 Static content generation completed!');
  console.log('📈 Summary:', stats);
}

// Run the generation
generateStaticContent().catch(console.error);
