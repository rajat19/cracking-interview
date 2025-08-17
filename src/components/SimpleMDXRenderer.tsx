import { useState, useEffect } from 'react';
import { SystemDesignImage } from '@/components/mdx/SystemDesignImage';
import { SystemDesignCode } from '@/components/mdx/SystemDesignCode';
import { SystemDesignCodeTabs } from '@/components/mdx/SystemDesignCodeTabs';
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

      // Process SystemDesignImage components
      processed = processed.replace(
        /<SystemDesignImage\s+([^>]+)\/?>(?:<\/SystemDesignImage>)?/g,
        (match, attributes) => {
          const props = parseAttributes(attributes);
          const component = (
            <SystemDesignImage
              key={`img-${componentIndex}`}
              src={props.src || ''}
              alt={props.alt || ''}
              caption={props.caption}
              design={props.design || ''}
            />
          );
          componentMatches.push(component);
          return `__COMPONENT_${componentIndex++}__`;
        }
      );

      // Process SystemDesignCode components
      processed = processed.replace(
        /<SystemDesignCode\s+([^>]+)\/?>(?:<\/SystemDesignCode>)?/g,
        (match, attributes) => {
          const props = parseAttributes(attributes);
          const component = (
            <SystemDesignCode
              key={`code-${componentIndex}`}
              file={props.file || ''}
              design={props.design || ''}
              title={props.title}
              description={props.description}
            />
          );
          componentMatches.push(component);
          return `__COMPONENT_${componentIndex++}__`;
        }
      );

      // Process SystemDesignCodeTabs components
      processed = processed.replace(
        /<SystemDesignCodeTabs\s+([^>]+)\/?>(?:<\/SystemDesignCodeTabs>)?/g,
        (match, attributes) => {
          const props = parseAttributes(attributes);
          let files: string[] = [];
          try {
            // Parse the files array from the attributes
            if (props.files) {
              files = JSON.parse(props.files.replace(/'/g, '"'));
            }
          } catch (e) {
            console.error('Failed to parse files array:', props.files);
          }
          
          const component = (
            <SystemDesignCodeTabs
              key={`tabs-${componentIndex}`}
              files={files}
              design={props.design || ''}
              title={props.title}
              description={props.description}
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
