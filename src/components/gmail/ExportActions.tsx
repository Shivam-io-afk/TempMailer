import React, { useState } from 'react';
import { Copy, Download, FileSpreadsheet, Check, Sparkles, Search } from 'lucide-react';
import type { GeneratedEmail } from '../../types';
import { exportToCsv, exportToTxt } from '../../utils/gmailGenerator';

interface ExportActionsProps {
  emails: GeneratedEmail[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenFilterModal: () => void;
}

export const ExportActions: React.FC<ExportActionsProps> = ({
  emails,
  searchQuery,
  onSearchChange,
  onOpenFilterModal,
}) => {
  const [copiedAll, setCopiedAll] = useState(false);

  const handleCopyAll = async () => {
    if (emails.length === 0) return;
    const text = exportToTxt(emails);
    try {
      await navigator.clipboard.writeText(text);
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
    } catch {
      // Fallback
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
    }
  };

  const handleDownloadTxt = () => {
    if (emails.length === 0) return;
    const text = exportToTxt(emails);
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `gmail-aliases-${emails.length}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadCsv = () => {
    if (emails.length === 0) return;
    const csv = exportToCsv(emails);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `gmail-aliases-${emails.length}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-4 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl">
      {/* Search Input */}
      <div className="relative flex-1 max-w-md">
        <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={`Filter ${emails.length} generated addresses...`}
          className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={handleCopyAll}
          disabled={emails.length === 0}
          className={`px-3 py-2 rounded-lg text-xs font-medium flex items-center space-x-1.5 transition-all cursor-pointer ${
            copiedAll
              ? 'bg-emerald-500 text-white'
              : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-750'
          }`}
        >
          {copiedAll ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copiedAll ? 'All Copied!' : `Copy All (${emails.length})`}</span>
        </button>

        <button
          onClick={handleDownloadTxt}
          disabled={emails.length === 0}
          className="px-3 py-2 rounded-lg text-xs font-medium bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-750 flex items-center space-x-1.5 transition-all cursor-pointer"
          title="Download as Plaintext list"
        >
          <Download className="w-3.5 h-3.5" />
          <span>TXT</span>
        </button>

        <button
          onClick={handleDownloadCsv}
          disabled={emails.length === 0}
          className="px-3 py-2 rounded-lg text-xs font-medium bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-750 flex items-center space-x-1.5 transition-all cursor-pointer"
          title="Download as CSV spreadsheet"
        >
          <FileSpreadsheet className="w-3.5 h-3.5" />
          <span>CSV</span>
        </button>

        <button
          onClick={onOpenFilterModal}
          disabled={emails.length === 0}
          className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-sm shadow-indigo-500/20 flex items-center space-x-1.5 transition-all cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>Create Gmail Filter</span>
        </button>
      </div>
    </div>
  );
};

