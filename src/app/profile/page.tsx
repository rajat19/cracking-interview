'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import { loadTopicsList } from '@/lib/contentLoader';
import {
  getCachedCategoryProgress,
  preloadUserProgress,
  upsertUserProgress,
} from '@/lib/progressStore';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Bookmark, ExternalLink, CheckCircle, UserCircle, LogOut } from 'lucide-react';
import TopicDifficulty from '@/components/TopicDifficulty';
import { ITopicCategory } from '@/types/topic';
import Image from 'next/image';

interface ProgressItem {
  id: string;
  title: string;
  difficulty: string;
  question_type: ITopicCategory;
  description?: string;
}

const Profile = () => {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [bookmarks, setBookmarks] = useState<ProgressItem[]>([]);
  const [completed, setCompleted] = useState<ProgressItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'bookmarks' | 'completed'>('bookmarks');

  useEffect(() => {
    if (!user) {
      router.push('/auth');
      return;
    }
    fetchProgress();
  }, [user, router]);

  const fetchProgress = useCallback(async () => {
    if (!user) return;
    try {
      const [dsa, system, behavioral, designPattern] = await Promise.all([
        loadTopicsList('dsa'),
        loadTopicsList('system-design'),
        loadTopicsList('behavioral'),
        loadTopicsList('design-pattern'),
      ]);

      const categories = [
        { id: 'dsa' as ITopicCategory, topics: dsa },
        { id: 'system-design' as ITopicCategory, topics: system },
        { id: 'behavioral' as ITopicCategory, topics: behavioral },
        { id: 'design-pattern' as ITopicCategory, topics: designPattern },
      ];

      const allBookmarks: ProgressItem[] = [];
      const allCompleted: ProgressItem[] = [];

      for (const { id: category, topics } of categories) {
        let progress = getCachedCategoryProgress(user.uid, category);
        if (Object.keys(progress).length === 0) {
          progress = await preloadUserProgress(user.uid, category);
        }

        const bookmarkedIds = Object.entries(progress)
          .filter(([, v]) => v.is_bookmarked)
          .map(([topicId]) => topicId);

        const completedIds = Object.entries(progress)
          .filter(([, v]) => v.is_completed)
          .map(([topicId]) => topicId);

        for (const t of topics) {
          if (bookmarkedIds.includes(t.id)) {
            allBookmarks.push({
              id: t.id,
              title: t.title,
              difficulty: t.difficulty,
              question_type: category,
            });
          }
          if (completedIds.includes(t.id)) {
            allCompleted.push({
              id: t.id,
              title: t.title,
              difficulty: t.difficulty,
              question_type: category,
            });
          }
        }
      }

      setBookmarks(allBookmarks);
      setCompleted(allCompleted);
    } catch (error) {
      console.error('Error fetching progress:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const removeBookmark = async (questionId: string, questionType: ITopicCategory) => {
    if (!user) return;
    try {
      await upsertUserProgress(user.uid, questionType, questionId, { isBookmarked: false });
      setBookmarks(prev =>
        prev.filter(b => !(b.id === questionId && b.question_type === questionType))
      );
    } catch (error) {
      console.error('Error removing bookmark:', error);
    }
  };

  const getQuestionRoute = (questionType: ITopicCategory) => {
    switch (questionType) {
      case 'dsa':
        return '/topics/dsa';
      case 'system-design':
        return '/topics/system-design';
      case 'behavioral':
        return '/topics/behavioral';
      case 'ood':
        return '/topics/ood';
      default:
        return '/';
    }
  };

  if (loading) {
    return (
      <>
        <div className="container mx-auto px-4 py-8 text-center">Loading profile...</div>
      </>
    );
  }

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex flex-col items-center gap-8 md:flex-row md:items-start">
          <div className="flex flex-col items-center">
            {user?.photoURL ? (
              <Image
                src={user.photoURL}
                alt="Profile"
                className="h-24 w-24 rounded-full border-2 border-primary shadow-lg"
              />
            ) : (
              <UserCircle size={96} className="text-primary" />
            )}
            <h1 className="mt-4 text-2xl font-bold">{user?.displayName || 'User'}</h1>
            <p className="text-muted-foreground">{user?.email}</p>
            <Button variant="ghost" onClick={signOut} className="mt-4 flex items-center gap-2">
              <LogOut size={16} />
              Sign Out
            </Button>
          </div>

          <div className="w-full flex-1">
            <div className="mb-6 flex border-b border-border">
              <button
                className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === 'bookmarks'
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground'
                }`}
                onClick={() => setActiveTab('bookmarks')}
              >
                Bookmarks ({bookmarks.length})
              </button>
              <button
                className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === 'completed'
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground'
                }`}
                onClick={() => setActiveTab('completed')}
              >
                Completed ({completed.length})
              </button>
            </div>

            <div className="grid gap-4">
              {(activeTab === 'bookmarks' ? bookmarks : completed).map(item => (
                <div
                  key={`${item.question_type}-${item.id}`}
                  className="rounded-lg border border-border bg-card p-6 shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
                      <p className="mt-2 text-muted-foreground">{item.description}</p>
                      <div className="mt-4 flex items-center gap-2">
                        <TopicDifficulty
                          difficulty={item.difficulty as 'easy' | 'medium' | 'hard'}
                        />
                        <div className="badge badge-info rounded-md p-2 text-xs capitalize">
                          {item.question_type.replace('_', ' ')}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Link
                        href={getQuestionRoute(item.question_type)}
                        className="btn btn-primary btn-sm"
                      >
                        <ExternalLink size={16} />
                        View
                      </Link>
                      {activeTab === 'bookmarks' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeBookmark(item.id, item.question_type)}
                          className="btn-sm"
                        >
                          <Bookmark size={16} className="text-warning" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {(activeTab === 'bookmarks' ? bookmarks : completed).length === 0 && (
              <div className="py-12 text-center">
                {activeTab === 'bookmarks' ? (
                  <Bookmark size={64} className="mx-auto mb-4 text-base-300" />
                ) : (
                  <CheckCircle size={64} className="mx-auto mb-4 text-base-300 text-success" />
                )}
                <h2 className="mb-2 text-xl">No {activeTab} yet</h2>
                <p className="text-base-content/70 mb-6">
                  {activeTab === 'bookmarks'
                    ? 'Start bookmarking questions you want to review later!'
                    : 'Start completing questions to track your progress!'}
                </p>
                <div className="space-x-4">
                  <Link href="/topics/dsa" className="btn btn-primary">
                    Browse DSA
                  </Link>
                  <Link href="/topics/system-design" className="btn btn-primary">
                    Browse System Design
                  </Link>
                  <Link href="/topics/behavioral" className="btn btn-primary">
                    Browse Behavioral
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
