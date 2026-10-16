import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import type { GeneratedEmail } from '../../types';

interface EmailCardProps {
  email: GeneratedEmail;
  index: number;
}

export const EmailCard: React.FC<EmailCardProps> = ({ email, index }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(email.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const textArea = document.createElement('textarea');
      textArea.value = email.address;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getTagColor = (tag: string) => {
    if (tag === 'primary') return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
    if (tag === 'domain-alias') return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
    if (tag.startsWith('+')) return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20';
    return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
  };

  return (
    <div className="group relative flex items-center justify-between p-3 sm:p-3.5 bg-white dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800/80 rounded-xl hover:border-indigo-400 dark:hover:border-indigo-500/50 hover:shadow-sm transition-all duration-150">
      <div className="flex items-center space-x-3 overflow-hidden">
        <span className="text-xs font-mono font-medium text-zinc-400 w-7 text-right select-none shrink-0">
          #{index}
        </span>
        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 truncate">
          <span className="font-mono text-sm font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight truncate select-all">
            {email.address}
          </span>
          <div className="flex items-center space-x-1.5 mt-1 sm:mt-0 shrink-0">
            {email.tags?.map((tag) => (
              <span
                key={tag}
                className={`text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full border ${getTagColor(
                  tag
                )}`}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={handleCopy}
        aria-label={`Copy ${email.address}`}
        className={`ml-2 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center space-x-1.5 transition-all duration-150 cursor-pointer shrink-0 ${
          copied
            ? 'bg-emerald-500 text-white shadow-sm'
            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950/60 dark:hover:text-indigo-400'
        }`}
      >
        {copied ? (
          <>
            <Check className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Copied!</span>
          </>
        ) : (
          <>
            <Copy className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Copy</span>
          </>
        )}
      </button>
    </div>
  );
};

