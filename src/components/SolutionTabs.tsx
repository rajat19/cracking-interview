import { useEffect, useMemo, useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import useHighlight from '@/hooks/useHighlight';
import { useTheme } from "@/contexts/ThemeContext";
import { LANGUAGES_MAP } from "@/types/language";

export interface SolutionEntry {
  language: string;
  code: string;
}

interface SolutionTabsProps {
  solutions: Record<string, SolutionEntry>;
  showHeader?: boolean;
}

const getLanguageIcon = (language: string): string => {
  return `${import.meta.env.BASE_URL}assets/img/lang/${language}.svg`;
};

export function SolutionTabs({ solutions, showHeader = true }: SolutionTabsProps) {
  const [activeLanguage, setActiveLanguage] = useState<string | null>(null);

  useEffect(() => {
    const first = Object.values(solutions)[0]?.language ?? null;
    setActiveLanguage(first);
  }, [solutions]);

  const syntaxStyle = useHighlight();

  return (
    <div className="mt-10 space-y-4">
      {showHeader && (
        <>
          <hr />
          <h2 className="text-xl font-large mb-2 text-foreground">Solutions</h2>
        </>
      )}

      <div className="tabs tabs-boxed bg-primary/50 p-1.5 gap-1 border border-base-300 shadow-sm rounded-lg">
        {Object.values(solutions).map((sol) => {
          const languageInfo = LANGUAGES_MAP[sol.language];
          if (!languageInfo) {
            console.warn(`Language "${sol.language}" not found in LANGUAGES_MAP`);
            return null;
          }
          
          return (
            <button
              key={languageInfo.extension}
              role="tab"
              className={`tab rounded-lg gap-2 transition-all duration-200 relative ${
                activeLanguage === sol.language 
                  ? 'tab-active bg-primary text-primary-foreground shadow-lg' 
                  : 'text-foreground shadow-sm hover:text-foreground hover:bg-muted/50 hover:shadow-md'
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
                {languageInfo.name}
              </span>
            </button>
          );
        })}
      </div>

      {activeLanguage && LANGUAGES_MAP[activeLanguage] && (
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


