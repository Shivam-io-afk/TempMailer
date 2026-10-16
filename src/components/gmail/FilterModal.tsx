import { useState } from 'react';
import { X, Download, Tag, Archive, Star, ShieldCheck, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import type { GeneratedEmail, GmailFilterRule } from '../../types';
import { generateGmailFilterXml, downloadFilterXml } from '../../utils/filterXmlGenerator';

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  emails: GeneratedEmail[];
  baseEmail?: string;
}

export const FilterModal: React.FC<FilterModalProps> = ({
  isOpen,
  onClose,
  emails,
  baseEmail,
}) => {
  const [rule, setRule] = useState<GmailFilterRule>({
    labelName: 'Temp-Aliases',
    applyLabel: true,
    skipInbox: false,
    markAsRead: false,
    star: false,
    neverSpam: true,
  });

  const [showXmlPreview, setShowXmlPreview] = useState(false);

  if (!isOpen) return null;

  const xmlContent = generateGmailFilterXml(emails, rule, baseEmail);

  const handleDownload = () => {
    downloadFilterXml(xmlContent);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl overflow-hidden relative max-h-[90vh] flex flex-col"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center space-x-2">
              <span>Auto-Organize with Gmail Filters</span>
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Create an official XML rule to automatically label or archive mail sent to your {emails.length} aliases.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="py-4 space-y-5 overflow-y-auto pr-1">
          {/* Label Input */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
              Gmail Label Name
            </label>
            <div className="relative">
              <Tag className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={rule.labelName}
                onChange={(e) => setRule({ ...rule, labelName: e.target.value })}
                placeholder="e.g. Temp-Signups or Newsletters"
                className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Action Checkboxes */}
          <div className="space-y-2.5 bg-zinc-50 dark:bg-zinc-950/60 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800/80">
            <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-2">
              When an email arrives to these aliases:
            </span>

            <label className="flex items-center space-x-2.5 text-xs text-zinc-700 dark:text-zinc-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rule.applyLabel}
                onChange={(e) => setRule({ ...rule, applyLabel: e.target.checked })}
                className="rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
              />
              <span>Apply label <strong>"{rule.labelName || 'Temp-Aliases'}"</strong></span>
            </label>

            <label className="flex items-center space-x-2.5 text-xs text-zinc-700 dark:text-zinc-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rule.skipInbox}
                onChange={(e) => setRule({ ...rule, skipInbox: e.target.checked })}
                className="rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
              />
              <span className="flex items-center space-x-1.5">
                <Archive className="w-3.5 h-3.5 text-zinc-400" />
                <span>Skip the Inbox (Archive it)</span>
              </span>
            </label>

            <label className="flex items-center space-x-2.5 text-xs text-zinc-700 dark:text-zinc-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rule.star}
                onChange={(e) => setRule({ ...rule, star: e.target.checked })}
                className="rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
              />
              <span className="flex items-center space-x-1.5">
                <Star className="w-3.5 h-3.5 text-amber-500" />
                <span>Star it</span>
              </span>
            </label>

            <label className="flex items-center space-x-2.5 text-xs text-zinc-700 dark:text-zinc-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rule.neverSpam}
                onChange={(e) => setRule({ ...rule, neverSpam: e.target.checked })}
                className="rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
              />
              <span className="flex items-center space-x-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Never send it to Spam</span>
              </span>
            </label>
          </div>

          {/* XML Preview Toggle */}
          <div>
            <button
              onClick={() => setShowXmlPreview(!showXmlPreview)}
              className="flex items-center space-x-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
            >
              <span>{showXmlPreview ? 'Hide' : 'View'} Raw XML Atom Feed</span>
              {showXmlPreview ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
            {showXmlPreview && (
              <pre className="mt-2 p-3 bg-zinc-900 text-zinc-300 rounded-xl text-[11px] font-mono overflow-x-auto max-h-36 border border-zinc-800">
                {xmlContent}
              </pre>
            )}
          </div>

          {/* 3-Step Import Instructions */}
          <div className="bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 rounded-xl p-3.5 text-xs text-zinc-600 dark:text-zinc-400 space-y-2">
            <span className="font-semibold text-zinc-900 dark:text-zinc-200 block">
              How to import into Gmail:
            </span>
            <ol className="list-decimal list-inside space-y-1 text-[11px]">
              <li>Click <strong>Download mail-filters.xml</strong> below.</li>
              <li>
                In Gmail, go to{' '}
                <a
                  href="https://mail.google.com/mail/u/0/#settings/filters"
                  target="_blank"
                  rel="noreferrer"
                  className="text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center space-x-0.5"
                >
                  <span>Settings → Filters and Blocked Addresses</span>
                  <ExternalLink className="w-2.5 h-2.5 inline ml-0.5" />
                </a>.
              </li>
              <li>Click <strong>Import filters</strong> at the bottom, select your downloaded file, and confirm!</li>
            </ol>
          </div>
        </div>

        {/* Footer actions */}
        <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-end space-x-3 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleDownload}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-500/20 flex items-center space-x-2 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download mail-filters.xml</span>
          </button>
        </div>
      </div>
    </div>
  );
};
