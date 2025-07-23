import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { Bookmark, ExternalLink } from 'lucide-react';
import Navigation from '@/components/Navigation';

interface BookmarkedQuestion {
  id: string;
  title: string;
  difficulty: string;
  question_type: string;
  description: string;
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

  const fetchBookmarks = async () => {
    if (!user) return;

    try {
      // Get all bookmarked progress
      const { data: progressData, error: progressError } = await supabase
        .from('user_progress')
        .select('question_id, question_type')
        .eq('user_id', user.id)
        .eq('is_bookmarked', true);

      if (progressError) throw progressError;

      // Fetch questions from each table
      const dsaIds = progressData?.filter(p => p.question_type === 'dsa').map(p => p.question_id) || [];
      const systemIds = progressData?.filter(p => p.question_type === 'system_design').map(p => p.question_id) || [];
      const behavioralIds = progressData?.filter(p => p.question_type === 'behavioral').map(p => p.question_id) || [];

      const questions: BookmarkedQuestion[] = [];

      if (dsaIds.length > 0) {
        const { data: dsaData } = await supabase
          .from('dsa_questions')
          .select('id, title, difficulty, description')
          .in('id', dsaIds);
        
        if (dsaData) {
          questions.push(...dsaData.map(q => ({ ...q, question_type: 'dsa' })));
        }
      }

      if (systemIds.length > 0) {
        const { data: systemData } = await supabase
          .from('system_design_questions')
          .select('id, title, difficulty, description')
          .in('id', systemIds);
        
        if (systemData) {
          questions.push(...systemData.map(q => ({ ...q, question_type: 'system_design' })));
        }
      }

      if (behavioralIds.length > 0) {
        const { data: behavioralData } = await supabase
          .from('behavioral_questions')
          .select('id, title, difficulty, description')
          .in('id', behavioralIds);
        
        if (behavioralData) {
          questions.push(...behavioralData.map(q => ({ ...q, question_type: 'behavioral' })));
        }
      }

      setBookmarks(questions);
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeBookmark = async (questionId: string, questionType: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_progress')
        .update({ is_bookmarked: false, bookmarked_at: null })
        .eq('user_id', user.id)
        .eq('question_id', questionId)
        .eq('question_type', questionType);

      if (error) throw error;

      setBookmarks(prev => prev.filter(b => b.id !== questionId));
    } catch (error) {
      console.error('Error removing bookmark:', error);
    }
  };

  const getQuestionRoute = (questionType: string) => {
    switch (questionType) {
      case 'dsa': return '/dsa';
      case 'system_design': return '/system-design';
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
              <div key={`${question.question_type}-${question.id}`} className="card bg-base-100 shadow-lg">
                <div className="card-body">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="card-title text-lg">{question.title}</h3>
                      <p className="text-base-content/70 mt-2">{question.description}</p>
                      <div className="flex items-center gap-2 mt-4">
                        <Badge variant={
                          question.difficulty === 'easy' ? 'default' : 
                          question.difficulty === 'medium' ? 'secondary' : 
                          'destructive'
                        }>
                          {question.difficulty}
                        </Badge>
                        <Badge variant="outline" className="capitalize">
                          {question.question_type.replace('_', ' ')}
                        </Badge>
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