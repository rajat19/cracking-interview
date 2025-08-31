'use client';

import { useEffect, useState, lazy, Suspense } from 'react';
import { CheckCircle, Circle, Bookmark, BookmarkCheck, Clock, Code, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ITopic, ITopicCategory } from '@/types/topic';
import { updateLocalProgress } from '@/lib/contentLoader';
const SimpleMDXRenderer = lazy(() => import('@/components/SimpleMDXRenderer'));
const SolutionTabs = lazy(() => import('@/components/SolutionTabs'));
import { PlatformLinks } from '@/components/PlatformLinks';
import { useAuth } from '@/hooks/useAuth';
import { getUserProgress, upsertUserProgress } from '@/lib/progressStore';
import { useRouter } from 'next/navigation';
import TopicDifficulty from '@/components/TopicDifficulty';
import config from '@/config';
import Image from 'next/image';
import { formatComplexity } from '@/lib/complexityFormatter';

// Public assets helper for Next.js
import assetPath from '@/lib/assetPath';
const companyIconSrc = (company: string) => assetPath(`/assets/img/company/${company}.svg`);

interface TopicContentProps {
  topic: ITopic;
  category: ITopicCategory;
  onProgressUpdate: () => Promise<void>;
  onFilterByTag?: (tag: string) => void;
  onFilterByCompany?: (company: string) => void;
}

export function TopicContent({
  topic,
  category,
  onProgressUpdate,
  onFilterByTag,
  onFilterByCompany,
}: TopicContentProps) {
  const [isCompleted, setIsCompleted] = useState(topic.isCompleted || false);
  const [isBookmarked, setIsBookmarked] = useState(topic.isBookmarked || false);
  const [activeLanguage, setActiveLanguage] = useState<string | null>(null);
  const { user } = useAuth();
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  const toggleComplete = async () => {
    if (!user) {
      router.push('/auth');
      return;
    }
    const newCompleted = !isCompleted;
    setIsCompleted(newCompleted);
    await updateProgress(topic.id, { isCompleted: newCompleted });
  };

  const toggleBookmark = async () => {
    if (!user) {
      router.push('/auth');
      return;
    }
    const newBookmarked = !isBookmarked;
    setIsBookmarked(newBookmarked);
    await updateProgress(topic.id, { isBookmarked: newBookmarked });
  };

  const handleShare = async () => {
    try {
      const shareUrl = window.location.href;
      if (navigator.share) {
        await navigator.share({
          title: topic.title,
          text: `Check out this topic: ${topic.title}`,
          url: shareUrl,
        });
      } else if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }
    } catch (_) {
      // no-op on user cancel or errors
    }
  };

  const updateProgress = async (
    questionId: string,
    updates: { isCompleted?: boolean; isBookmarked?: boolean }
  ) => {
    try {
      if (user) {
        await upsertUserProgress(user.uid, category, questionId, updates);
      } else {
        updateLocalProgress(category, questionId, updates);
      }
      onProgressUpdate();
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  // Initialize the default active solution language when topic changes
  useEffect(() => {
    if (topic.solutions && Object.keys(topic.solutions).length > 0) {
      const first = Object.values(topic.solutions)[0]?.language ?? null;
      setActiveLanguage(first);
    } else {
      setActiveLanguage(null);
    }
  }, [topic.id, topic.solutions]);

  // Load initial user progress if signed in
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!user) return;
      try {
        const doc = await getUserProgress(user.uid, category, topic.id);
        if (!mounted || !doc) return;
        setIsCompleted(!!doc.is_completed);
        setIsBookmarked(!!doc.is_bookmarked);
      } catch (e) {
        // no-op
      }
    })();
    return () => {
      mounted = false;
    };
  }, [user, category, topic.id]);

  return (
    <div className="w-full p-4 lg:mx-auto lg:max-w-4xl lg:p-8">
      {/* Header */}
      <div className="mb-6 lg:mb-8">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-x-3 sm:space-y-0">
            <h1 className="text-2xl font-bold text-foreground lg:text-3xl">{topic.title}</h1>
            <TopicDifficulty difficulty={topic.difficulty} />
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={handleShare} className="" title="Share">
              <Share2 className="mr-2 h-4 w-4" />
              {copied ? 'Link copied' : 'Share'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleBookmark}
              className={isBookmarked ? 'border-primary text-primary' : ''}
            >
              {isBookmarked ? (
                <BookmarkCheck className="h-4 w-4" />
              ) : (
                <Bookmark className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant={isCompleted ? 'default' : 'outline'}
              size="sm"
              onClick={toggleComplete}
              className={isCompleted ? 'bg-success hover:bg-success/80' : ''}
            >
              {isCompleted ? (
                <CheckCircle className="mr-2 h-4 w-4" />
              ) : (
                <Circle className="mr-2 h-4 w-4" />
              )}
              {isCompleted ? 'Completed' : 'Mark Complete'}
            </Button>
          </div>
        </div>

        {/* Complexity Info */}
        {(topic.timeComplexity || topic.spaceComplexity) && (
          <div className="flex items-center space-x-6 rounded-lg border border-border bg-card p-4">
            {topic.timeComplexity && (
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-primary" />
                <span className="text-sm">
                  <strong>Time:</strong> {formatComplexity(topic.timeComplexity)}
                </span>
              </div>
            )}
            {topic.spaceComplexity && (
              <div className="flex items-center space-x-2">
                <Code className="h-4 w-4 text-primary" />
                <span className="text-sm">
                  <strong>Space:</strong> {formatComplexity(topic.spaceComplexity)}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Related Topics */}
      {topic.relatedTopics && topic.relatedTopics.length > 0 && (
        <div className="my-8">
          <h3 className="mb-4 text-xl font-medium text-foreground">Related Topics</h3>
          <div className="flex flex-wrap gap-2">
            {topic.relatedTopics.map((relatedTopic, index) => (
              <button
                key={index}
                className="btn border-[#e5e5e5] bg-white px-2 py-1 text-xs text-black lg:px-3 lg:py-2 lg:text-sm"
                onClick={() => onFilterByTag?.(relatedTopic)}
                title={`Filter by ${relatedTopic}`}
              >
                {relatedTopic}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Companies */}
      {topic.companies && topic.companies.length > 0 && (
        <div className="my-6 lg:my-8">
          <h3 className="mb-3 text-lg font-medium text-foreground lg:mb-4 lg:text-xl">Companies</h3>
          <div className="flex flex-wrap gap-2">
            {topic.companies.map((company, index) => {
              return (
                <button
                  className="btn border-[#e5e5e5] bg-white px-2 py-1 text-xs text-black lg:px-3 lg:py-2 lg:text-sm"
                  key={index}
                  onClick={() => onFilterByCompany?.(company)}
                  title={`Filter by ${company}`}
                >
                  <Image
                    src={companyIconSrc(company)}
                    alt={company}
                    width={16}
                    height={16}
                    className="h-3 w-3 lg:h-4 lg:w-4"
                  />
                  {company}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <PlatformLinks topic={topic} />

      {/* Content */}
      <Suspense
        fallback={<div className="mt-6 text-sm text-muted-foreground">Rendering content…</div>}
      >
        <SimpleMDXRenderer content={topic.content || ''} />
      </Suspense>

      {topic.examples && topic.examples.length > 0 && (
        <div className="mt-8">
          <h3 className="mb-4 text-xl font-medium text-foreground">Examples</h3>
          <div className="space-y-4">
            {topic.examples.map((example, index) => (
              <div key={index} className="rounded-lg border border-border bg-card p-4">
                <pre className="whitespace-pre-wrap font-mono text-sm text-muted-foreground">
                  {example}
                </pre>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Solutions */}
      {config.hasSolutions(category) &&
        topic.solutions &&
        Object.keys(topic.solutions).length > 0 && (
          <Suspense
            fallback={<div className="mt-6 text-sm text-muted-foreground">Loading solutions…</div>}
          >
            <SolutionTabs solutions={topic.solutions} />
          </Suspense>
        )}
    </div>
  );
}
