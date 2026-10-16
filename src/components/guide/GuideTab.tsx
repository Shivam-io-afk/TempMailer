import React from 'react';
import {
  Layers,
  Flame,
  Shield,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  ExternalLink,
  Zap,
} from 'lucide-react';

export const GuideTab: React.FC = () => {
  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Intro Header */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex items-center space-x-3 mb-3">
          <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              Mastering Disposable &amp; Alias Emails
            </h1>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
              Understand the RFC standards, mathematical permutations, and how to protect your real inbox from spam.
            </p>
          </div>
        </div>
      </div>

      {/* Comparison Matrix */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 sm:p-7 shadow-sm">
        <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mb-4 flex items-center space-x-2">
          <Zap className="w-4 h-4 text-amber-500" />
          <span>Which Engine Should You Use?</span>
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-400 uppercase tracking-wider text-[10px]">
                <th className="pb-3 font-semibold">Engine</th>
                <th className="pb-3 font-semibold">Where Mail Goes</th>
                <th className="pb-3 font-semibold">Privacy Level</th>
                <th className="pb-3 font-semibold">Website Compatibility</th>
                <th className="pb-3 font-semibold">Best For</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
              <tr>
                <td className="py-3.5 pr-4">
                  <div className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center space-x-1.5">
                    <Layers className="w-4 h-4 text-indigo-500" />
                    <span>Gmail Dot Matrix</span>
                  </div>
                  <span className="text-[10px] text-zinc-400 font-mono">j.o.h.n@gmail.com</span>
                </td>
                <td className="py-3.5 pr-4 text-zinc-600 dark:text-zinc-300">
                  Your real Gmail inbox
                </td>
                <td className="py-3.5 pr-4">
                  <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 font-medium">
                    Medium
                  </span>
                </td>
                <td className="py-3.5 pr-4">
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                    100% Accepted
                  </span>
                  <p className="text-[10px] text-zinc-400">Passes all email validators</p>
                </td>
                <td className="py-3.5 text-zinc-600 dark:text-zinc-300">
                  Multiple accounts on sites that disallow temporary mail domains.
                </td>
              </tr>

              <tr>
                <td className="py-3.5 pr-4">
                  <div className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center space-x-1.5">
                    <Shield className="w-4 h-4 text-purple-500" />
                    <span>Plus Tagging (+tag)</span>
                  </div>
                  <span className="text-[10px] text-zinc-400 font-mono">john+netflix@gmail.com</span>
                </td>
                <td className="py-3.5 pr-4 text-zinc-600 dark:text-zinc-300">
                  Your real Gmail inbox
                </td>
                <td className="py-3.5 pr-4">
                  <span className="px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 font-medium">
                    High (Leak Detection)
                  </span>
                </td>
                <td className="py-3.5 pr-4">
                  <span className="text-amber-600 dark:text-amber-400 font-semibold">
                    ~90% Accepted
                  </span>
                  <p className="text-[10px] text-zinc-400">Some legacy forms reject '+'</p>
                </td>
                <td className="py-3.5 text-zinc-600 dark:text-zinc-300">
                  Tracking which service sold your data or automated Gmail sorting.
                </td>
              </tr>

              <tr>
                <td className="py-3.5 pr-4">
                  <div className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center space-x-1.5">
                    <Flame className="w-4 h-4 text-amber-500" />
                    <span>Live Burner Mail</span>
                  </div>
                  <span className="text-[10px] text-zinc-400 font-mono">x8k@guerrillamail.com</span>
                </td>
                <td className="py-3.5 pr-4 text-zinc-600 dark:text-zinc-300">
                  Isolated in-browser inbox
                </td>
                <td className="py-3.5 pr-4">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-medium">
                    100% Anonymous
                  </span>
                </td>
                <td className="py-3.5 pr-4">
                  <span className="text-zinc-600 dark:text-zinc-300 font-semibold">
                    ~75% Accepted
                  </span>
                  <p className="text-[10px] text-zinc-400">Blocked by aggressive sites</p>
                </td>
                <td className="py-3.5 text-zinc-600 dark:text-zinc-300">
                  One-time verification codes, untrusted downloads, total anonymity.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Guide Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: How Gmail Dots Work */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-3">
          <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm">
            <Layers className="w-4 h-4" />
            <h3>The Mathematics of Gmail Dots</h3>
          </div>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Google’s mail routing servers disregard periods in usernames. To Google,{' '}
            <code className="bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded font-mono text-[11px]">
              j.o.h.n@gmail.com
            </code>{' '}
            and{' '}
            <code className="bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded font-mono text-[11px]">
              john@gmail.com
            </code>{' '}
            are identical mailboxes.
          </p>
          <div className="p-3 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-mono">
            <span className="text-indigo-600 dark:text-indigo-400">Formula:</span> Combinations = 2<sup>(Length - 1)</sup>
            <p className="text-[11px] text-zinc-400 mt-1 font-sans">
              An 8-character name gives 2<sup>7</sup> = <strong>128 unique addresses</strong>!
            </p>
          </div>
        </div>

        {/* Card 2: Catching Spammers with Plus Addressing */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-3">
          <div className="flex items-center space-x-2 text-purple-600 dark:text-purple-400 font-bold text-sm">
            <Shield className="w-4 h-4" />
            <h3>Catch Spammers &amp; Data Leaks</h3>
          </div>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
            When signing up for a service, append <code className="bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded font-mono text-[11px]">+servicename</code> to your username.
          </p>
          <div className="p-3 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs space-y-1">
            <p className="font-mono text-zinc-800 dark:text-zinc-200 text-[11px]">
              you+cryptoapp@gmail.com
            </p>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-sans">
              If you suddenly receive loan spam addressed to <code className="font-mono text-[10px]">you+cryptoapp</code>, you have irrefutable proof that this app leaked or sold your data!
            </p>
          </div>
        </div>
      </div>

      {/* Gmail Filter 3-Step Walkthrough */}
      <div className="bg-gradient-to-br from-indigo-50/60 to-violet-50/60 dark:from-zinc-900 dark:to-zinc-900/60 border border-indigo-100 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-sm">
        <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mb-2 flex items-center space-x-2">
          <CheckCircle2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <span>How to Auto-Archive &amp; Organize with Gmail Filter XML</span>
        </h3>
        <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-6">
          When using hundreds of alias addresses, you do not want your main inbox spammed. Here is the 1-minute setup:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-zinc-950 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-2">
            <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">
              1
            </span>
            <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
              Download Filter XML
            </h4>
            <p className="text-[11px] text-zinc-500 leading-relaxed">
              In the Generator tab, click <strong>Create Gmail Filter</strong>, pick your label name (e.g. <em>Temp-Signups</em>), and download the XML.
            </p>
          </div>

          <div className="bg-white dark:bg-zinc-950 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-2">
            <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">
              2
            </span>
            <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
              Open Gmail Settings
            </h4>
            <p className="text-[11px] text-zinc-500 leading-relaxed">
              Navigate to{' '}
              <a
                href="https://mail.google.com/mail/u/0/#settings/filters"
                target="_blank"
                rel="noreferrer"
                className="text-indigo-600 dark:text-indigo-400 underline inline-flex items-center"
              >
                <span>Gmail Settings → Filters</span>
                <ExternalLink className="w-2.5 h-2.5 ml-0.5" />
              </a>.
            </p>
          </div>

          <div className="bg-white dark:bg-zinc-950 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-2">
            <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">
              3
            </span>
            <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
              Import &amp; Relax
            </h4>
            <p className="text-[11px] text-zinc-500 leading-relaxed">
              Click <strong>Import filters</strong> at the bottom of the page, choose the downloaded file, and click <strong>Create filters</strong>. Done!
            </p>
          </div>
        </div>
      </div>

      {/* Safety & Best Practices */}
      <div className="bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 rounded-2xl p-5 text-xs text-amber-900 dark:text-amber-200 space-y-2">
        <div className="flex items-center space-x-2 font-bold text-amber-800 dark:text-amber-300">
          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
          <span>Crucial Security Rule</span>
        </div>
        <p className="leading-relaxed text-[11px] text-amber-800/90 dark:text-amber-300/90">
          <strong>Never use disposable burner inboxes for permanent accounts</strong> (like banking, crypto exchanges, or Steam). Burner inboxes are temporary and expire after 1 hour. For accounts you intend to keep, use the <strong>Gmail Dot Matrix</strong> engine so recovery emails always arrive safely in your personal inbox.
        </p>
      </div>
    </div>
  );
};
