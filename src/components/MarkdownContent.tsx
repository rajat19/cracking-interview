import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";

interface MarkdownContentProps {
  content: string;
  className?: string;
}

export function MarkdownContent({ content, className }: MarkdownContentProps) {
  const baseUrl = import.meta.env.BASE_URL || '/';

  const fixImageSrc = (src?: string): string => {
    if (!src) return '';
    // Strip Jekyll-style site var
    src = src.replace(/\{\{\s*site\.github\.url\s*\}\}/g, '').replace(/^\/+/, '');
    // Absolute http(s) stays as-is
    if (/^https?:\/\//i.test(src)) return src;
    // Normalize leading ./ or /
    src = src.replace(/^\.\//, '').replace(/^\/+/, '');
    // Ensure it points to public assets
    if (src.startsWith('assets/')) {
      return `${baseUrl}${src}`;
    }
    return `${baseUrl}${src}`;
  };

  return (
    <div
      className={
        className ||
        "prose prose-sm max-w-none prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-li:text-foreground markdown-content"
      }
    >
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]} 
        rehypePlugins={[rehypeHighlight]}
        components={{
          img: ({ node, ...props }) => (
            <img {...props} src={fixImageSrc(props.src as string | undefined)} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

export default MarkdownContent;


