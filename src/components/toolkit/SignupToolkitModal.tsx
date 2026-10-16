import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  RefreshCw,
  KeyRound,
  User,
  ShieldCheck,
  Sliders,
} from 'lucide-react';
import {
  generateSecurePassword,
  generateRandomIdentity,
  type RandomIdentity,
} from '../../utils/cryptoGenerator';

interface SignupToolkitModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SignupToolkitModal: React.FC<SignupToolkitModalProps> = ({ isOpen, onClose }) => {
  const [passwordLength, setPasswordLength] = useState(16);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);

  const [password, setPassword] = useState(() =>
    generateSecurePassword({ length: 16, includeSymbols: true, includeNumbers: true })
  );
  const [identity, setIdentity] = useState<RandomIdentity>(() => generateRandomIdentity());

  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    }
  };

  const handleRegeneratePassword = () => {
    setPassword(
      generateSecurePassword({
        length: passwordLength,
        includeSymbols,
        includeNumbers,
      })
    );
  };

  const handleRegenerateIdentity = () => {
    setIdentity(generateRandomIdentity());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto space-y-6"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Signup Companion Toolkit
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Generate secure throwaway passwords and test identities for account signups.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section 1: Password Generator */}
        <div className="space-y-3.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 flex items-center space-x-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Strong Password (Crypto-Random)</span>
            </span>
            <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-500/20">
              {passwordLength >= 16 ? 'High Entropy' : 'Standard'}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <div className="flex-1 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 px-3.5 py-2.5 rounded-xl font-mono text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100 tracking-wide select-all truncate">
              {password}
            </div>

            <button
              onClick={() => handleCopy(password, 'password')}
              className={`p-2.5 rounded-xl text-xs font-medium flex items-center space-x-1 transition-all cursor-pointer ${
                copiedField === 'password'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700'
              }`}
              title="Copy password"
            >
              {copiedField === 'password' ? (
                <Check className="w-4 h-4" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>

            <button
              onClick={handleRegeneratePassword}
              className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700 cursor-pointer"
              title="Generate new password"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {/* Controls */}
          <div className="bg-zinc-50 dark:bg-zinc-950/60 p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800/80 space-y-3">
            <div className="flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-400">
              <span className="flex items-center space-x-1">
                <Sliders className="w-3.5 h-3.5 text-zinc-400" />
                <span>Length: {passwordLength} characters</span>
              </span>
              <input
                type="range"
                min="8"
                max="32"
                value={passwordLength}
                onChange={(e) => {
                  const len = Number(e.target.value);
                  setPasswordLength(len);
                  setPassword(
                    generateSecurePassword({
                      length: len,
                      includeSymbols,
                      includeNumbers,
                    })
                  );
                }}
                className="w-36 accent-indigo-600 cursor-pointer"
              />
            </div>

            <div className="flex items-center space-x-4 text-xs">
              <label className="flex items-center space-x-1.5 cursor-pointer text-zinc-700 dark:text-zinc-300">
                <input
                  type="checkbox"
                  checked={includeSymbols}
                  onChange={(e) => {
                    setIncludeSymbols(e.target.checked);
                    setPassword(
                      generateSecurePassword({
                        length: passwordLength,
                        includeSymbols: e.target.checked,
                        includeNumbers,
                      })
                    );
                  }}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                />
                <span>Include Symbols (!@#$)</span>
              </label>

              <label className="flex items-center space-x-1.5 cursor-pointer text-zinc-700 dark:text-zinc-300">
                <input
                  type="checkbox"
                  checked={includeNumbers}
                  onChange={(e) => {
                    setIncludeNumbers(e.target.checked);
                    setPassword(
                      generateSecurePassword({
                        length: passwordLength,
                        includeSymbols,
                        includeNumbers: e.target.checked,
                      })
                    );
                  }}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                />
                <span>Numbers (0-9)</span>
              </label>
            </div>
          </div>
        </div>

        {/* Section 2: Fake Test Identity */}
        <div className="space-y-3 pt-2 border-t border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 flex items-center space-x-1.5">
              <User className="w-3.5 h-3.5 text-indigo-500" />
              <span>Realistic Test Identity</span>
            </span>
            <button
              onClick={handleRegenerateIdentity}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center space-x-1 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              <span>New Identity</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Full Name */}
            <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-semibold text-zinc-400 block">
                  Full Name
                </span>
                <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                  {identity.fullName}
                </span>
              </div>
              <button
                onClick={() => handleCopy(identity.fullName, 'fullname')}
                className="p-1.5 text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                title="Copy name"
              >
                {copiedField === 'fullname' ? (
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>

            {/* Username Handle */}
            <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-semibold text-zinc-400 block">
                  Username Handle
                </span>
                <span className="text-xs font-mono font-bold text-zinc-900 dark:text-zinc-100">
                  {identity.username}
                </span>
              </div>
              <button
                onClick={() => handleCopy(identity.username, 'username')}
                className="p-1.5 text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                title="Copy username"
              >
                {copiedField === 'username' ? (
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
