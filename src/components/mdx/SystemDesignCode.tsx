import { useState, useEffect } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useTheme } from '@/contexts/ThemeContext';
import { LANGUAGES_MAP } from '@/types/language';
import { loadSystemDesignCodeSimple } from '@/lib/simpleCodeLoader';

interface SystemDesignCodeProps {
  file: string;
  design: string; // e.g., "library-management"
  title?: string;
  description?: string;
}

export function SystemDesignCode({ file, design, title, description }: SystemDesignCodeProps) {
  const [code, setCode] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { theme } = useTheme();
  
  // Extract file extension for syntax highlighting
  const fileExtension = file.split('.').pop()?.toLowerCase() || '';
  const languageInfo = LANGUAGES_MAP[fileExtension];
  const syntaxStyle = theme === 'dark' ? oneDark : oneLight;
  
  useEffect(() => {
    const loadCode = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Use the simple code loader to get code
        const codeExamples = await loadSystemDesignCodeSimple(design);
        console.log(`Loading code for design: ${design}, file: ${file}`);
        console.log('Code examples result:', codeExamples);
        
        if (!codeExamples) {
          throw new Error(`No code examples found for design: ${design}`);
        }
        
        console.log('Available code examples:', Object.keys(codeExamples));
        
        // Try to get the code example directly by filename
        const codeExample = codeExamples[file];
        
        if (codeExample && codeExample.code) {
          console.log('Found code example by filename:', file);
          setCode(codeExample.code);
        } else {
          console.log('Code file not found:', file);
          console.log('Available files:', Object.keys(codeExamples));
          throw new Error(`Code file not found: ${file}`);
        }
      } catch (err) {
        console.error(`Failed to load code file: ${file}`, err);
        setError(`Failed to load ${file}`);
      } finally {
        setLoading(false);
      }
    };
    
    loadCode();
  }, [file, design]);
  
  if (loading) {
    return (
      <div className="my-6 p-6 border border-border rounded-lg bg-muted/20">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
          <span className="text-sm text-muted-foreground">Loading {file}...</span>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="my-6 p-4 border border-destructive/20 rounded-lg bg-destructive/5">
        <h4 className="text-destructive font-medium mb-2">Code Loading Error</h4>
        <p className="text-destructive text-sm">
          Failed to load: <code className="bg-destructive/10 px-1 rounded">{file}</code>
        </p>
        <p className="text-muted-foreground text-xs mt-1">
          Expected path: <code className="bg-muted px-1 rounded">
            /src/content/system-design/code/{design}/{file}
          </code>
        </p>
      </div>
    );
  }
  
  return (
    <div className="my-6">
      {(title || description) && (
        <div className="mb-3">
          {title && (
            <h4 className="text-lg font-medium text-foreground mb-1">{title}</h4>
          )}
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      )}
      
      <div className="relative">
        {/* File header */}
        <div className="flex items-center justify-between bg-muted/50 px-4 py-2 rounded-t-lg border border-b-0 border-border">
          <div className="flex items-center space-x-2">
            {languageInfo && (
              <img 
                src={`${import.meta.env.BASE_URL}assets/img/lang/${fileExtension}.svg`}
                alt={languageInfo.name}
                className="w-4 h-4"
              />
            )}
            <span className="text-sm font-mono text-foreground">{file}</span>
            {languageInfo && (
              <span className="text-xs text-muted-foreground">({languageInfo.name})</span>
            )}
          </div>
        </div>
        
        {/* Code content */}
        <div className="border border-border rounded-b-lg overflow-hidden">
          <SyntaxHighlighter
            language={languageInfo?.extension || 'text'}
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
            {code}
          </SyntaxHighlighter>
        </div>
      </div>
    </div>
  );
}
