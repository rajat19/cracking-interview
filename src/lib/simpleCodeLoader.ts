import { systemDesignCodeMap } from './systemDesignCodeMap';

const codeCache = new Map<string, Record<string, { language: string; code: string; path: string }>>();

export async function loadSystemDesignCodeSimple(design: string): Promise<Record<string, { language: string; code: string; path: string }> | null> {
  console.log(`Loading code for design: ${design}`);
  
  // Check cache first
  const cacheKey = design;
  if (codeCache.has(cacheKey)) {
    console.log(`Returning cached code for: ${design}`);
    return codeCache.get(cacheKey)!;
  }
  
  const designFiles = systemDesignCodeMap[design as keyof typeof systemDesignCodeMap];
  if (!designFiles) {
    console.log(`No code files found for design: ${design}`);
    return null;
  }
  
  const codeExamples: Record<string, { language: string; code: string; path: string }> = {};
  
  try {
    for (const [fileName, loader] of Object.entries(designFiles)) {
      try {
        const module = await loader();
        const extension = fileName.split('.').pop()?.toLowerCase() || '';
        codeExamples[fileName] = {
          language: extension,
          code: module.default || '',
          path: `src/content/system-design/code/${design}/${fileName}`,
        };
        console.log(`Loaded code file: ${fileName}`);
      } catch (error) {
        console.warn(`Failed to load code file ${fileName}:`, error);
      }
    }
    
    console.log(`Successfully loaded ${Object.keys(codeExamples).length} code files for ${design}`);
    
    // Cache the result
    codeCache.set(cacheKey, codeExamples);
    
    return Object.keys(codeExamples).length > 0 ? codeExamples : null;
  } catch (error) {
    console.error(`Failed to load code for design ${design}:`, error);
    return null;
  }
}
