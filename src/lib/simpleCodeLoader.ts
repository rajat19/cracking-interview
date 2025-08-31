import { LANGUAGES_MAP } from '@/config/language';
import { ISolutionEntry } from '@/types/topic';

/**
 * {path: {lang: SolutionEntry}}
 */
const codeCache = new Map<string, Record<string, ISolutionEntry>>();

export async function loadMdxCodeSimple(
  contentPath: string,
  languages: string[]
): Promise<Record<string, ISolutionEntry> | null> {
  const cacheKey = contentPath;
  if (codeCache.has(cacheKey)) {
    return codeCache.get(cacheKey)!;
  }

  const codeSolutions: Record<string, ISolutionEntry> = {};

  try {
    for (const lang of languages) {
      try {
        // Map language to file extension
        const ext = LANGUAGES_MAP[lang as keyof typeof LANGUAGES_MAP]?.extension || lang;

        // Build the file path - contentPath should be the full path relative to /src/content/
        // e.g., "system-design/code/library-management/books" -> "/src/content/system-design/code/library-management/books/solution.java"
        const filePath = `/src/content/${contentPath}/solution.${ext}`;

        // Static export: Dynamic code loading is disabled
        // console.debug(`Code loading disabled for static export: ${filePath}`);
      } catch (error) {
        console.warn(`Failed to load ${lang} solution for ${contentPath}:`, error);
      }
    }

    const solutionCount = Object.keys(codeSolutions).length;

    if (solutionCount > 0) {
      codeCache.set(cacheKey, codeSolutions);
      return codeSolutions;
    } else {
      console.warn(`No code examples found for path: ${contentPath}`);
      return null;
    }
  } catch (error) {
    console.error(`Failed to load code for path ${contentPath}:`, error);
    return null;
  }
}
