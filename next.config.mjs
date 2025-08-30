import withMDX from '@next/mdx';
import withBundleAnalyzer from '@next/bundle-analyzer';

const withMDXConfig = withMDX({
  extension: /\.(md|mdx)$/,
  options: {
    providerImportSource: '@mdx-js/react'
  }
});

const bundleAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

const isProd = process.env.NODE_ENV === 'production';

export default bundleAnalyzer(withMDXConfig({
  output: 'export',
  trailingSlash: true,
  basePath: isProd ? '/cracking-interview' : '',
  assetPrefix: isProd ? '/cracking-interview' : '',
  env: {
    NEXT_PUBLIC_BASE_PATH: isProd ? '/cracking-interview' : '',
  },
  images: {
    unoptimized: true,
  },
  pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Performance optimizations
  experimental: {
    optimizePackageImports: ['lucide-react', 'react-syntax-highlighter'],
  },
  // Better compression
  compress: true,
}));
