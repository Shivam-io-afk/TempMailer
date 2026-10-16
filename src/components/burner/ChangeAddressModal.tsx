import React, { useState, useEffect } from 'react';
import { X, Sparkles, Check, AtSign } from 'lucide-react';
import { generateRandomIdentity } from '../../utils/cryptoGenerator';

interface ChangeAddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAddress: string;
  onSave: (newUsername: string, domain: string) => Promise<void>;
}

const AVAILABLE_DOMAINS = [
  'guerrillamailblock.com',
  'sharklasers.com',
  'guerrillamail.com',
  'guerrillamail.net',
  'guerrillamail.biz',
  'spam4.me',
  'grr.la',
  'pokemail.net',
];

export const ChangeAddressModal: React.FC<ChangeAddressModalProps> = ({
  isOpen,
  onClose,
  currentAddress,
  onSave,
}) => {
  const currentParts = currentAddress.split('@');
  const initialUser = currentParts[0] || '';
  const initialDomain = currentParts[1] || AVAILABLE_DOMAINS[0];

  const [username, setUsername] = useState(initialUser);
  const [domain, setDomain] = useState(
    AVAILABLE_DOMAINS.includes(initialDomain) ? initialDomain : AVAILABLE_DOMAINS[0]
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync state whenever modal is opened with new active address
  useEffect(() => {
    if (isOpen) {
      const parts = currentAddress.split('@');
      // oxlint-disable-next-line react/set-state-in-effect
      setUsername(parts[0] || '');
      const dom = parts[1] || AVAILABLE_DOMAINS[0];
      setDomain(AVAILABLE_DOMAINS.includes(dom) ? dom : AVAILABLE_DOMAINS[0]);
      setError(null);
    }
  }, [isOpen, currentAddress]);

  if (!isOpen) return null;

  const handleRandomize = () => {
    const identity = generateRandomIdentity();
    const randomUser = identity.username.replace(/[^a-z0-9]/g, '');
    setUsername(randomUser);
    const randomDomain = AVAILABLE_DOMAINS[Math.floor(Math.random() * AVAILABLE_DOMAINS.length)];
    setDomain(randomDomain);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUser = username.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!cleanUser) {
      setError('Please enter a valid username with letters or numbers.');
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      await onSave(cleanUser, domain);
      onClose();
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to update email address.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <AtSign className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Change Email Address
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Choose a custom username and domain for your mailbox
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4">
          {error && (
            <div className="p-3 text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/50 rounded-xl">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
              Login Name (Username)
            </label>
            <div className="relative">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''))}
                placeholder="e.g. shivam99"
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                autoFocus
              />
              <button
                type="button"
                onClick={handleRandomize}
                className="absolute right-2 top-2 px-2.5 py-1 rounded-lg text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 flex items-center space-x-1 cursor-pointer transition-colors"
                title="Generate random name"
              >
                <Sparkles className="w-3 h-3" />
                <span>Random</span>
              </button>
            </div>
            <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-1">
              Letters and numbers only.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
              Domain
            </label>
            <select
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
            >
              {AVAILABLE_DOMAINS.map((d) => (
                <option key={d} value={d}>
                  @{d}
                </option>
              ))}
            </select>
          </div>

          {/* Preview Box */}
          <div className="p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
              New Address Preview:
            </span>
            <span className="font-mono text-xs sm:text-sm font-bold text-indigo-600 dark:text-indigo-400 break-all select-all">
              {username.trim() || 'username'}@{domain}
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !username.trim()}
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white shadow-md shadow-indigo-500/20 flex items-center space-x-1.5 transition-all cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Updating...' : 'Save & Change'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
