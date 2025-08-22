import React, { useState, useEffect, useMemo } from 'react';
import { evaluate } from '@mdx-js/mdx';
import * as prodRuntime from 'react/jsx-runtime';
import * as devRuntime from 'react/jsx-dev-runtime';
import { MdxImage } from '@/components/mdx/MdxImage';
import { MdxCodeTabs } from '@/components/mdx/MdxCodeTabs';
import { MdxLink } from '@/components/mdx/MdxLink';

interface SimpleMDXRendererProps {
  content: string;
}

export default function SimpleMDXRenderer({ content }: SimpleMDXRendererProps) {
  const [MDXContent, setMDXContent] = useState<React.ComponentType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // MDX components that can be used in the content
  const components = useMemo(() => ({
    MdxImage,
    MdxCodeTabs,
    MdxLink,
  }), []);

  useEffect(() => {
    const compileMDX = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Evaluate the MDX content with React runtime
        const runtime = import.meta.env.DEV ? devRuntime : prodRuntime;
        const { default: MDXComponent } = await evaluate(content, {
          ...runtime,
          useMDXComponents: () => components,
          // Use development mode only in development
          development: import.meta.env.DEV,
        });
        setMDXContent(() => MDXComponent);
      } catch (err) {
        console.error('MDX compilation error:', err);
        setError(err instanceof Error ? err.message : 'Unknown MDX compilation error');
      } finally {
        setLoading(false);
      }
    };

    compileMDX();
  }, [content, components]);

  if (loading) {
    return (
      <div className="prose prose-slate dark:prose-invert max-w-none font-sans">
        <div className="text-sm text-muted-foreground">Rendering content…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="prose prose-slate dark:prose-invert max-w-none font-sans">
        <div className="text-red-600 text-sm">
          <strong>MDX Error:</strong> {error}
        </div>
      </div>
    );
  }

  if (!MDXContent) {
    return (
      <div className="prose prose-slate dark:prose-invert max-w-none font-sans">
        <div className="text-sm text-muted-foreground">No content to render</div>
      </div>
    );
  }

  return (
    <div className="prose prose-slate dark:prose-invert max-w-none font-sans">
      <MDXContent />
    </div>
  );
}