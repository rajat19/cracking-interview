"use client";

import { useEffect, useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import useHighlight from '@/hooks/useHighlight';
import { LANGUAGES_MAP } from "@/types/language";
import { ISolutionEntry } from "@/types/topic";
import Image from "next/image";

interface SolutionTabsProps {
  solutions: Record<string, ISolutionEntry>;
  showHeader?: boolean;
}

const getLanguageIcon = (language: string): string => {
  return `/assets/img/lang/${language}.svg`;
};

export function SolutionTabs({ solutions, showHeader = true }: SolutionTabsProps) {
  const [activeLanguage, setActiveLanguage] = useState<string | null>(null);

  useEffect(() => {
    const firstKey = Object.keys(solutions)[0] ?? null;
    setActiveLanguage(firstKey);
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
        {Object.entries(solutions).map(([solutionKey, sol]) => {
          const languageInfo = LANGUAGES_MAP[sol.language];
          if (!languageInfo) {
            console.warn(`Language "${sol.language}" not found in LANGUAGES_MAP`);
            return null;
          }
          
          return (
            <button
              key={solutionKey}
              role="tab"
              className={`tab rounded-lg gap-2 transition-all duration-200 relative ${
                activeLanguage === solutionKey 
                  ? 'tab-active bg-primary text-primary-foreground shadow-lg' 
                  : 'text-foreground shadow-sm hover:text-foreground hover:bg-muted/50 hover:shadow-md'
              }`}
              onClick={() => setActiveLanguage(solutionKey)}
            >
              <Image 
                src={getLanguageIcon(sol.language)} 
                alt={`${sol.language} icon`}
                width={16}
                height={16}
                className={`w-4 h-4 transition-all duration-200 ${
                  activeLanguage === solutionKey ? 'drop-shadow-sm brightness-110' : 'opacity-100'
                }`}
              />
              <span className='capitalize transition-all duration-200'>
                {languageInfo.name}
              </span>
            </button>
          );
        })}
      </div>

      {activeLanguage && solutions[activeLanguage] && (
        <div className="border border-base-300 rounded-lg overflow-hidden shadow-sm">
          <SyntaxHighlighter
            language={LANGUAGES_MAP[solutions[activeLanguage].language].extension}
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


