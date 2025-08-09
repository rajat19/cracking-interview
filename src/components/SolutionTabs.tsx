import { Fragment, useEffect, useId, useMemo, useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark, oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useTheme } from "@/contexts/ThemeContext";

// Language icon imports
import cIcon from '../assets/img/lang/c.svg';
import cppIcon from '../assets/img/lang/cpp.svg';
import csIcon from '../assets/img/lang/cs.svg';
import goIcon from '../assets/img/lang/go.svg';
import javaIcon from '../assets/img/lang/java.svg';
import jsIcon from '../assets/img/lang/js.svg';
import ktIcon from '../assets/img/lang/kt.svg';
import phpIcon from '../assets/img/lang/php.svg';
import pyIcon from '../assets/img/lang/py.svg';
import rbIcon from '../assets/img/lang/rb.svg';
import rustIcon from '../assets/img/lang/rust.svg';
import scalaIcon from '../assets/img/lang/scala.svg';
import swiftIcon from '../assets/img/lang/swift.svg';
import tsIcon from '../assets/img/lang/ts.svg';

export interface SolutionEntry {
  language: string;
  code: string;
  path: string;
}

interface SolutionTabsProps {
  solutions: Record<string, SolutionEntry>;
}

// Language icon mapping
const getLanguageIcon = (language: string): string => {
  const iconMap: Record<string, string> = {
    c: cIcon,
    cpp: cppIcon,
    cs: csIcon,
    go: goIcon,
    java: javaIcon,
    javascript: jsIcon,
    js: jsIcon,
    kotlin: ktIcon,
    kt: ktIcon,
    php: phpIcon,
    python: pyIcon,
    py: pyIcon,
    ruby: rbIcon,
    rb: rbIcon,
    rust: rustIcon,
    rst: rustIcon,
    scala: scalaIcon,
    swift: swiftIcon,
    typescript: tsIcon,
    ts: tsIcon,
  };
  return iconMap[language.toLowerCase()] || jsIcon; // Default to JS icon
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


