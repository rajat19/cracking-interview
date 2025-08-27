import Link from "next/link";
import { notFound } from "next/navigation";
import { promises as fs } from 'fs';
import path from 'path';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { MdxCodeTabs } from '@/components/mdx/MdxCodeTabs';
import { MdxImage } from '@/components/mdx/MdxImage';
import { MdxLink } from '@/components/mdx/MdxLink';

interface Problem {
  id: string;
  title: string;
  difficulty: string;
  timeComplexity: string;
  spaceComplexity: string;
  description: string;
  companies?: string[];
  relatedTopics: string[];
}

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

async function getProblem(slug: string): Promise<Problem | null> {
  try {
    const filePath = path.join(process.cwd(), 'src/data/dsa-index.json');
    const fileContents = await fs.readFile(filePath, 'utf8');
    const problems: Problem[] = JSON.parse(fileContents);
    return problems.find(p => p.id === slug) || null;
  } catch (error) {
    console.error('Error loading problem:', error);
    return null;
  }
}

async function getProblemContent(slug: string): Promise<string | null> {
  try {
    const filePath = path.join(process.cwd(), `src/content/dsa/posts/${slug}.mdx`);
    const fileContents = await fs.readFile(filePath, 'utf8');
    return fileContents;
  } catch (error) {
    console.error('Error loading problem content:', error);
    return null;
  }
}

function getDifficultyColor(difficulty: string) {
  switch (difficulty.toLowerCase()) {
    case 'easy':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    case 'hard':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
  }
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
    const filePath = path.join(process.cwd(), 'src/data/dsa-index.json');
    const fileContents = await fs.readFile(filePath, 'utf8');
    const problems: Problem[] = JSON.parse(fileContents);
    
    return problems.map((problem) => ({
      slug: problem.id,
    }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

export default async function ProblemPage({ params }: PageProps) {
  const { slug } = await params;
  const problem = await getProblem(slug);
  const content = await getProblemContent(slug);

  if (!problem) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/dsa" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
            ← Back to DSA Problems
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          {/* Problem Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {problem.title}
              </h1>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(problem.difficulty)}`}>
                {problem.difficulty}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                <div className="text-sm text-gray-500 dark:text-gray-400">Time Complexity</div>
                <div className="font-mono text-lg text-gray-900 dark:text-white">{problem.timeComplexity}</div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                <div className="text-sm text-gray-500 dark:text-gray-400">Space Complexity</div>
                <div className="font-mono text-lg text-gray-900 dark:text-white">{problem.spaceComplexity}</div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                <div className="text-sm text-gray-500 dark:text-gray-400">Topics</div>
                <div className="text-sm text-gray-900 dark:text-white">{problem.relatedTopics.length} topics</div>
              </div>
            </div>

            {problem.companies && problem.companies.length > 0 && (
              <div className="mb-4">
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">Asked by Companies:</div>
                <div className="flex flex-wrap gap-2">
                  {problem.companies.map((company) => (
                    <span
                      key={company}
                      className="px-2 py-1 bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded text-sm capitalize"
                    >
                      {company}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-4">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">Related Topics:</div>
              <div className="flex flex-wrap gap-2">
                {problem.relatedTopics.map((topic) => (
                  <span
                    key={topic}
                    className="px-2 py-1 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded text-sm"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Problem Content */}
          <div className="p-6">
            {content ? (
              <div className="prose prose-lg dark:prose-invert max-w-none">
                <MDXRemote source={content} components={components} />
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">
                  Problem content is being prepared. Please check back later.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
