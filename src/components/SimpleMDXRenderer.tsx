import { useState, useEffect } from 'react';
import { MdxImage } from '@/components/mdx/MdxImage';
import { MdxCodeTabs } from '@/components/mdx/MdxCodeTabs';
import { MarkdownContent } from '@/components/MarkdownContent';

interface SimpleMDXRendererProps {
  content: string;
}

export function SimpleMDXRenderer({ content }: SimpleMDXRendererProps) {
  const [processedContent, setProcessedContent] = useState<string>('');
  const [components, setComponents] = useState<React.ReactNode[]>([]);

  useEffect(() => {
    const processContent = () => {
      let processed = content;
      const componentMatches: React.ReactNode[] = [];
      let componentIndex = 0;

      // Process MdxImage components
      processed = processed.replace(
        /<MdxImage\s+([^>]+)\/?>(?:<\/MdxImage>)?/g,
        (match, attributes) => {
          const props = parseAttributes(attributes);
          const component = (
            <MdxImage
              key={`img-${componentIndex}`}
              src={props.src || ''}
              alt={props.alt || ''}
            />
          );
          componentMatches.push(component);
          return `__COMPONENT_${componentIndex++}__`;
        }
      );

      // Process MdxCodeTabs components
      processed = processed.replace(
        /<MdxCodeTabs\s+([^>]+)\/?>(?:<\/MdxCodeTabs>)?/g,
        (match, attributes) => {
          const props = parseAttributes(attributes);
          let langs: string[] = [];
          try {
            // Parse the files array from the attributes
            if (props.langs) {
              langs = JSON.parse(props.langs);
            }
          } catch (e) {
            console.error('Failed to parse langs array:', props.langs);
          }
          
          const component = (
            <MdxCodeTabs
              key={`tabs-${componentIndex}`}
              langs={langs}
              path={props.path}
            />
          );
          componentMatches.push(component);
          return `__COMPONENT_${componentIndex++}__`;
        }
      );

      setProcessedContent(processed);
      setComponents(componentMatches);
    };

    processContent();
  }, [content]);

  // Function to parse HTML-like attributes
  const parseAttributes = (attributeString: string): Record<string, string> => {
    const attributes: Record<string, string> = {};
    const regex = /(\w+)=(?:"([^"]*)"|'([^']*)'|{([^}]*)})/g;
    let match;

    while ((match = regex.exec(attributeString)) !== null) {
      const [, name, doubleQuoted, singleQuoted, braced] = match;
      attributes[name] = doubleQuoted || singleQuoted || braced || '';
    }

    return attributes;
  };

  // Custom renderer that injects React components
  const renderContentWithComponents = (markdown: string): React.ReactNode => {
    const parts = markdown.split(/(__COMPONENT_\d+__)/);
    const result: React.ReactNode[] = [];
    
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const componentMatch = part.match(/^__COMPONENT_(\d+)__$/);
      
      if (componentMatch) {
        const componentIndex = parseInt(componentMatch[1], 10);
        const component = components[componentIndex];
        if (component) {
          result.push(component);
        }
      } else if (part.trim()) {
        // For non-component parts, render as markdown
        result.push(
          <div key={`markdown-${i}`} className="mdx-content">
            <MarkdownContent content={part} />
          </div>
        );
      }
    }
    
    return result;
  };

  return (
    <div className="prose prose-slate dark:prose-invert max-w-none font-sans">
      {renderContentWithComponents(processedContent)}
    </div>
  );
}
