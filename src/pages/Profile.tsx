import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { loadTopicsList } from '@/lib/contentLoader';
import { getCachedCategoryProgress, preloadUserProgress, upsertUserProgress } from '@/lib/progressStore';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Bookmark, ExternalLink, CheckCircle, UserCircle, LogOut } from 'lucide-react';
import TopicDifficulty from '@/components/TopicDifficulty';
import { ITopicCategory } from '@/types/topic';

interface ProgressItem {
  id: string;
  title: string;
  difficulty: string;
  question_type: ITopicCategory;
  description?: string;
}

const Profile = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [bookmarks, setBookmarks] = useState<ProgressItem[]>([]);
  const [completed, setCompleted] = useState<ProgressItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'bookmarks' | 'completed'>('bookmarks');

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchProgress();
  }, [user, navigate]);

  const fetchProgress = useCallback(async () => {
    if (!user) return;
    try {
      const [dsa, system, behavioral] = await Promise.all([
        loadTopicsList('dsa'),
        loadTopicsList('system-design'),
        loadTopicsList('behavioral'),
      ]);

      const categories = [
        { id: 'dsa' as ITopicCategory, topics: dsa },
        { id: 'system-design' as ITopicCategory, topics: system },
        { id: 'behavioral' as ITopicCategory, topics: behavioral },
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
        <div className="container mx-auto px-4 py-8 text-center">Loading profile...</div>
      </>
    );
  }

  return (
    <>
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-8">
          <div className="flex flex-col items-center">
            {user?.photoURL ? (
              <img 
                src={user.photoURL} 
                alt="Profile" 
                className="w-24 h-24 rounded-full border-2 border-primary shadow-lg"
              />
            ) : (
              <UserCircle size={96} className="text-primary" />
            )}
            <h1 className="text-2xl font-bold mt-4">{user?.displayName || 'User'}</h1>
            <p className="text-muted-foreground">{user?.email}</p>
            <Button 
              variant="ghost" 
              onClick={signOut} 
              className="mt-4 flex items-center gap-2"
            >
              <LogOut size={16} />
              Sign Out
            </Button>
          </div>
          
          <div className="flex-1 w-full">
            <div className="flex border-b border-border mb-6">
              <button 
                className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === 'bookmarks' 
                    ? 'border-primary text-primary bg-primary/10' 
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                }`}
                onClick={() => setActiveTab('bookmarks')}
              >
                Bookmarks ({bookmarks.length})
              </button>
              <button 
                className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === 'completed' 
                    ? 'border-primary text-primary bg-primary/10' 
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                }`}
                onClick={() => setActiveTab('completed')}
              >
                Completed ({completed.length})
              </button>
            </div>

            <div className="grid gap-4">
              {(activeTab === 'bookmarks' ? bookmarks : completed).map((item) => (
                <div
                  key={`${item.question_type}-${item.id}`}
                  className="p-6 bg-card rounded-lg border border-border shadow-sm"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
                      <p className="text-muted-foreground mt-2">{item.description}</p>
                      <div className="flex items-center gap-2 mt-4">
                        <TopicDifficulty difficulty={item.difficulty} />
                        <div className="badge badge-info capitalize p-2 rounded-md text-xs">
                          {item.question_type.replace('_', ' ')}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Link 
                        to={getQuestionRoute(item.question_type)}
                        className="btn btn-sm btn-primary"
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

            { (activeTab === 'bookmarks' ? bookmarks : completed).length === 0 && (
              <div className="text-center py-12">
                {activeTab === 'bookmarks' ?
                    <Bookmark size={64} className="mx-auto text-base-300 mb-4" />
                    :
                    <CheckCircle size={64} className="mx-auto text-base-300 mb-4 text-success" />
                }
                <h2 className="text-xl mb-2">No {activeTab} yet</h2>
                <p className="text-base-content/70 mb-6">
                  {activeTab === 'bookmarks' 
                    ? 'Start bookmarking questions you want to review later!' 
                    : 'Start completing questions to track your progress!'}
                </p>
                <div className="space-x-4">
                  <Link to="/dsa" className="btn btn-primary">Browse DSA</Link>
                  <Link to="/system-design" className="btn btn-primary">Browse System Design</Link>
                  <Link to="/behavioral" className="btn btn-primary">Browse Behavioral</Link>
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
