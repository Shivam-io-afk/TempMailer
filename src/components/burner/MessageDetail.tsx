import React, { useState, useMemo } from 'react';
import DOMPurify from 'dompurify';
import {
  ShieldCheck,
  Calendar,
  User,
  ArrowLeft,
  Eye,
  Zap,
  Copy,
  Check,
  ExternalLink,
} from 'lucide-react';
import type { BurnerMessage } from '../../types';
import type { RawEmailDetail } from '../../services/burnerMailApi';
import { extractVerificationData } from '../../utils/otpExtractor';

interface MessageDetailProps {
  message: BurnerMessage | null;
  detail: RawEmailDetail | null;
  isLoading: boolean;
  onBack?: () => void;
}

export const MessageDetail: React.FC<MessageDetailProps> = ({
  message,
  detail,
  isLoading,
  onBack,
}) => {
  const [viewMode, setViewMode] = useState<'html' | 'text'>('html');
  const [copiedCode, setCopiedCode] = useState(false);

  // Extract verification OTP code and activation URL
  const verification = useMemo(() => {
    if (!message) return { code: null, link: null };
    return extractVerificationData(
      message.subject,
      message.bodyPreview,
      detail?.mail_body
    );
  }, [message, detail]);

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = code;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  if (!message) {
    return (
      <div className="h-full min-h-[320px] flex flex-col items-center justify-center p-8 text-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
        <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 mb-3">
          <Eye className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
          No message selected
        </h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-xs">
          Select an incoming email from the inbox list to read its content and copy verification codes.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="h-full min-h-[320px] p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl space-y-4 animate-pulse">
        <div className="h-6 bg-zinc-200 dark:bg-zinc-800 rounded-md w-3/4"></div>
        <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded-md w-1/2"></div>
        <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 space-y-2">
          <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-full"></div>
          <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-5/6"></div>
          <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  const rawHtml = detail?.mail_body || message.bodyPreview;
  // Security critical: sanitize all HTML with DOMPurify
  const sanitizedHtml = DOMPurify.sanitize(rawHtml, {
    ADD_ATTR: ['target'],
    FORBID_TAGS: ['script', 'iframe', 'object', 'embed'],
  });

  return (
    <div className="h-full flex flex-col bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
      {/* Detail Header */}
      <div className="p-4 sm:p-5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/40">
        {onBack && (
          <button
            onClick={onBack}
            className="md:hidden mb-3 text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 flex items-center space-x-1 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to message list</span>
          </button>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
            {message.subject}
          </h2>

          <div className="flex items-center space-x-2 shrink-0">
            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="w-3 h-3" />
              <span>Sanitized</span>
            </span>

            {/* View Mode toggle */}
            <div className="flex items-center bg-zinc-200/80 dark:bg-zinc-800 p-0.5 rounded-lg text-[10px]">
              <button
                onClick={() => setViewMode('html')}
                className={`px-2 py-0.5 rounded-md font-medium cursor-pointer transition-colors ${
                  viewMode === 'html'
                    ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400'
                }`}
              >
                HTML
              </button>
              <button
                onClick={() => setViewMode('text')}
                className={`px-2 py-0.5 rounded-md font-medium cursor-pointer transition-colors ${
                  viewMode === 'text'
                    ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400'
                }`}
              >
                Text
              </button>
            </div>
          </div>
        </div>

        {/* Sender & Date meta */}
        <div className="mt-3 flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-zinc-500 dark:text-zinc-400">
          <div className="flex items-center space-x-1.5">
            <User className="w-3.5 h-3.5 text-zinc-400" />
            <span className="font-medium text-zinc-700 dark:text-zinc-300">From:</span>
            <span className="font-mono text-zinc-800 dark:text-zinc-200">{message.from}</span>
          </div>

          <div className="flex items-center space-x-1.5">
            <Calendar className="w-3.5 h-3.5 text-zinc-400" />
            <span>{message.date}</span>
          </div>
        </div>
      </div>

      {/* Extracted Verification Card (Hero Action) */}
      {(verification.code || verification.link) && (
        <div className="m-4 p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-violet-500/10 border border-amber-500/30 dark:border-amber-400/20 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5 text-xs font-bold text-amber-600 dark:text-amber-400">
              <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span>Instant Verification Action Detected</span>
            </div>
            <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-mono">
              Auto-Parsed
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {verification.code && (
              <div className="flex items-center space-x-2 bg-white dark:bg-zinc-950 px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-xs">
                <span className="text-xs text-zinc-500 font-medium">OTP Code:</span>
                <span className="font-mono text-base font-extrabold text-indigo-600 dark:text-indigo-400 tracking-wider">
                  {verification.code}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopyCode(verification.code!)}
                  className={`ml-1 px-2.5 py-1 text-xs font-semibold rounded-lg flex items-center space-x-1 transition-all cursor-pointer ${
                    copiedCode
                      ? 'bg-emerald-500 text-white'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950 dark:hover:text-indigo-400'
                  }`}
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            )}

            {verification.link && (
              <a
                href={verification.link}
                target="_blank"
                rel="noreferrer noopener"
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm flex items-center space-x-1.5 transition-colors cursor-pointer"
              >
                <span>Open Verification Link</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>
      )}

      {/* Detail Body */}
      <div className="p-4 sm:p-6 overflow-y-auto flex-1 min-h-[240px]">
        {viewMode === 'html' ? (
          <div
            className="prose prose-sm dark:prose-invert max-w-none text-zinc-800 dark:text-zinc-200 font-sans leading-relaxed break-words"
            dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
          />
        ) : (
          <pre className="whitespace-pre-wrap font-mono text-xs text-zinc-800 dark:text-zinc-200 leading-relaxed bg-zinc-50 dark:bg-zinc-950 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
            {detail?.mail_body || message.bodyPreview}
          </pre>
        )}
      </div>
    </div>
  );
};
