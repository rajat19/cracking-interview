'use client';

import { useEffect, useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import useHighlight from '@/hooks/useHighlight';
import { LANGUAGES_MAP } from '@/config/language';
import { ISolutionEntry } from '@/types/topic';
import Image from 'next/image';

interface SolutionTabsProps {
  solutions: Record<string, ISolutionEntry>;
  showHeader?: boolean;
}

import assetPath from '@/lib/assetPath';

const getLanguageIcon = (language: string): string => {
  return assetPath(`/assets/img/lang/${language}.svg`);
};

const getDefaultLanguage = (solutions: Record<string, ISolutionEntry>): string => {
  return 'java' in solutions ? 'java' : Object.keys(solutions)[0] ?? '';
};

export function SolutionTabs({ solutions, showHeader = true }: SolutionTabsProps) {
  const [activeLanguage, setActiveLanguage] = useState<string>(getDefaultLanguage(solutions));
  const syntaxStyle = useHighlight();

  return (
    <div className="mt-10 space-y-4">
      {showHeader && (
        <>
          <hr />
          <h2 className="font-large text-2xl font-bold text-foreground">Solutions</h2>
        </>
      )}

      <div className="tabs-boxed tabs gap-1 rounded-lg border border-base-300 bg-primary/50 p-1.5 shadow-sm">
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
              className={`tab relative gap-2 rounded-lg transition-all duration-200 ${
                activeLanguage === solutionKey
                  ? 'tab-active bg-primary text-primary-foreground shadow-lg'
                  : 'text-foreground shadow-sm hover:bg-muted/50 hover:text-foreground hover:shadow-md'
              }`}
              onClick={() => setActiveLanguage(solutionKey)}
            >
              <Image
                src={getLanguageIcon(sol.language)}
                alt={`${sol.language} icon`}
                width={16}
                height={16}
                className={`h-4 w-4 transition-all duration-200 ${
                  activeLanguage === solutionKey ? 'brightness-110 drop-shadow-sm' : 'opacity-100'
                }`}
              />
              <span className="capitalize transition-all duration-200">{languageInfo.name}</span>
            </button>
          );
        })}
      </div>

      {activeLanguage && solutions[activeLanguage] && (
        <div className="overflow-hidden rounded-lg border border-base-300 shadow-sm">
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
