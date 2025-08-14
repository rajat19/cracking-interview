import { useEffect, useMemo, useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark, oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useTheme } from "@/contexts/ThemeContext";
import { LANGUAGES_MAP } from "@/types/language";

export interface SolutionEntry {
  language: string;
  code: string;
  path: string;
}

interface SolutionTabsProps {
  solutions: Record<string, SolutionEntry>;
}

const getLanguageIcon = (language: string): string => {
  return `${import.meta.env.BASE_URL}assets/img/lang/${language}.svg`;
};

export function SolutionTabs({ solutions }: SolutionTabsProps) {
  const [activeLanguage, setActiveLanguage] = useState<string | null>(null);
  const { theme } = useTheme();

  useEffect(() => {
    const first = Object.values(solutions)[0]?.language ?? null;
    setActiveLanguage(first);
  }, [solutions]);

  const syntaxStyle = useMemo(() => {
    return theme === 'dark' ? oneDark : oneLight;
  }, [theme]);

  return (
    <div className="mt-10 space-y-4">
      <hr />
      <h2 className="text-xl font-large mb-2 text-foreground">Solutions</h2>

      <div className="tabs tabs-boxed bg-base-200 p-1.5 gap-1 border border-base-300 shadow-sm rounded-lg">
        {Object.values(solutions).map((sol) => (
          <button
            key={LANGUAGES_MAP[sol.language].extension}
            role="tab"
            className={`tab rounded-lg gap-2 transition-all duration-200 relative ${
              activeLanguage === sol.language 
                ? 'tab-active bg-primary text-primary-foreground shadow-lg' 
                : 'shadow-sm hover:text-base-content hover:bg-base-200 hover:shadow-md'
            }`}
            onClick={() => setActiveLanguage(sol.language)}
          >
            <img 
              src={getLanguageIcon(sol.language)} 
              alt={`${sol.language} icon`}
              className={`w-4 h-4 transition-all duration-200 ${
                activeLanguage === sol.language ? 'drop-shadow-sm brightness-110' : 'opacity-100'
              }`}
            />
            <span className='capitalize transition-all duration-200'>
              {LANGUAGES_MAP[sol.language].name}
            </span>
          </button>
        ))}
      </div>

      {activeLanguage && (
        <div className="border border-base-300 rounded-lg overflow-hidden shadow-sm">
          <SyntaxHighlighter
            language={LANGUAGES_MAP[activeLanguage].extension}
            style={syntaxStyle}
            customStyle={{ 
              margin: 0,
              padding: '1.5rem',
              fontSize: '0.875rem',
              lineHeight: '1.5',
              borderRadius: '0.5rem',
            }}
            codeTagProps={{ className: 'text-sm' }}
          >
            {solutions[activeLanguage].code}
          </SyntaxHighlighter>
        </div>
      )}
    </div>
  );
}

export default SolutionTabs;


