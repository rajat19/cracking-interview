"use client";

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
    { to: '/dsa', label: 'DSA', active: pathname === '/dsa' },
    { to: '/system-design', label: 'System Design', active: pathname === '/system-design' },
    { to: '/ood', label: 'OOD', active: pathname === '/ood' },
    { to: '/behavioral', label: 'Behavioral', active: pathname === '/behavioral' },
  ];

  return (
    <>
      <nav className="bg-background border-b border-border shadow-lg sticky top-0 z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <span className="font-bold text-lg sm:text-xl text-foreground">
                  <span className="hidden sm:inline">Interview Prep</span>
                  <span className="sm:hidden">Prep</span>
                </span>
              </Link>
            </div>

            {/* Navigation Links - Always Visible */}
            <div className="flex items-center space-x-1">
              {navigationLinks.map((link) => (
                <Link
                  key={link.to}
                  href={link.to}
                  className={`px-2 md:px-3 py-2 rounded-md text-xs md:text-sm font-medium transition-colors duration-200 ${
                    link.active
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  }`}
                >
                  <span className="hidden sm:inline">{link.label}</span>
                  <span className="sm:hidden">
                    {link.label === 'System Design' ? 'Design' : 
                     link.label === 'Behavioral' ? 'Behav' :
                     link.label}
                  </span>
                </Link>
              ))}
            </div>

            {/* Desktop Right Side */}
            <div className="hidden md:flex items-center space-x-3">
              {user ? (
                <>
                  <Link 
                    href="/profile" 
                    className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors duration-200"
                  >
                    <Bookmark size={16} />
                    <span>Bookmarks</span>
                  </Link>
                  <div className="relative group">
                    <Link href="/profile">
                      <Button variant="ghost" size="sm" className="flex items-center space-x-1">
                        <User size={16} />
                      </Button>
                    </Link>
                    <div className="absolute right-0 top-full mt-2 w-48 bg-card border border-border rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                      <div className="py-1">
                        <Link
                          href="/profile"
                          className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent"
                        >
                          <User size={16} />
                          <span>Profile</span>
                        </Link>
                        <button
                          onClick={signOut}
                          className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent"
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
            <div className="md:hidden flex items-center space-x-2">
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
                  <Button size="sm" className="text-xs px-2 py-1">Sign In</Button>
                </Link>
              )}
              <ThemeToggle />
            </div>
          </div>
        </div>

        {/* Mobile User Menu */}
        {mobileMenuOpen && user && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-card border-t border-border">
              <Link
                href="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors duration-200"
              >
                <Bookmark size={16} />
                <span>Bookmarks</span>
              </Link>
              <Link
                href="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors duration-200"
              >
                <User size={16} />
                <span>Profile</span>
              </Link>
              <button
                onClick={() => {
                  signOut();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center space-x-2 w-full px-3 py-2 rounded-md text-base font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors duration-200"
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