import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useAuth } from '@/hooks/useAuth';
import { Bookmark, User, LogOut } from 'lucide-react';

const Navigation = () => {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const isHomePage = location.pathname === '/';

  if (isHomePage) return null;

  return (
    <nav className="navbar bg-background border-b border-border shadow-lg sticky top-0 z-50 transition-all duration-300">
      <div className="navbar-start">
        <Link to="/" className="btn btn-ghost normal-case text-xl">
          Interview Prep
        </Link>
      </div>
      
      <div className="navbar-center">
        <div className="menu menu-horizontal px-1">
          <Link 
            to="/dsa" 
            className={`btn btn-ghost ${location.pathname === '/dsa' ? 'btn-active' : ''}`}
          >
            DSA
          </Link>
          <Link 
            to="/system-design" 
            className={`btn btn-ghost ${location.pathname === '/system-design' ? 'btn-active' : ''}`}
          >
            System Design
          </Link>
          <Link 
            to="/behavioral" 
            className={`btn btn-ghost ${location.pathname === '/behavioral' ? 'btn-active' : ''}`}
          >
            Behavioral
          </Link>
        </div>
      </div>
      
      <div className="navbar-end space-x-2">
        {user ? (
          <>
            <Link to="/bookmarks" className="btn btn-ghost btn-sm">
              <Bookmark size={16} />
              Bookmarks
            </Link>
            <div className="dropdown dropdown-end">
              <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
                <User size={20} />
              </label>
              <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-card border border-border rounded-box w-52">
                <li>
                  <button onClick={signOut} className="text-error">
                    <LogOut size={16} />
                    Sign Out
                  </button>
                </li>
              </ul>
            </div>
          </>
        ) : (
          <Link to="/auth" className="btn btn-primary btn-sm">
            Sign In
          </Link>
        )}
        <ThemeToggle />
      </div>
    </nav>
  );
};

export default Navigation;