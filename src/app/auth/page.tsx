'use client';

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
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-muted-foreground">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="mx-4 w-full max-w-md">
        <div className="rounded-lg border border-border bg-card p-8 shadow-lg">
          {/* Logo/Header */}
          <div className="mb-8 text-center">
            <div className="mb-4 flex items-center justify-center space-x-2">
              <div className="flex h-10 w-10 items-center justify-center rounded bg-gradient-to-r from-primary to-accent">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <h1 className="gradient-text text-2xl font-bold">Interview Prep</h1>
            </div>
            <p className="text-muted-foreground">
              Sign in to track your progress and bookmark problems
            </p>
          </div>

          {/* Sign In Button */}
          <Button
            onClick={handleSignIn}
            className="flex w-full items-center justify-center space-x-2 py-3"
            size="lg"
          >
            <LogIn className="h-5 w-5" />
            <span>Continue with Google</span>
          </Button>

          {/* Features */}
          <div className="mt-8 border-t border-border pt-6">
            <h3 className="mb-3 text-sm font-medium text-foreground">With an account, you can:</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center space-x-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                <span>Track your progress across all categories</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                <span>Bookmark important problems and concepts</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
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
