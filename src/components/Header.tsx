import React, { useState } from 'react';
import { Mail, ShieldCheck, Sun, Moon, Sparkles, KeyRound } from 'lucide-react';
import { useTheme } from '../context/useTheme';
import { SignupToolkitModal } from './toolkit/SignupToolkitModal';

interface HeaderProps {
  onOpenGuide?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenGuide }) => {
  const { theme, toggleTheme } = useTheme();
  const [isToolkitOpen, setIsToolkitOpen] = useState(false);

  return (
    <>
      <header className="border-b border-zinc-200 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md sticky top-0 z-30 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg text-zinc-900 dark:text-zinc-50 tracking-tight">
                  TempGmail
                </span>
                <span className="px-2 py-0.5 text-[11px] font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60 rounded-full">
                  Power Suite
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 hidden sm:block">
                Dual-Engine Disposable Email &amp; Gmail Matrix
              </p>
            </div>
          </div>

          {/* Action Controls */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Privacy badge */}
            <div className="hidden md:flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Zero Server Logging</span>
            </div>

            {/* Quick Signup Tools button */}
            <button
              onClick={() => setIsToolkitOpen(true)}
              className="px-3 py-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50/70 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 rounded-lg border border-indigo-200/60 dark:border-indigo-800/50 transition-colors flex items-center space-x-1.5 cursor-pointer"
              title="Generate passwords and test identities"
            >
              <KeyRound className="w-3.5 h-3.5 text-indigo-500" />
              <span>Signup Tools</span>
            </button>

            {/* Quick Help Guide Button */}
            {onOpenGuide && (
              <button
                onClick={onOpenGuide}
                className="px-3 py-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex items-center space-x-1 cursor-pointer"
                title="Learn how Gmail dot tricks work"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span className="hidden sm:inline">How It Works</span>
              </button>
            )}

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="p-2 rounded-lg text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors relative cursor-pointer"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400 transition-transform hover:rotate-45" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-600 transition-transform hover:-rotate-12" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Toolkit Modal */}
      <SignupToolkitModal isOpen={isToolkitOpen} onClose={() => setIsToolkitOpen(false)} />
    </>
  );
};
