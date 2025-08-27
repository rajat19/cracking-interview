import withMDX from '@next/mdx';

const withMDXConfig = withMDX({
  extension: /\.(md|mdx)$/,
  options: {
    providerImportSource: '@mdx-js/react'
  }
});

const isProd = process.env.NODE_ENV === 'production';

export default withMDXConfig({
  output: 'export',
  trailingSlash: true,
  basePath: isProd ? '/cracking-interview' : '',
  assetPrefix: isProd ? '/cracking-interview' : '',
  images: {
    unoptimized: true,
  },
  pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],
  eslint: {
    ignoreDuringBuilds: true,
  },
});
