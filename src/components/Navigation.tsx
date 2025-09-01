'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useAuth } from '@/hooks/useAuth';
import { Bookmark, User, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';

const Navigation = () => {
  const pathname = usePathname();
  const { user, signOut, loading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (loading) {
    return null;
  }

  const navigationLinks = [
    { to: '/topics/dsa', label: 'DSA', active: pathname === '/topics/dsa' },
    {
      to: '/topics/system-design',
      label: 'System Design',
      active: pathname === '/topics/system-design',
    },
    { to: '/topics/ood', label: 'OOD', active: pathname === '/topics/ood' },
    { to: '/topics/behavioral', label: 'Behavioral', active: pathname === '/topics/behavioral' },
  ];

  return (
    <>
      <nav className="sticky top-0 z-50 border-b border-border bg-background shadow-lg transition-all duration-300">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <span className="text-lg font-bold text-foreground sm:text-xl">
                  <span className="hidden sm:inline">Cracking Interview</span>
                  <span className="sm:hidden">Cracking Interview</span>
                </span>
              </Link>
            </div>

            {/* Navigation Links - Always Visible */}
            <div className="flex items-center space-x-1">
              {navigationLinks.map(link => (
                <Link
                  key={link.to}
                  href={link.to}
                  className={`rounded-md px-2 py-2 text-xs font-medium transition-colors duration-200 md:px-3 md:text-sm ${
                    link.active
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  }`}
                >
                  <span className="hidden sm:inline">{link.label}</span>
                  <span className="sm:hidden">
                    {link.label === 'System Design'
                      ? 'Design'
                      : link.label === 'Behavioral'
                        ? 'Behav'
                        : link.label}
                  </span>
                </Link>
              ))}
            </div>

            {/* Desktop Right Side */}
            <div className="hidden items-center space-x-3 md:flex">
              {user ? (
                <>
                  <Link
                    href="/profile"
                    className="flex items-center space-x-1 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors duration-200 hover:bg-accent hover:text-foreground"
                  >
                    <Bookmark size={16} />
                    <span>Bookmarks</span>
                  </Link>
                  <div className="group relative">
                    <Link href="/profile">
                      <Button variant="ghost" size="sm" className="flex items-center space-x-1">
                        <User size={16} />
                      </Button>
                    </Link>
                    <div className="invisible absolute right-0 top-full mt-2 w-48 rounded-md border border-border bg-card opacity-0 shadow-lg transition-all duration-200 group-hover:visible group-hover:opacity-100">
                      <div className="py-1">
                        <Link
                          href="/profile"
                          className="flex w-full items-center space-x-2 px-4 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
                        >
                          <User size={16} />
                          <span>Profile</span>
                        </Link>
                        <button
                          onClick={signOut}
                          className="flex w-full items-center space-x-2 px-4 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
                        >
                          <LogOut size={16} />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <Link href="/auth">
                  <Button size="sm">Sign In</Button>
                </Link>
              )}
              <ThemeToggle />
            </div>

            {/* Mobile Right Side */}
            <div className="flex items-center space-x-2 md:hidden">
              {user ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="p-2"
                >
                  {mobileMenuOpen ? <X size={16} /> : <User size={16} />}
                </Button>
              ) : (
                <Link href="/auth">
                  <Button size="sm" className="px-2 py-1 text-xs">
                    Sign In
                  </Button>
                </Link>
              )}
              <ThemeToggle />
            </div>
          </div>
        </div>

        {/* Mobile User Menu */}
        {mobileMenuOpen && user && (
          <div className="md:hidden">
            <div className="space-y-1 border-t border-border bg-card px-2 pb-3 pt-2">
              <Link
                href="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-2 rounded-md px-3 py-2 text-base font-medium text-muted-foreground transition-colors duration-200 hover:bg-accent hover:text-foreground"
              >
                <Bookmark size={16} />
                <span>Bookmarks</span>
              </Link>
              <Link
                href="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-2 rounded-md px-3 py-2 text-base font-medium text-muted-foreground transition-colors duration-200 hover:bg-accent hover:text-foreground"
              >
                <User size={16} />
                <span>Profile</span>
              </Link>
              <button
                onClick={() => {
                  signOut();
                  setMobileMenuOpen(false);
                }}
                className="flex w-full items-center space-x-2 rounded-md px-3 py-2 text-base font-medium text-muted-foreground transition-colors duration-200 hover:bg-accent hover:text-foreground"
              >
                <LogOut size={16} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default Navigation;
