"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { BookOpen, LogIn } from 'lucide-react';

export default function AuthPage() {
  const { user, loading, signInWithGoogle } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect to home if already authenticated
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
      // User will be redirected by the useEffect above
    } catch (error) {
      console.error('Sign in error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-muted-foreground">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full mx-4">
        <div className="bg-card border border-border rounded-lg shadow-lg p-8">
          {/* Logo/Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-primary to-accent rounded flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold gradient-text">Interview Prep</h1>
            </div>
            <p className="text-muted-foreground">
              Sign in to track your progress and bookmark problems
            </p>
          </div>

          {/* Sign In Button */}
          <Button 
            onClick={handleSignIn}
            className="w-full flex items-center justify-center space-x-2 py-3"
            size="lg"
          >
            <LogIn className="w-5 h-5" />
            <span>Continue with Google</span>
          </Button>

          {/* Features */}
          <div className="mt-8 pt-6 border-t border-border">
            <h3 className="text-sm font-medium text-foreground mb-3">With an account, you can:</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                <span>Track your progress across all categories</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                <span>Bookmark important problems and concepts</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                <span>Sync your data across devices</span>
              </li>
            </ul>
          </div>

          {/* Guest Access */}
          <div className="mt-6 text-center">
            <Button 
              variant="ghost" 
              onClick={() => router.push('/')}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Continue as guest
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
