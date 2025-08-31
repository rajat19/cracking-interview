import React from 'react';

/**
 * Formats complexity notation to display superscripts properly
 * Converts <sup>X</sup> tags to proper superscript formatting
 */
export function formatComplexity(complexity: string): React.ReactElement {
  // Split the string by <sup> and </sup> tags
  const parts = complexity.split(/(<sup>.*?<\/sup>)/g);

  return (
    <>
      {parts.map((part: string, index: number) => {
        // Check if this part is a superscript
        const supMatch = part.match(/<sup>(.*?)<\/sup>/);
        if (supMatch) {
          return <sup key={index}>{supMatch[1]}</sup>;
        }
        return part;
      })}
    </>
  );
}
