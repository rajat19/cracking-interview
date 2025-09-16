export function assetPath(p: string): string {
  const base = process.env.NEXT_PUBLIC_BASE_PATH || '';
  // Ensure we don't produce double slashes
  if (!base) return p;
  if (p.startsWith('/')) return `${base}${p}`;
  return `${base}/${p}`;
}

export default assetPath;
