import { useState, useEffect } from 'react';
import { loadMdxCodeSimple, SolutionEntry } from '@/lib/simpleCodeLoader';

import SolutionTabs from '@/components//SolutionTabs';

interface MdxCodeTabsProps {
  langs: string[];
  path: string;
}

export function MdxCodeTabs({ langs, path }: MdxCodeTabsProps) {
  const [solutions, setSolutions] = useState<Record<string, SolutionEntry>>({});
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadAllFiles = async () => {
      setLoading(true);
      let loadedFiles: Record<string, SolutionEntry> = {};
      
      try {
        loadedFiles = await loadMdxCodeSimple(path, langs);
        
        if (!loadedFiles) {
          console.warn(`No code examples found for design: ${path}`);
          loadedFiles = {};
        }
      } catch (err) {
        console.error(`Error loading code examples for ${path}:`, err);
        loadedFiles = {};
      } finally {
        setSolutions(loadedFiles || {});
        setLoading(false);
      }
    };
    
    loadAllFiles();
  }, [langs, path]);
  
  if (loading) {
    return (
      <div className="my-6 p-6 border border-border rounded-lg bg-muted/20">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
          <span className="text-sm text-muted-foreground">Loading code files...</span>
        </div>
      </div>
    );
  }

  // Check if we have any solutions
  if (!solutions || Object.keys(solutions).length === 0) {
    return (
      <div className="my-6 p-6 border border-border rounded-lg bg-muted/20">
        <div className="text-sm text-muted-foreground">
          <p>Code examples not available for this section.</p>
          <p className="text-xs mt-1">Path: {path}</p>
        </div>
      </div>
    );
  }

  return (
    <SolutionTabs solutions={solutions} showHeader={false} />
  );
}
