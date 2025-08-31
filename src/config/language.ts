import { ILanguage } from '@/types/language';

export const LANGUAGES_MAP: Record<string, ILanguage> = {
  c: { name: 'C', extension: 'c' },
  cpp: { name: 'C++', extension: 'cpp' },
  java: { name: 'Java', extension: 'java' },
  py: { name: 'Python', extension: 'py' },
  js: { name: 'JavaScript', extension: 'js' },
  ts: { name: 'TypeScript', extension: 'ts' },
  go: { name: 'Go', extension: 'go' },
  cs: { name: 'C#', extension: 'cs' },
  rb: { name: 'Ruby', extension: 'rb' },
  rs: { name: 'Rust', extension: 'rs' },
  kt: { name: 'Kotlin', extension: 'kt' },
  swift: { name: 'Swift', extension: 'swift' },
  dart: { name: 'Dart', extension: 'dart' },
  php: { name: 'PHP', extension: 'php' },
  sql: { name: 'SQL', extension: 'sql' },
  sh: { name: 'Bash', extension: 'sh' },
  scala: { name: 'Scala', extension: 'scala' },
};

export default LANGUAGES_MAP;
