import React from 'react';

/**
 * Formats complexity notation to display superscripts and subscripts properly
 * Converts <sup>X</sup> and <sub>X</sub> tags to proper formatting
 */
/**
 * Decodes a minimal set of HTML entities from content strings so they render as symbols.
 * Supports numeric (&#NNNN;), hex (&#xHH;), and &radic; (√) specifically for sqrt use-cases.
 */
function decodeHtmlEntities(value: string): string {
  if (!value) return '';
  // Handle named sqrt entity
  let decoded = value.replace(/&radic;/g, '√');
  // Handle hex numeric entities
  decoded = decoded.replace(/&#x([0-9A-Fa-f]+);/g, (_match, hex) =>
    String.fromCodePoint(parseInt(hex, 16))
  );
  // Handle decimal numeric entities
  decoded = decoded.replace(/&#([0-9]+);/g, (_match, dec) =>
    String.fromCodePoint(parseInt(dec, 10))
  );
  return decoded;
}

export function Complexity(complexity: string): React.ReactElement {
  // Decode common HTML entities (e.g., &#8730; → √) and split by <sup> and <sub> tags
  const decoded = decodeHtmlEntities(complexity);
  const parts = decoded.split(/(<sup>.*?<\/sup>|<sub>.*?<\/sub>)/g);

  return (
    <>
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
        return part;
      })}
    </>
  );
}
