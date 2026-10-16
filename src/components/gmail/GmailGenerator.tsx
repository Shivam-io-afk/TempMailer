import React, { useState, useMemo } from 'react';
import { Mail, Sliders, Shield, AlertCircle, RefreshCw } from 'lucide-react';
import type { GmailGeneratorConfig, DotMode, PlusMode } from '../../types';
import {
  validateGmailInput,
  generateGmailVariations,
  getDotCombinationsCount,
} from '../../utils/gmailGenerator';
import { EmailCard } from './EmailCard';
import { ExportActions } from './ExportActions';
import { FilterModal } from './FilterModal';

export const GmailGenerator: React.FC = () => {
  const [emailInput, setEmailInput] = useState('alex.turner@gmail.com');
  const [enableDots, setEnableDots] = useState(true);
  const [dotMode, setDotMode] = useState<DotMode>('all');
  const [maxResults, setMaxResults] = useState(50);
  const [enablePlus, setEnablePlus] = useState(true);
  const [plusMode, setPlusMode] = useState<PlusMode>('preset');
  const [customTag, setCustomTag] = useState('');
  const [includeGooglemail, setIncludeGooglemail] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [displayLimit, setDisplayLimit] = useState(50);

  // Validate input
  const validation = useMemo(() => validateGmailInput(emailInput), [emailInput]);

  // Total mathematical combinations
  const combinationStats = useMemo(() => {
    if (!validation.isValid) return { dots: 0, total: 0 };
    const dots = getDotCombinationsCount(validation.normalizedLocalPart.length);
    const plusMultiplier = enablePlus ? (plusMode === 'preset' ? 12 : 5) : 1;
    const domainMultiplier = includeGooglemail ? 2 : 1;
    return {
      dots,
      total: dots * plusMultiplier * domainMultiplier,
    };
  }, [validation, enablePlus, plusMode, includeGooglemail]);

  // Generate variations
  const generatedData = useMemo(() => {
    if (!validation.isValid) {
      return { emails: [], totalPossible: 0, normalizedLocalPart: '', domain: 'gmail.com' };
    }

    const config: GmailGeneratorConfig = {
      email: emailInput,
      enableDots,
      dotMode,
      maxResults,
      enablePlus,
      plusMode,
      customTag,
      includeGooglemail,
    };

    return generateGmailVariations(config);
  }, [
    emailInput,
    validation.isValid,
    enableDots,
    dotMode,
    maxResults,
    enablePlus,
    plusMode,
    customTag,
    includeGooglemail,
  ]);

  // Filtered emails based on search bar
  const filteredEmails = useMemo(() => {
    if (!searchQuery.trim()) return generatedData.emails;
    const query = searchQuery.toLowerCase().trim();
    return generatedData.emails.filter(
      (e) => e.address.toLowerCase().includes(query) || e.tags?.some((t) => t.includes(query))
    );
  }, [generatedData.emails, searchQuery]);

  // Visible sliced list for optimal rendering performance
  const visibleEmails = useMemo(() => {
    return filteredEmails.slice(0, displayLimit);
  }, [filteredEmails, displayLimit]);

  return (
    <div className="space-y-6">
      {/* Input & Configuration Card */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 sm:p-7 shadow-sm transition-all">
        {/* Email Input Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Your Primary Gmail Address
            </label>
            <div className="flex items-center space-x-2 text-xs text-zinc-400">
              <span>Quick tests:</span>
              <button
                type="button"
                onClick={() => setEmailInput('dev.tester@gmail.com')}
                className="text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
              >
                dev.tester
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => setEmailInput('cyber.ninja@gmail.com')}
                className="text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
              >
                cyber.ninja
              </button>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
              <Mail className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={emailInput}
              onChange={(e) => {
                setEmailInput(e.target.value);
                setDisplayLimit(50);
              }}
              placeholder="e.g. yourname@gmail.com"
              className={`w-full pl-11 pr-24 py-3 text-base sm:text-lg font-mono rounded-xl border bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 transition-all focus:outline-none focus:ring-2 ${
                validation.isValid
                  ? 'border-zinc-200 dark:border-zinc-800 focus:border-indigo-500 focus:ring-indigo-500/20'
                  : 'border-rose-400 dark:border-rose-800 focus:border-rose-500 focus:ring-rose-500/20'
              }`}
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="text-xs font-semibold px-2 py-1 rounded bg-zinc-200/80 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                @gmail.com
              </span>
            </div>
          </div>

          {/* Validation Warning if invalid */}
          {!validation.isValid && validation.error && (
            <div className="flex items-center space-x-1.5 text-xs text-rose-600 dark:text-rose-400 pt-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{validation.error}</span>
            </div>
          )}

          {/* Privacy Note */}
          <div className="flex flex-wrap items-center justify-between text-xs text-zinc-500 pt-1">
            <span className="flex items-center space-x-1 text-emerald-600 dark:text-emerald-400">
              <Shield className="w-3.5 h-3.5" />
              <span>Processed locally in browser memory. Never uploaded or saved remotely.</span>
            </span>
            {validation.isValid && (
              <span className="font-mono text-[11px] text-zinc-400">
                Base: {validation.normalizedLocalPart}@gmail.com
              </span>
            )}
          </div>
        </div>

        {/* Options Grid */}
        <div className="mt-6 pt-6 border-t border-zinc-100 dark:border-zinc-800/80 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Option 1: Dot Matrix */}
          <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/40 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center space-x-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableDots}
                  onChange={(e) => setEnableDots(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                />
                <span>Dot Matrix Permutations</span>
              </label>
              <span className="text-[10px] text-zinc-400 font-mono">
                {combinationStats.dots.toLocaleString()} max
              </span>
            </div>

            {enableDots && (
              <div className="grid grid-cols-2 gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => setDotMode('all')}
                  className={`px-2 py-1 text-[11px] font-medium rounded-lg transition-all cursor-pointer ${
                    dotMode === 'all'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700'
                  }`}
                >
                  Sequential All
                </button>
                <button
                  type="button"
                  onClick={() => setDotMode('random')}
                  className={`px-2 py-1 text-[11px] font-medium rounded-lg transition-all cursor-pointer ${
                    dotMode === 'random'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700'
                  }`}
                >
                  Distributed Random
                </button>
              </div>
            )}
          </div>

          {/* Option 2: Plus Addressing */}
          <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/40 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center space-x-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={enablePlus}
                  onChange={(e) => setEnablePlus(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                />
                <span>Plus Addressing (+tag)</span>
              </label>
            </div>

            {enablePlus && (
              <div className="space-y-1.5 pt-1">
                <select
                  value={plusMode}
                  onChange={(e) => setPlusMode(e.target.value as PlusMode)}
                  className="w-full text-[11px] py-1 px-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 focus:outline-none"
                >
                  <option value="preset">Common Presets (trial, promo, dev)</option>
                  <option value="timestamp">Date / Time Stamps</option>
                  <option value="random">Random Hex Codes</option>
                  <option value="custom">Custom Tag Prefix</option>
                </select>

                {plusMode === 'custom' && (
                  <input
                    type="text"
                    value={customTag}
                    onChange={(e) => setCustomTag(e.target.value)}
                    placeholder="Custom keyword (e.g. signup)"
                    className="w-full text-[11px] py-1 px-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 focus:outline-none"
                  />
                )}
              </div>
            )}
          </div>

          {/* Option 3: Max Results Limit */}
          <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/40 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center space-x-1.5">
                <Sliders className="w-3.5 h-3.5 text-zinc-400" />
                <span>Quantity Cap</span>
              </span>
              <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
                {maxResults}
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {[10, 25, 50, 100, 250, 500].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => {
                    setMaxResults(num);
                    setDisplayLimit(num);
                  }}
                  className={`px-2 py-0.5 text-[10px] font-mono rounded-md transition-all cursor-pointer ${
                    maxResults === num
                      ? 'bg-zinc-800 dark:bg-zinc-200 text-white dark:text-zinc-900 font-bold'
                      : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 hover:border-zinc-400'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          {/* Option 4: Domain Mirroring */}
          <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/40 space-y-2.5 flex flex-col justify-between">
            <div>
              <label className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center space-x-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeGooglemail}
                  onChange={(e) => setIncludeGooglemail(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                />
                <span>@googlemail.com Mirror</span>
              </label>
              <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1">
                Generates UK/legacy Googlemail duplicates that deliver to the exact same mailbox.
              </p>
            </div>

            <div className="pt-1">
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-medium">
                {combinationStats.total > 0 ? `${combinationStats.total.toLocaleString()} variations possible` : 'Ready'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Results Header & Actions Bar */}
      {validation.isValid && (
        <div className="space-y-4">
          <ExportActions
            emails={generatedData.emails}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onOpenFilterModal={() => setIsFilterModalOpen(true)}
          />

          {/* Result Cards Grid */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-zinc-500 px-1">
              <span>
                Showing {visibleEmails.length} of {filteredEmails.length} variations
                {searchQuery && ` (filtered from ${generatedData.emails.length})`}
              </span>
              <span className="text-[11px] font-mono text-zinc-400">
                Click any row or copy button to copy
              </span>
            </div>

            {visibleEmails.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {visibleEmails.map((item, idx) => (
                  <EmailCard key={item.id} email={item} index={idx + 1} />
                ))}
              </div>
            ) : (
              <div className="p-8 text-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl">
                <p className="text-sm text-zinc-500">No email variations matched your search "{searchQuery}".</p>
              </div>
            )}

            {/* Load more if filtered list exceeds current display limit */}
            {filteredEmails.length > visibleEmails.length && (
              <div className="pt-4 text-center">
                <button
                  type="button"
                  onClick={() => setDisplayLimit((prev) => prev + 50)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 shadow-sm transition-all cursor-pointer inline-flex items-center space-x-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Show Next 50 Variations ({filteredEmails.length - visibleEmails.length} remaining)</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Filter Modal */}
      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        emails={generatedData.emails}
        baseEmail={validation.isValid ? `${validation.normalizedLocalPart}@${validation.domain}` : undefined}
      />
    </div>
  );
};
