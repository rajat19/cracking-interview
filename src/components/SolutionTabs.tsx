import { Fragment, useEffect, useId, useMemo, useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark, oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useTheme } from "@/contexts/ThemeContext";

export interface SolutionEntry {
  language: string;
  code: string;
  path: string;
}

interface SolutionTabsProps {
  solutions: Record<string, SolutionEntry>;
}

// Language icon mapping to public assets
const LANG_ICON_FILE: Record<string, string> = {
  c: 'c.svg',
  cpp: 'cpp.svg',
  cs: 'cs.svg',
  go: 'go.svg',
  java: 'java.svg',
  javascript: 'js.svg',
  js: 'js.svg',
  kotlin: 'kt.svg',
  kt: 'kt.svg',
  php: 'php.svg',
  python: 'py.svg',
  py: 'py.svg',
  ruby: 'rb.svg',
  rb: 'rb.svg',
  rust: 'rust.svg',
  rst: 'rust.svg',
  scala: 'scala.svg',
  swift: 'swift.svg',
  typescript: 'ts.svg',
  ts: 'ts.svg',
};

const getLanguageIcon = (language: string): string => {
  const file = LANG_ICON_FILE[language.toLowerCase()] || 'js.svg';
  return `${import.meta.env.BASE_URL}assets/img/lang/${file}`;
};

export function SolutionTabs({ solutions }: SolutionTabsProps) {
  const [activeLanguage, setActiveLanguage] = useState<string | null>(null);
  const { theme } = useTheme();

  useEffect(() => {
    const first = Object.values(solutions)[0]?.language ?? null;
    setActiveLanguage(first);
  }, [solutions]);

  const active = activeLanguage
    ? Object.values(solutions).find((s) => s.language === activeLanguage)
    : undefined;

  const hljsLanguage = useMemo(() => {
    const map: Record<string, string> = {
      cpp: "cpp",
      c: "c",
      java: "java",
      python: "python",
      py: "python",
      javascript: "javascript",
      js: "javascript",
      typescript: "typescript",
      ts: "typescript",
      go: "go",
      ruby: "ruby",
      rb: "ruby",
      rust: "rust",
      rst: "rust",
      kt: "kotlin",
      swift: "swift",
      dart: "dart",
      php: "php",
      sql: "sql",
      sh: "bash",
    };
    return active?.language ? map[active.language] || "" : "";
  }, [active?.language]);

  // Memoize the syntax highlighter style to prevent unnecessary re-renders
  const syntaxStyle = useMemo(() => {
    return theme === 'dark' ? oneDark : oneLight;
  }, [theme]);

  // Get background color based on theme
  const getBackgroundColor = () => {
    return theme === 'dark' ? '#1e1e1e' : '#fafafa';
  };

  useEffect(() => {}, [active?.code, hljsLanguage]);

  return (
    <div className="mt-10 space-y-4">
      <hr />
      <h2 className="text-xl font-large mb-2 text-foreground">Solutions</h2>

      {/* DaisyUI tabs with language icons */}
      <div className="tabs tabs-boxed bg-base-200 p-1.5 gap-1 border border-base-300 shadow-sm">
        {Object.values(solutions).map((sol) => (
          <button
            key={sol.language}
            role="tab"
            className={`tab gap-2 transition-all duration-200 relative ${
              activeLanguage === sol.language 
                ? 'tab-active bg-primary text-primary-foreground shadow-lg border-2 border-primary/30 font-semibold scale-105' 
                : 'text-base-content bg-base-100 border border-base-300 shadow-sm hover:text-base-content hover:bg-base-200 hover:border-base-400 hover:shadow-md hover:scale-102'
            }`}
            onClick={() => setActiveLanguage(sol.language)}
          >
            {/* Active indicator dot */}
            {activeLanguage === sol.language && (
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-accent rounded-full shadow-sm"></div>
            )}
            <img 
              src={getLanguageIcon(sol.language)} 
              alt={`${sol.language} icon`}
              className={`w-4 h-4 transition-all duration-200 ${
                activeLanguage === sol.language ? 'drop-shadow-sm brightness-110' : 'opacity-100'
              }`}
            />
            <span className={`capitalize transition-all duration-200 ${
              activeLanguage === sol.language ? 'font-bold' : 'font-semibold'
            }`}>
              {sol.language}
            </span>
          </button>
        ))}
      </div>

      {/* Code display area */}
      {activeLanguage && (
        <div className="border border-base-300 rounded-lg overflow-hidden shadow-sm">
          <SyntaxHighlighter
            language={hljsLanguage || undefined}
            style={syntaxStyle}
            customStyle={{ 
              margin: 0, 
              padding: '1.5rem',
              fontSize: '0.875rem',
              lineHeight: '1.5',
              borderRadius: '0.5rem',
              // Ensure proper background color based on theme
              backgroundColor: getBackgroundColor()
            }}
            codeTagProps={{ className: 'text-sm' }}
          >
{Object.values(solutions).find(s => s.language === activeLanguage)?.code || ''}
          </SyntaxHighlighter>
        </div>
      )}
    </div>
  );
}

export default SolutionTabs;


