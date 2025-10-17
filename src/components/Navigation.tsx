'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useAuth } from '@/hooks/useAuth';
import { Bookmark, LogOut, Menu, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { categoryConfig } from '@/config/categoryConfig';
import { UserAvatar } from '@/components/UserAvatar';

const Navigation = () => {
  const pathname = usePathname();
  const { user, signOut, loading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigationLinks = useMemo(
    () =>
      Object.values(categoryConfig).map(category => ({
        to: category.navigation.path,
        label: category.navigation.label,
        active: pathname === category.navigation.path,
      })),
    [pathname]
  );

  if (loading) {
    return null;
  }

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

            {/* Navigation Links - Desktop only */}
            <div className="hidden items-center space-x-1 md:flex">
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
                        <UserAvatar user={user} size={30} />
                      </Button>
                    </Link>
                    <div className="invisible absolute right-0 top-full mt-2 w-48 rounded-md border border-border bg-card opacity-0 shadow-lg transition-all duration-200 group-hover:visible group-hover:opacity-100">
                      <div className="py-1">
                        <Link
                          href="/profile"
                          className="flex w-full items-center space-x-2 px-4 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
                        >
                          <UserAvatar user={user} size={20} />
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

            {/* Mobile Right Side - Hamburger */}
            <div className="flex items-center space-x-2 md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2"
                aria-label="Open menu"
              >
                {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden">
            <div className="space-y-1 border-t border-border bg-card px-2 pb-3 pt-2">
              {/* Categories */}
              {navigationLinks.map(link => (
                <Link
                  key={link.to}
                  href={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-2 rounded-md px-3 py-2 text-base font-medium text-muted-foreground transition-colors duration-200 hover:bg-accent hover:text-foreground"
                >
                  <span>{link.label}</span>
                </Link>
              ))}

              {/* Auth */}
              {user ? (
                <>
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
                    <UserAvatar user={user} size={20} />
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
                </>
              ) : (
                <Link
                  href="/auth"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-2 rounded-md px-3 py-2 text-base font-medium text-muted-foreground transition-colors duration-200 hover:bg-accent hover:text-foreground"
                >
                  <span>Sign In</span>
                </Link>
              )}

              {/* Theme Toggle */}
              <div className="flex items-center justify-between rounded-md px-3 py-2">
                <span className="text-base text-muted-foreground">Theme</span>
                <ThemeToggle />
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default Navigation;
