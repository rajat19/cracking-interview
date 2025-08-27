import withMDX from '@next/mdx';

const withMDXConfig = withMDX({
  extension: /\.(md|mdx)$/,
  options: {
    providerImportSource: '@mdx-js/react'
  }
});

export default withMDXConfig({
  output: 'export',
  trailingSlash: true,
  basePath: '/cracking-interview',
  assetPrefix: '/cracking-interview',
  images: {
    unoptimized: true,
  },
  experimental: {
    appDir: true,
  },
  pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],
});
