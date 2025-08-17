import { useState, useEffect, useMemo } from 'react';
import { MDXProvider } from '@mdx-js/react';
import { compile, run } from '@mdx-js/mdx';
import * as runtime from 'react/jsx-runtime';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useTheme } from '@/contexts/ThemeContext';
import { SystemDesignImage } from '@/components/mdx/SystemDesignImage';
import { SystemDesignCode } from '@/components/mdx/SystemDesignCode';
import { SystemDesignCodeTabs } from '@/components/mdx/SystemDesignCodeTabs';

// Types for MDX component props
interface MDXComponentProps {
  children?: React.ReactNode;
  className?: string;
  href?: string;
  src?: string;
  alt?: string;
  [key: string]: unknown;
}

interface MDXRendererProps {
  content: string;
}

// Custom components for MDX rendering
const createMDXComponents = (isDark: boolean) => ({
  // Custom code block component
  pre: ({ children, ...props }: MDXComponentProps) => {
    // Extract code content and language from children
    let language = 'text';
    let code = '';
    
    if (children && typeof children === 'object' && 'props' in children) {
      const childElement = children as { props?: { className?: string; children?: string } };
      language = childElement.props?.className?.replace('language-', '') || 'text';
      code = childElement.props?.children || '';
    } else if (typeof children === 'string') {
      code = children;
    }
    
    return (
      <div className="my-6">
        <SyntaxHighlighter
          language={language}
          style={isDark ? oneDark : oneLight}
          customStyle={{
            margin: 0,
            padding: '1.5rem',
            fontSize: '0.875rem',
            lineHeight: '1.5',
            borderRadius: '0.5rem',
            border: '1px solid hsl(var(--border))',
          }}
          codeTagProps={{ className: 'text-sm' }}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    );
  },
  
  // Custom headings with better styling
  h1: ({ children, ...props }: MDXComponentProps) => (
    <h1 className="text-3xl font-semibold text-foreground mt-8 mb-4 border-b border-border pb-2 font-sans tracking-tight" style={{ color: 'hsl(var(--foreground))' }} {...props}>
      {children}
    </h1>
  ),
  
  h2: ({ children, ...props }: MDXComponentProps) => (
    <h2 className="text-2xl font-semibold text-foreground mt-6 mb-3 font-sans tracking-tight" style={{ color: 'hsl(var(--foreground))' }} {...props}>
      {children}
    </h2>
  ),
  
  h3: ({ children, ...props }: MDXComponentProps) => (
    <h3 className="text-xl font-medium text-foreground mt-5 mb-2 font-sans tracking-tight" style={{ color: 'hsl(var(--foreground))' }} {...props}>
      {children}
    </h3>
  ),
  
  // Custom paragraph with better spacing
  p: ({ children, ...props }: MDXComponentProps) => (
    <p className="text-foreground/90 leading-relaxed mb-4 font-sans" style={{ color: 'hsl(var(--foreground))' }} {...props}>
      {children}
    </p>
  ),
  
  // Custom list styling
  ul: ({ children, ...props }: MDXComponentProps) => (
    <ul className="list-disc list-inside text-foreground space-y-2 mb-4 ml-4 font-sans" style={{ color: 'hsl(var(--foreground))' }} {...props}>
      {children}
    </ul>
  ),
  
  ol: ({ children, ...props }: MDXComponentProps) => (
    <ol className="list-decimal list-inside text-foreground space-y-2 mb-4 ml-4 font-sans" style={{ color: 'hsl(var(--foreground))' }} {...props}>
      {children}
    </ol>
  ),
  
  li: ({ children, ...props }: MDXComponentProps) => (
    <li className="text-foreground font-sans" style={{ color: 'hsl(var(--foreground))' }} {...props}>
      {children}
    </li>
  ),
  
  // Custom blockquote
  blockquote: ({ children, ...props }: MDXComponentProps) => (
    <blockquote className="border-l-4 border-primary pl-4 py-2 my-4 bg-muted/30 rounded-r" {...props}>
      {children}
    </blockquote>
  ),
  
  // Custom table styling
  table: ({ children, ...props }: MDXComponentProps) => (
    <div className="overflow-x-auto my-6">
      <table className="min-w-full border border-border rounded-lg" {...props}>
        {children}
      </table>
    </div>
  ),
  
  thead: ({ children, ...props }: MDXComponentProps) => (
    <thead className="bg-muted/50" {...props}>
      {children}
    </thead>
  ),
  
  th: ({ children, ...props }: MDXComponentProps) => (
    <th className="border border-border px-4 py-2 text-left font-semibold text-foreground" {...props}>
      {children}
    </th>
  ),
  
  td: ({ children, ...props }: MDXComponentProps) => (
    <td className="border border-border px-4 py-2 text-foreground" {...props}>
      {children}
    </td>
  ),
  
  // Custom inline code
  code: ({ children, ...props }: MDXComponentProps) => (
    <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-foreground font-medium" {...props}>
      {children}
    </code>
  ),
  
  // Custom horizontal rule
  hr: ({ ...props }: MDXComponentProps) => (
    <hr className="border-border my-8" {...props} />
  ),
  
  // Custom link styling
  a: ({ children, href, ...props }: MDXComponentProps) => (
    <a 
      href={href} 
      className="text-primary hover:text-primary/80 underline underline-offset-4 transition-colors" 
      target="_blank" 
      rel="noopener noreferrer"
      {...props}
    >
      {children}
    </a>
  ),
  
  // Custom image with responsive styling
  img: ({ src, alt, ...props }: MDXComponentProps) => (
    <img 
      src={src} 
      alt={alt} 
      className="max-w-full h-auto rounded-lg border border-border my-4 mx-auto" 
      {...props} 
    />
  ),
  
  // Custom MDX components for system design
  SystemDesignImage,
  SystemDesignCode,
  SystemDesignCodeTabs,
});

export function MDXRenderer({ content }: MDXRendererProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [MDXContent, setMDXContent] = useState<React.ComponentType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Create components once
  const baseComponents = useMemo(() => createMDXComponents(isDark), [isDark]);
  
  // Memoize components to avoid re-compilation
  const mdxComponents = useMemo(() => ({
    ...baseComponents,
    SystemDesignImage,
    SystemDesignCode,
    SystemDesignCodeTabs,
  }), [baseComponents]);
  
  useEffect(() => {
    const compileAndRun = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Compile MDX to JavaScript with components available
        const compiled = await compile(content, {
          outputFormat: 'function-body',
          development: false,
        });
        
        // Run the compiled MDX
        const { default: MDXComponent } = await run(compiled, runtime);
        
        // Create a wrapper that provides components to the MDX component
        const WrappedComponent = () => (
          <MDXProvider components={mdxComponents}>
            <MDXComponent />
          </MDXProvider>
        );
        
        setMDXContent(() => WrappedComponent);
      } catch (err) {
        console.error('Failed to compile MDX:', err);
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    };
    
    compileAndRun();
  }, [content, mdxComponents]);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2 text-muted-foreground">Rendering MDX...</span>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="text-destructive p-4 border border-destructive/20 rounded-lg bg-destructive/5">
        <h3 className="font-semibold mb-2">MDX Compilation Error</h3>
        <p>Failed to render MDX content. Please check the syntax.</p>
        <details className="mt-2">
          <summary className="cursor-pointer">Error Details</summary>
          <pre className="mt-2 text-sm overflow-auto">{error}</pre>
        </details>
      </div>
    );
  }
  
  if (!MDXContent) {
    return (
      <div className="text-muted-foreground p-4">
        No content to display.
      </div>
    );
  }
  
  return (
    <div className="prose prose-slate dark:prose-invert max-w-none font-sans">
      <MDXContent />
    </div>
  );
}
