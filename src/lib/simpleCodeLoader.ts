import { LANGUAGES_MAP } from "@/types/language";
import { ISolutionEntry } from "@/types/topic";

/**
 * {path: {lang: SolutionEntry}}
 */
const codeCache = new Map<string, Record<string, ISolutionEntry>>();

// Create lazy loaders for system design code files (only created once at module load)
const codeModules = import.meta.glob('/src/content/**/code/**/solution.{java,py,cpp,js,ts,c,go,kt,rs,rb,swift,php,sql}', { 
  query: '?raw', 
  import: 'default' 
}) as unknown as Record<string, () => Promise<string>>;

export async function loadMdxCodeSimple(path: string, languages: string[]): Promise<Record<string, ISolutionEntry>> {

  const cacheKey = path;
  if (codeCache.has(cacheKey)) {
    return codeCache.get(cacheKey)!;
  }

  const codeSolutions: Record<string, ISolutionEntry> = {};
  
  try {    
    for (const lang of languages) {
      const expectedFileName = `solution.${LANGUAGES_MAP[lang].extension}`;
      const expectedPath = `/src/content/${path}/${expectedFileName}`;
      
      // Find the matching module
      const moduleLoader = codeModules[expectedPath];
      
      if (moduleLoader) {
        try {
          const rawCode = await moduleLoader();
          codeSolutions[lang] = {
            language: lang,
            code: rawCode || '',
          };
        } catch(error) {
          console.warn(`Failed to load code file ${expectedPath}`, error);
        }
      } else {
        console.warn(`Code file not found: ${expectedPath}`);
      }
    }

    const solutionCount = Object.keys(codeSolutions).length;
    
    if (solutionCount > 0) {
      codeCache.set(cacheKey, codeSolutions);
      return codeSolutions;
    } else {
      console.warn(`No code examples found for path: ${path}`);
      return null;
    }
  } catch (error) {
    console.error(`Failed to load code for path ${path}:`, error);
    return null;
  }
}
