'use client';

import { useState, useEffect } from 'react';
import SolutionTabs from '@/components/SolutionTabs';
import { ISolutionEntry } from '@/types/topic';
import { LANGUAGES_MAP } from '@/types/language';

interface MdxCodeTabsProps {
  langs: string[];
  path: string;
}

// MdxCodeTabs now uses pre-generated solutions from SSG

export function MdxCodeTabs({ langs, path }: MdxCodeTabsProps) {
  const [solutions, setSolutions] = useState<Record<string, ISolutionEntry>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSolutions = async () => {
      setLoading(true);
      try {
        // Extract category and topic from path
        // path format: "system-design/code/library-management" or "system-design/code/movie-booking/enums"
        const pathParts = path.split('/');
        const category = pathParts[0];
        
        // Find the topic ID and subdirectory from the path
        // Path format: "system-design/code/movie-booking/enums" or "dsa/code/basic-calculator"
        const codeIndex = pathParts.indexOf('code');
        const topicId = codeIndex >= 0 && codeIndex + 1 < pathParts.length ? pathParts[codeIndex + 1] : pathParts[pathParts.length - 1];
        const subDirectory = codeIndex >= 0 && codeIndex + 2 < pathParts.length ? pathParts[codeIndex + 2] : null;

        try {
          // Load individual solution file for better performance
          const solutionsModule = await import(`@/data/generated/solutions/${category}/${topicId}.json`);
          const allSolutions = solutionsModule.default as Record<string, any>;
          
          let filteredSolutions = allSolutions;
          
          // If we have a subdirectory, filter solutions to only show those from that subdirectory
          if (subDirectory) {
            filteredSolutions = Object.fromEntries(
              Object.entries(allSolutions).filter(([key, solution]) => 
                key.startsWith(`${subDirectory}_`)
              )
            );
          }
          
          setSolutions(filteredSolutions);
        } catch (error) {
          // Fallback: try loading from the category file (legacy support)
          try {
            const contentMap = await import(`@/data/generated/${category}-content.json`);
            const topicContent = (contentMap.default as any)[topicId];
            if (topicContent && topicContent.solutions) {
              let filteredSolutions = topicContent.solutions;
              
              if (subDirectory) {
                filteredSolutions = Object.fromEntries(
                  Object.entries(topicContent.solutions).filter(([key, solution]) => 
                    key.startsWith(`${subDirectory}_`)
                  )
                );
              }
              
              setSolutions(filteredSolutions);
            } else {
              setSolutions({});
            }
          } catch (fallbackError) {
            setSolutions({});
          }
        }
      } finally {
        setLoading(false);
      }
    };

    loadSolutions();
  }, [path, langs]);

  if (loading) {
    return (
      <div className="my-6 p-6 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span className="text-sm text-gray-600 dark:text-gray-400">Loading code examples...</span>
        </div>
      </div>
    );
  }

  // Check if we have any solutions
  if (!solutions || Object.keys(solutions).length === 0) {
    return (
      <div className="my-6 p-6 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          <p>💻 Code examples available in repository</p>
          <p className="text-xs mt-2 font-mono bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">
            src/content/{path}/solution.{'{'}ext{'}'}
          </p>
          <p className="text-xs mt-1">Languages: {langs.join(', ')}</p>
          <p className="text-xs mt-2 text-blue-600 dark:text-blue-400">
            <a 
              href={`https://github.com/your-username/cracking-interview/tree/nextjs/src/content/${path}`}
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:underline"
            >
              View on GitHub →
            </a>
          </p>
        </div>
      </div>
    );
  }

  return <SolutionTabs solutions={solutions} showHeader={false} />;
}
