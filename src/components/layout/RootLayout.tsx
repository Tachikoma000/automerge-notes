import React, { useState, useEffect } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';

export default function RootLayout() {
  // Check if in demo mode
  const [isDemoMode, setIsDemoMode] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Detect demo mode from URL parameters
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    setIsDemoMode(searchParams.get('demo') === 'true');
  }, [location]);

  // Function to exit demo mode
  const exitDemoMode = () => {
    const searchParams = new URLSearchParams(location.search);
    searchParams.delete('demo');
    
    // Create the new URL without the demo parameter
    const newSearch = searchParams.toString();
    const newPath = location.pathname + (newSearch ? `?${newSearch}` : '');
    
    // Navigate to the same page without the demo parameter
    navigate(newPath);
  };

  // Theme state
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    // Check for user preference in localStorage or system preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') return true;
    if (savedTheme === 'light') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Set the theme class on document element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Toggle theme function
  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {isDemoMode && (
        <div className="bg-yellow-100 dark:bg-yellow-900 border-b border-yellow-200 dark:border-yellow-800 py-2 px-4">
          <div className="container max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-yellow-600 dark:text-yellow-400">
                <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                You are currently in Demo Mode. Changes will not be saved permanently.
              </span>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={exitDemoMode}
              className="ml-4 bg-white dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200 border-yellow-300 dark:border-yellow-700 hover:bg-yellow-50 dark:hover:bg-yellow-700"
            >
              Exit Demo Mode
            </Button>
          </div>
        </div>
      )}
      <header className="border-b sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/50">
        <div className="container flex h-14 max-w-7xl items-center">
          <div className="mr-4 flex">
            <Link to="/" className="flex items-center space-x-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                <path d="M14 2v6h6"/>
                <path d="M8 13h8"/>
                <path d="M8 17h8"/>
                <path d="M8 9h2"/>
              </svg>
              <span className="font-bold hidden sm:inline-block">Arcane Studio</span>
            </Link>
          </div>
          
          <nav className="flex items-center space-x-1 md:space-x-2">
            <NavLink 
              to="/" 
              end
              className={({ isActive }) => 
                `px-3 py-2 text-sm font-medium transition-colors hover:text-primary rounded-md ${
                  isActive ? 'text-primary' : 'text-muted-foreground'
                }`
              }
            >
              Dashboard
            </NavLink>
            <NavLink 
              to="/files" 
              className={({ isActive }) => 
                `px-3 py-2 text-sm font-medium transition-colors hover:text-primary rounded-md ${
                  isActive ? 'text-primary' : 'text-muted-foreground'
                }`
              }
            >
              Files
            </NavLink>
          </nav>
          
          <div className="ml-auto flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleTheme}
              aria-label="Toggle theme"
            >
              {darkMode ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v2" />
                  <path d="M12 20v2" />
                  <path d="m4.93 4.93 1.41 1.41" />
                  <path d="m17.66 17.66 1.41 1.41" />
                  <path d="M2 12h2" />
                  <path d="M20 12h2" />
                  <path d="m6.34 17.66-1.41 1.41" />
                  <path d="m19.07 4.93-1.41 1.41" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                </svg>
              )}
            </Button>
            
            <NavLink to="/settings">
              <Button 
                variant="ghost" 
                size="icon"
                aria-label="Settings"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </Button>
            </NavLink>
            
            <Button asChild variant="default" size="sm">
              <Link to="/editor/new">New Document</Link>
            </Button>
          </div>
        </div>
      </header>
      
      <main className="flex-1">
        <Outlet />
      </main>
      
      <footer className="border-t py-4 text-center text-sm text-muted-foreground">
        <div className="container">
          <p>© {new Date().getFullYear()} Arcane Studio. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
