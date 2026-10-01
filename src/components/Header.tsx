import React from 'react';
import {
  Sparkles,
  Cloud,
  Moon,
  Sun,
  User,
  LogOut,
  LogIn,
  BrainCircuit,
  History,
  BookmarkCheck,
  BarChart3,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  currentTab: 'practice' | 'history' | 'flashcards' | 'analytics';
  setCurrentTab: (tab: 'practice' | 'history' | 'flashcards' | 'analytics') => void;
  isDark: boolean;
  setIsDark: (dark: boolean) => void;
  isInterviewActive: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  isDark,
  setIsDark,
  isInterviewActive,
}) => {
  const { user, userProfile, signInWithGoogle, signOutUser } = useAuth();
  const [profileOpen, setProfileOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-surface/90 border-b border-outline-variant/40 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => !isInterviewActive && setCurrentTab('practice')}
            className="flex items-center gap-2.5 text-left group"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#5944d1] to-[#825500] flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg tracking-tight text-on-surface">
                  AceMock
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                  M3 Precision
                </span>
              </div>
              <p className="text-xs text-on-surface-variant hidden sm:block">
                AI Mock Interview & Evaluation Engine
              </p>
            </div>
          </button>
        </div>

        {/* Navigation Tabs */}
        {!isInterviewActive && (
          <nav className="hidden md:flex items-center gap-1 p-1 bg-surface-container-low rounded-full border border-outline-variant/50">
            <button
              onClick={() => setCurrentTab('practice')}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
                currentTab === 'practice'
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Practice Arena
            </button>
            <button
              onClick={() => setCurrentTab('history')}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
                currentTab === 'history'
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              Cloud History
            </button>
            <button
              onClick={() => setCurrentTab('flashcards')}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
                currentTab === 'flashcards'
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
              }`}
            >
              <BookmarkCheck className="w-3.5 h-3.5" />
              Saved Insights
            </button>
            <button
              onClick={() => setCurrentTab('analytics')}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
                currentTab === 'analytics'
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              Readiness Radar
            </button>
          </nav>
        )}

        {/* Right Actions: Theme Toggle & Cloud/Auth */}
        <div className="flex items-center gap-2">
          {/* Cloud sync indicator */}
          <div
            title={user ? 'Cloud sync active (Firestore)' : 'Local mode (Sign in to sync with Cloud)'}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-surface-container text-on-surface-variant border border-outline-variant/60"
          >
            <Cloud className={`w-3.5 h-3.5 ${user ? 'text-emerald-500' : 'text-amber-500'}`} />
            <span className="hidden sm:inline">
              {user ? 'Cloud Synced' : 'Guest Mode'}
            </span>
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                user ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'
              }`}
            />
          </div>

          {/* Theme Switcher */}
          <button
            onClick={() => setIsDark(!isDark)}
            aria-label="Toggle theme"
            className="p-2 rounded-full text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* User Auth Dropdown */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 p-1 pl-2 rounded-full bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant transition-colors"
              >
                <span className="text-xs font-semibold text-on-surface max-w-[100px] truncate hidden sm:inline">
                  {user.displayName?.split(' ')[0] || 'Candidate'}
                </span>
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-7 h-7 rounded-full object-cover border border-primary/40"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-primary text-on-primary flex items-center justify-center text-xs font-bold">
                    {user.displayName?.[0] || 'C'}
                  </div>
                )}
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-surface-container-lowest border border-outline-variant shadow-xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-2 py-2 border-b border-outline-variant/50">
                    <p className="text-xs font-bold text-on-surface truncate">
                      {user.displayName || 'Candidate'}
                    </p>
                    <p className="text-[11px] text-on-surface-variant truncate">
                      {user.email}
                    </p>
                    <div className="mt-2 flex items-center justify-between text-[11px] text-on-surface-variant">
                      <span>Interviews Done:</span>
                      <span className="font-bold text-primary">{userProfile?.totalInterviews || 0}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-on-surface-variant">
                      <span>Avg Score:</span>
                      <span className="font-bold text-primary">{userProfile?.averageScore || 0}%</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      signOutUser();
                    }}
                    className="w-full mt-2 flex items-center gap-2 px-3 py-2 text-xs font-medium text-red-600 dark:text-red-400 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => signInWithGoogle()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-primary text-on-primary hover:opacity-95 shadow-sm transition-all"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Google Sign-In</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Sub-Nav */}
      {!isInterviewActive && (
        <div className="md:hidden flex items-center justify-around px-2 py-1.5 border-t border-outline-variant/30 bg-surface-container-low text-xs">
          <button
            onClick={() => setCurrentTab('practice')}
            className={`py-1 px-2.5 rounded-full font-medium ${
              currentTab === 'practice' ? 'bg-primary text-on-primary' : 'text-on-surface-variant'
            }`}
          >
            Practice
          </button>
          <button
            onClick={() => setCurrentTab('history')}
            className={`py-1 px-2.5 rounded-full font-medium ${
              currentTab === 'history' ? 'bg-primary text-on-primary' : 'text-on-surface-variant'
            }`}
          >
            History
          </button>
          <button
            onClick={() => setCurrentTab('flashcards')}
            className={`py-1 px-2.5 rounded-full font-medium ${
              currentTab === 'flashcards' ? 'bg-primary text-on-primary' : 'text-on-surface-variant'
            }`}
          >
            Saved
          </button>
          <button
            onClick={() => setCurrentTab('analytics')}
            className={`py-1 px-2.5 rounded-full font-medium ${
              currentTab === 'analytics' ? 'bg-primary text-on-primary' : 'text-on-surface-variant'
            }`}
          >
            Radar
          </button>
        </div>
      )}
    </header>
  );
};
