import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { Bookmark, ExternalLink } from 'lucide-react';
import Navigation from '@/components/Navigation';
import { loadTopicsList } from '@/lib/contentLoader';
import type { ITopicCategory, ITopicList } from '@/types/topic';
import { getCachedCategoryProgress, preloadUserProgress, upsertUserProgress } from '@/lib/progressStore';
import TopicDifficulty from '@/components/TopicDifficulty';

interface BookmarkedQuestion {
  id: string;
  title: string;
  difficulty: string;
  question_type: ITopicCategory;
}

const Bookmarks = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookmarks, setBookmarks] = useState<BookmarkedQuestion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchBookmarks();
  }, [user, navigate]);

  const fetchBookmarks = useCallback(async () => {
    if (!user) return;

    try {
      // Load only topic metadata for each supported category for better performance
      const [dsa, system, behavioral] = await Promise.all([
        loadTopicsList('dsa'),
        loadTopicsList('system-design'),
        loadTopicsList('behavioral'),
      ]);

      const categories: Array<{ id: ITopicCategory; topics: ITopicList[] }> = [
        { id: 'dsa', topics: dsa },
        { id: 'system-design', topics: system },
        { id: 'behavioral', topics: behavioral },
      ];

      const all: BookmarkedQuestion[] = [];

      for (const { id: category, topics } of categories) {
        // cache-first progress fetch per category
        let progress = getCachedCategoryProgress(user.uid, category);
        if (Object.keys(progress).length === 0) {
          progress = await preloadUserProgress(user.uid, category);
        }
        const bookmarkedIds = Object.entries(progress)
          .filter(([, v]) => v.is_bookmarked)
          .map(([topicId]) => topicId);

        if (bookmarkedIds.length === 0) continue;

        for (const t of topics) {
          if (!bookmarkedIds.includes(t.id)) continue;
          all.push({
            id: t.id,
            title: t.title,
            difficulty: t.difficulty,
            question_type: category,
          });
        }
      }

      setBookmarks(all);
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const removeBookmark = async (questionId: string, questionType: ITopicCategory) => {
    if (!user) return;
    try {
      await upsertUserProgress(user.uid, questionType, questionId, { isBookmarked: false });
      setBookmarks(prev => prev.filter(b => !(b.id === questionId && b.question_type === questionType)));
    } catch (error) {
      console.error('Error removing bookmark:', error);
    }
  };

  const getQuestionRoute = (questionType: ITopicCategory) => {
    switch (questionType) {
      case 'dsa': return '/dsa';
      case 'system-design': return '/system-design';
      case 'behavioral': return '/behavioral';
      default: return '/';
    }
  };

  if (loading) {
    return (
      <>
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading your bookmarks...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
          <Bookmark className="text-warning" />
          Your Bookmarks
        </h1>

        {bookmarks.length === 0 ? (
          <div className="text-center py-12">
            <Bookmark size={64} className="mx-auto text-base-300 mb-4" />
            <h2 className="text-xl mb-2">No bookmarks yet</h2>
            <p className="text-base-content/70 mb-6">
              Start bookmarking questions you want to review later!
            </p>
            <div className="space-x-4">
              <Link to="/dsa" className="btn btn-primary">Browse DSA</Link>
              <Link to="/system-design" className="btn btn-primary">Browse System Design</Link>
              <Link to="/behavioral" className="btn btn-primary">Browse Behavioral</Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-4">
            {bookmarks.map((question) => (
              <div
                key={`${question.question_type}-${question.id}`}
                className="p-6 bg-card rounded-lg border border-border shadow-sm"
              >
                <div>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-foreground">{question.title}</h3>
                      <div className="flex items-center gap-2 mt-4">
                        <TopicDifficulty difficulty={question.difficulty} />
                        <div className="badge badge-info capitalize p-2 rounded-md text-xs">
                          {question.question_type.replace('_', ' ')}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Link 
                        to={getQuestionRoute(question.question_type)}
                        className="btn btn-sm btn-primary"
                      >
                        <ExternalLink size={16} />
                        View
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeBookmark(question.id, question.question_type)}
                        className="btn-sm"
                      >
                        <Bookmark size={16} className="text-warning" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default Bookmarks;