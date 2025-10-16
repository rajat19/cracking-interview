import React from 'react';

interface MdxCodeProps {
  children?: React.ReactNode;
  className?: string;
}

/**
 * Custom inline code component for MDX that handles <sub> and <sup> tags
 * Allows rendering of subscript/superscript within inline code blocks
 */
export function MdxCode({ children, className }: MdxCodeProps) {
  // Convert children to string for processing
  const content = String(children || '');

  // Check if content contains sub or sup tags
  const hasTags = /<su[bp]>.*?<\/su[bp]>/.test(content);

  if (!hasTags) {
    // No special tags, render normally
    return <code className={className}>{children}</code>;
  }

  // Parse and render content with sub/sup tags
  const parts = content.split(/(<su[bp]>.*?<\/su[bp]>)/g);

  return (
    <code className={className}>
      {parts.map((part: string, index: number) => {
        // Check if this part is a superscript
        const supMatch = part.match(/<sup>(.*?)<\/sup>/);
        if (supMatch) {
          return <sup key={index}>{supMatch[1]}</sup>;
        }

        // Check if this part is a subscript
        const subMatch = part.match(/<sub>(.*?)<\/sub>/);
        if (subMatch) {
          return <sub key={index}>{subMatch[1]}</sub>;
        }

        return <React.Fragment key={index}>{part}</React.Fragment>;
      })}
    </code>
  );
}
