import React, { useState } from 'react';
import { ShieldAlert, CheckCircle, ChevronDown, ChevronUp, Layers, HelpCircle } from 'lucide-react';

interface DomainAdvisorProps {
  currentDomain?: string;
  onSwitchToGmailMatrix?: () => void;
}

export const DomainAdvisor: React.FC<DomainAdvisorProps> = ({
  currentDomain = 'guerrillamail.com',
  onSwitchToGmailMatrix,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 transition-all">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                Domain Deliverability Advisor
              </span>
              <span className="text-[10px] px-2 py-0.2 rounded-full font-mono bg-zinc-200/70 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                @{currentDomain}
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              High acceptance on regular forums &amp; trials. May be flagged by enterprise auth systems.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-200/50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          title="Toggle deliverability breakdown"
        >
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {isExpanded && (
        <div className="mt-4 pt-3 border-t border-zinc-200 dark:border-zinc-800 space-y-3 animate-in fade-in duration-150">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {/* Accepted platforms */}
            <div className="p-3 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-1.5">
              <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center space-x-1 text-[11px]">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Generally Accepted On:</span>
              </span>
              <ul className="text-[11px] text-zinc-600 dark:text-zinc-400 list-disc list-inside space-y-0.5">
                <li>SaaS Trial Signups &amp; Newsletters</li>
                <li>One-off File Downloads &amp; Ebooks</li>
                <li>Standard Web Forums &amp; Community Boards</li>
                <li>Independent Web Stores &amp; Coupons</li>
              </ul>
            </div>

            {/* Blocked platforms */}
            <div className="p-3 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-1.5">
              <span className="font-semibold text-rose-600 dark:text-rose-400 flex items-center space-x-1 text-[11px]">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Often Blocked By:</span>
              </span>
              <ul className="text-[11px] text-zinc-600 dark:text-zinc-400 list-disc list-inside space-y-0.5">
                <li>Cloudflare / Akamai strict bot forms</li>
                <li>OpenAI, Microsoft, Apple, Google signups</li>
                <li>Steam, Discord, Netflix, Sony PSN</li>
                <li>Banks, Crypto &amp; Financial Platforms</li>
              </ul>
            </div>
          </div>

          {/* Smart recommendation */}
          <div className="p-3 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-900/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
            <div className="space-y-0.5">
              <span className="font-bold text-indigo-900 dark:text-indigo-200 flex items-center space-x-1">
                <HelpCircle className="w-3.5 h-3.5 text-indigo-500" />
                <span>Need 100% acceptance without getting blocked?</span>
              </span>
              <p className="text-[11px] text-zinc-600 dark:text-zinc-400">
                Use the <strong>Gmail Dot Matrix Engine</strong>. Because it uses your real Google MX records, no site in the world can blacklist it!
              </p>
            </div>

            {onSwitchToGmailMatrix && (
              <button
                type="button"
                onClick={onSwitchToGmailMatrix}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs flex items-center space-x-1.5 shrink-0 transition-colors cursor-pointer"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Go to Gmail Matrix</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
