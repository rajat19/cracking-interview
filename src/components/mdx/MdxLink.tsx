import { ExternalLink } from 'lucide-react';

interface MdxLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

export function MdxLink({ href, children, className = '' }: MdxLinkProps) {
  const isExternal = href.startsWith('http://') || href.startsWith('https://');

  return (
    <a
      href={href}
      target={isExternal ? '_blank' : undefined}
      rel={isExternal ? 'noopener noreferrer' : undefined}
      className={`inline-flex items-center gap-1 text-primary underline underline-offset-2 transition-colors hover:text-primary/80 ${className}`}
    >
      {children}
      {isExternal && <ExternalLink className="h-3 w-3" />}
    </a>
  );
}
