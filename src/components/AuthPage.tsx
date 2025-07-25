import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/useToast.ts';
import { Code, Zap, Target, Users, ArrowRight, CheckCircle } from 'lucide-react';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate('/');
      }
    };
    checkAuth();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        toast({
          title: "Welcome back!",
          description: "You have successfully logged in.",
        });
        navigate('/');
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`
          }
        });
        if (error) throw error;
        toast({
          title: "Account created!",
          description: "Please check your email to confirm your account.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: Code,
      title: "DSA Practice",
      description: "Master data structures and algorithms with curated problems"
    },
    {
      icon: Target,
      title: "System Design",
      description: "Learn to design scalable systems step by step"
    },
    {
      icon: Users,
      title: "Behavioral Questions",
      description: "Ace behavioral interviews with structured answers"
    },
    {
      icon: Zap,
      title: "Track Progress",
      description: "Monitor your learning journey and bookmark favorites"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-base-100 to-secondary/10 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full grid lg:grid-cols-2 gap-8 items-center">
        {/* Left Side - Features */}
        <div className="space-y-8 animate-fade-in">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
              <Zap size={16} />
              Ace Your Tech Interviews
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-base-content">
              Master Technical
              <span className="text-primary block">Interviews</span>
            </h1>
            <p className="text-xl text-base-content/70 max-w-lg">
              Comprehensive platform for DSA, System Design, and Behavioral interview preparation
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {features.map((feature, index) => (
              <div 
                key={feature.title}
                className="flex items-start gap-3 p-4 bg-base-100/50 backdrop-blur-sm rounded-lg border border-base-300/50 hover:border-primary/20 transition-all duration-300 hover:shadow-lg animate-scale-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="bg-primary/10 p-2 rounded-lg">
                  <feature.icon size={20} className="text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-base-content">{feature.title}</h3>
                  <p className="text-sm text-base-content/60 mt-1">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-4 text-sm text-base-content/60">
            <div className="flex items-center gap-2">
              <CheckCircle size={16} className="text-success" />
              <span>1000+ Questions</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle size={16} className="text-success" />
              <span>Progress Tracking</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle size={16} className="text-success" />
              <span>Free Forever</span>
            </div>
          </div>
        </div>

        {/* Right Side - Auth Form */}
        <div className="flex justify-center lg:justify-end">
          <div className="w-full max-w-md">
            <div className="bg-base-100 shadow-2xl rounded-2xl border border-base-300/50 p-8 animate-slide-in-right">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-base-content mb-2">
                  {isLogin ? 'Welcome Back' : 'Get Started'}
                </h2>
                <p className="text-base-content/60">
                  {isLogin ? 'Sign in to continue your journey' : 'Create your account to begin'}
                </p>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="label">
                      <span className="label-text font-medium">Email</span>
                    </label>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="input input-bordered w-full transition-all duration-200 focus:scale-[1.02]"
                      placeholder="Enter your email"
                    />
                  </div>
                  
                  <div>
                    <label className="label">
                      <span className="label-text font-medium">Password</span>
                    </label>
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="input input-bordered w-full transition-all duration-200 focus:scale-[1.02]"
                      placeholder="Enter your password"
                    />
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="btn btn-primary w-full group transition-all duration-200 hover:scale-[1.02]"
                >
                  <span>{loading ? 'Loading...' : (isLogin ? 'Sign In' : 'Sign Up')}</span>
                  {!loading && <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />}
                </Button>
              </form>
              
              <div className="divider my-6">OR</div>
              
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="btn btn-ghost w-full transition-all duration-200 hover:scale-[1.02]"
              >
                {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;