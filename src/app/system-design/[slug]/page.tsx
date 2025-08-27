import Link from "next/link";
import { notFound } from "next/navigation";
import { promises as fs } from 'fs';
import path from 'path';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { MdxCodeTabs } from '@/components/mdx/MdxCodeTabs';
import { MdxImage } from '@/components/mdx/MdxImage';
import { MdxLink } from '@/components/mdx/MdxLink';

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

async function getTopicContent(slug: string): Promise<string | null> {
  try {
    const filePath = path.join(process.cwd(), `src/content/system-design/posts/${slug}.mdx`);
    const fileContents = await fs.readFile(filePath, 'utf8');
    return fileContents;
  } catch (error) {
    console.error('Error loading topic content:', error);
    return null;
  }
}

async function getTopicTitle(slug: string): Promise<string> {
  return slug.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
}

const components = {
  MdxCodeTabs,
  MdxImage,
  MdxLink,
  a: MdxLink,
  img: MdxImage,
};

export async function generateStaticParams() {
  try {
    const postsDir = path.join(process.cwd(), 'src/content/system-design/posts');
    const files = await fs.readdir(postsDir);
    const mdxFiles = files.filter(file => file.endsWith('.mdx'));
    
    return mdxFiles.map((file) => ({
      slug: file.replace('.mdx', ''),
    }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

export default async function SystemDesignTopicPage({ params }: PageProps) {
  const { slug } = await params;
  const content = await getTopicContent(slug);
  const title = await getTopicTitle(slug);

  if (!content) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/system-design" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
            ← Back to System Design
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {title}
            </h1>
          </div>

          <div className="p-6">
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <MDXRemote source={content} components={components} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
