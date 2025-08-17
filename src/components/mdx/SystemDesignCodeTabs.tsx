import { useState, useEffect } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useTheme } from '@/contexts/ThemeContext';
import { LANGUAGES_MAP } from '@/types/language';
import { loadSystemDesignCodeSimple } from '@/lib/simpleCodeLoader';

interface SystemDesignCodeTabsProps {
  files: string[];
  design: string; // e.g., "library-management"
  title?: string;
  description?: string;
}

interface CodeFile {
  filename: string;
  code: string;
  language: string;
  extension: string;
  error?: string;
}

export function SystemDesignCodeTabs({ files, design, title, description }: SystemDesignCodeTabsProps) {
  const [codeFiles, setCodeFiles] = useState<CodeFile[]>([]);
  const [activeTab, setActiveTab] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();
  
  const syntaxStyle = theme === 'dark' ? oneDark : oneLight;
  
  useEffect(() => {
    const loadAllFiles = async () => {
      setLoading(true);
      const loadedFiles: CodeFile[] = [];
      
      try {
        // Load all code examples for this design
        const codeExamples = await loadSystemDesignCodeSimple(design);
        
        if (!codeExamples) {
          throw new Error(`No code examples found for design: ${design}`);
        }
        
        for (const file of files) {
          const extension = file.split('.').pop()?.toLowerCase() || '';
          const languageInfo = LANGUAGES_MAP[extension];
          
          // Find the code example for this file
          const codeExample = codeExamples[file];
          
          if (codeExample) {
            loadedFiles.push({
              filename: file,
              code: codeExample.code,
              language: languageInfo?.name || extension.toUpperCase(),
              extension,
              error: undefined,
            });
          } else {
            loadedFiles.push({
              filename: file,
              code: '',
              language: extension.toUpperCase(),
              extension,
              error: `Failed to load ${file}`,
            });
          }
        }
      } catch (err) {
        console.error('Failed to load code examples:', err);
        // Create error entries for all files
        for (const file of files) {
          const extension = file.split('.').pop()?.toLowerCase() || '';
          loadedFiles.push({
            filename: file,
            code: '',
            language: extension.toUpperCase(),
            extension,
            error: `Failed to load ${file}`,
          });
        }
      }
      
      setCodeFiles(loadedFiles);
      if (loadedFiles.length > 0) {
        setActiveTab(loadedFiles[0].filename);
      }
      setLoading(false);
    };
    
    loadAllFiles();
  }, [files, design]);
  
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
  
  const activeFile = codeFiles.find(f => f.filename === activeTab);
  
  return (
    <div className="my-6">
      {(title || description) && (
        <div className="mb-4">
          {title && (
            <h4 className="text-lg font-medium text-foreground mb-1">{title}</h4>
          )}
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      )}
      
      {/* Tab Headers */}
      <div className="flex flex-wrap gap-1 mb-0 bg-muted/30 p-1 rounded-t-lg border border-b-0 border-border">
        {codeFiles.map((file) => (
          <button
            key={file.filename}
            onClick={() => setActiveTab(file.filename)}
            className={`flex items-center space-x-2 px-3 py-2 rounded text-sm font-medium transition-all duration-200 ${
              activeTab === file.filename
                ? 'bg-background text-foreground shadow-sm border border-border'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            {LANGUAGES_MAP[file.extension] && (
              <img 
                src={`${import.meta.env.BASE_URL}assets/img/lang/${file.extension}.svg`}
                alt={file.language}
                className="w-4 h-4"
              />
            )}
            <span>{file.filename}</span>
            {file.error && (
              <span className="w-2 h-2 bg-destructive rounded-full" title="Failed to load" />
            )}
          </button>
        ))}
      </div>
      
      {/* Code Content */}
      {activeFile && (
        <div className="border border-border rounded-b-lg overflow-hidden">
          {activeFile.error ? (
            <div className="p-4 bg-destructive/5 text-destructive">
              <p className="font-medium">Error loading file</p>
              <p className="text-sm">{activeFile.error}</p>
            </div>
          ) : (
            <SyntaxHighlighter
              language={LANGUAGES_MAP[activeFile.extension]?.extension || 'text'}
              style={syntaxStyle}
              customStyle={{
                margin: 0,
                padding: '1.5rem',
                fontSize: '0.875rem',
                lineHeight: '1.5',
                borderRadius: 0,
              }}
              showLineNumbers
              codeTagProps={{ className: 'text-sm' }}
            >
              {activeFile.code}
            </SyntaxHighlighter>
          )}
        </div>
      )}
    </div>
  );
}
