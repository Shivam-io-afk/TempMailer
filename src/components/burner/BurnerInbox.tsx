import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Copy,
  Check,
  RefreshCw,
  QrCode,
  Edit2,
  Trash2,
  Flame,
  AlertTriangle,
  X,
  Bell,
  BellOff,
  Plus,
} from 'lucide-react';
import {
  playEmailChime,
  startTitleAlert,
  stopTitleAlert,
  showDesktopNotification,
  requestNotificationPermission,
} from '../../utils/soundAlert';
import type { BurnerMailbox, BurnerMessage } from '../../types';
import {
  initBurnerMailbox,
  checkBurnerMessages,
  fetchBurnerMessageDetail,
  setCustomBurnerUsername,
  forgetBurnerMailbox,
  getSavedBurnerMailbox,
  getSavedMailboxVault,
  addMailboxToVault,
  removeMailboxFromVault,
  type RawEmailDetail,
} from '../../services/burnerMailApi';
import { MessageList } from './MessageList';
import { MessageDetail } from './MessageDetail';
import { ChangeAddressModal } from './ChangeAddressModal';

interface BurnerInboxProps {
  onUnreadChange?: (count: number) => void;
}

export const BurnerInbox: React.FC<BurnerInboxProps> = ({ onUnreadChange }) => {
  const [mailbox, setMailbox] = useState<BurnerMailbox | null>(() => getSavedBurnerMailbox());
  const [messages, setMessages] = useState<BurnerMessage[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<BurnerMessage | null>(null);
  const [messageDetail, setMessageDetail] = useState<RawEmailDetail | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  const [isInitializing, setIsInitializing] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Auto-refresh countdown
  const [countdown, setCountdown] = useState(15);
  const [showQrModal, setShowQrModal] = useState(false);
  const [isChangeModalOpen, setIsChangeModalOpen] = useState(false);

  // Mobile view state: 'list' | 'detail'
  const [mobileView, setMobileView] = useState<'list' | 'detail'>('list');

  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    return localStorage.getItem('tempgmail_sound') !== 'false';
  });
  const prevMessageCountRef = useRef<number>(0);
  const countdownTimerRef = useRef<number | null>(null);
  const hasInitializedRef = useRef(false);
  const [vault, setVault] = useState<BurnerMailbox[]>(() => getSavedMailboxVault());

  // Initialize mailbox if none exists
  const initializeNewMailbox = useCallback(async () => {
    setIsInitializing(true);
    setError(null);
    try {
      const newMailbox = await initBurnerMailbox();
      setMailbox(newMailbox);
      setVault(getSavedMailboxVault());
      setMessages([]);
      setSelectedMessage(null);
      setMessageDetail(null);
      // Fetch initial messages (like welcome email)
      const initialMsgs = await checkBurnerMessages(newMailbox.token!);
      setMessages(initialMsgs);
      if (initialMsgs.length > 0) {
        setSelectedMessage(initialMsgs[0]);
      }
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to initialize disposable mailbox.');
    } finally {
      setIsInitializing(false);
      setCountdown(15);
    }
  }, []);

  // Switch active mailbox from vault
  const handleSwitchMailbox = async (target: BurnerMailbox) => {
    if (target.address === mailbox?.address) return;
    setMailbox(target);
    setSelectedMessage(null);
    setMessageDetail(null);
    setIsRefreshing(true);
    try {
      const msgs = await checkBurnerMessages(target.token!);
      setMessages(msgs);
      if (msgs.length > 0) setSelectedMessage(msgs[0]);
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setIsRefreshing(false);
      setCountdown(15);
    }
  };

  // Remove specific mailbox from vault
  const handleRemoveVaultMailbox = async (e: React.MouseEvent, addr: string, tok?: string) => {
    e.stopPropagation();
    if (tok) {
      void forgetBurnerMailbox(addr, tok);
    }
    const updated = removeMailboxFromVault(addr);
    setVault(updated);
    if (mailbox?.address === addr) {
      if (updated.length > 0) {
        void handleSwitchMailbox(updated[0]);
      } else {
        void initializeNewMailbox();
      }
    }
  };

  // Poll for messages
  const refreshMessages = useCallback(async () => {
    if (!mailbox?.token) return;
    setIsRefreshing(true);
    try {
      const newMsgs = await checkBurnerMessages(mailbox.token);
      setMessages(newMsgs);
      setError(null);

      // Check for newly arrived messages
      if (newMsgs.length > prevMessageCountRef.current && prevMessageCountRef.current > 0) {
        if (soundEnabled) {
          playEmailChime();
        }
        if (typeof document !== 'undefined' && document.hidden) {
          startTitleAlert(newMsgs.length);
          showDesktopNotification(
            'New OTP / Email Received',
            newMsgs[0]?.subject || 'Check your temporary inbox'
          );
        }
      }
      prevMessageCountRef.current = newMsgs.length;

      // Notify parent of unread
      const unread = newMsgs.filter((m) => !m.isRead).length;
      if (onUnreadChange) onUnreadChange(unread);
    } catch (err: unknown) {
      console.warn('Background refresh error:', (err as Error).message);
    } finally {
      setIsRefreshing(false);
      setCountdown(15);
    }
  }, [mailbox, onUnreadChange, soundEnabled]);

  // Initial setup
  useEffect(() => {
    if (hasInitializedRef.current) return;
    hasInitializedRef.current = true;

    const timer = setTimeout(() => {
      if (!mailbox) {
        void initializeNewMailbox();
      } else {
        void refreshMessages();
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [mailbox, initializeNewMailbox, refreshMessages]);

  // 15-second countdown timer for auto-refresh
  useEffect(() => {
    countdownTimerRef.current = window.setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          refreshMessages();
          return 15;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    };
  }, [refreshMessages]);

  // Clear title alert when user returns to tab
  useEffect(() => {
    const handleVisibility = () => {
      if (typeof document !== 'undefined' && !document.hidden) {
        stopTitleAlert();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('focus', handleVisibility);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('focus', handleVisibility);
      stopTitleAlert();
    };
  }, []);

  const handleToggleSound = async () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    localStorage.setItem('tempgmail_sound', String(next));
    if (next) {
      playEmailChime();
      await requestNotificationPermission();
    }
  };

  // Fetch full message detail when selected
  const handleSelectMessage = async (msg: BurnerMessage) => {
    setSelectedMessage(msg);
    setMobileView('detail');
    setIsLoadingDetail(true);

    if (mailbox?.token) {
      try {
        const detail = await fetchBurnerMessageDetail(msg.id, mailbox.token);
        setMessageDetail(detail);
      } catch (err) {
        console.warn('Failed to fetch detail:', err);
      } finally {
        setIsLoadingDetail(false);
      }
    }
  };

  // Copy address to clipboard
  const handleCopyAddress = async () => {
    if (!mailbox?.address) return;
    try {
      await navigator.clipboard.writeText(mailbox.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = mailbox.address;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Custom address / domain change (like temp-mail.org/en/change)
  const handleChangeAddress = async (newUser: string, newDomain: string) => {
    if (!mailbox?.token) return;
    setIsInitializing(true);
    try {
      const updated = await setCustomBurnerUsername(newUser, mailbox.token);
      const customAddress = `${newUser}@${newDomain}`;
      const finalMailbox: BurnerMailbox = {
        ...updated,
        address: customAddress,
      };
      setMailbox(finalMailbox);
      addMailboxToVault(finalMailbox);
      setVault(getSavedMailboxVault());
      await refreshMessages();
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setIsInitializing(false);
    }
  };

  // Delete mailbox
  const handleDeleteMailbox = async () => {
    if (mailbox?.address && mailbox.token) {
      await forgetBurnerMailbox(mailbox.address, mailbox.token);
    }
    initializeNewMailbox();
  };

  return (
    <div className="space-y-6">
      {/* Top Mailbox Bar */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
        {/* Multi-Mailbox Vault Switcher */}
        {vault.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pb-3 border-b border-zinc-100 dark:border-zinc-800">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mr-1">
              Active Inboxes ({vault.length}/5):
            </span>
            {vault.map((v, idx) => {
              const isSelected = v.address === mailbox?.address;
              return (
                <div
                  key={v.address}
                  onClick={() => handleSwitchMailbox(v)}
                  className={`group px-3 py-1 rounded-xl text-xs font-mono font-medium flex items-center space-x-1.5 transition-all cursor-pointer select-none ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                  }`}
                >
                  <span>#{idx + 1} {v.address.split('@')[0]}</span>
                  {vault.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => handleRemoveVaultMailbox(e, v.address, v.token)}
                      className="p-0.5 rounded-full hover:bg-white/20 transition-colors ml-1"
                      title="Close this inbox"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              );
            })}

            {vault.length < 5 && (
              <button
                type="button"
                onClick={initializeNewMailbox}
                disabled={isInitializing}
                className="px-2.5 py-1 rounded-xl text-xs font-medium border border-dashed border-zinc-300 dark:border-zinc-700 hover:border-indigo-400 dark:hover:border-indigo-500 text-zinc-500 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center space-x-1 transition-colors cursor-pointer"
                title="Create an additional simultaneous burner inbox"
              >
                <Plus className="w-3 h-3" />
                <span>Add Inbox</span>
              </button>
            )}
          </div>
        )}

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Email Address Display */}
          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center space-x-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                <span>Temporary Disposable Email</span>
              </span>
              <span className="text-[10px] px-2 py-0.2 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-500/20 flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Active &amp; Ready for OTP</span>
              </span>
            </div>

            {isInitializing ? (
              <div className="h-9 bg-zinc-200 dark:bg-zinc-800 rounded-xl w-72 animate-pulse"></div>
            ) : (
              <div className="flex items-center space-x-3">
                <span className="text-lg sm:text-xl md:text-2xl font-mono font-bold text-zinc-900 dark:text-zinc-50 tracking-tight truncate select-all">
                  {mailbox?.address || 'Generating address...'}
                </span>
                <button
                  onClick={() => setIsChangeModalOpen(true)}
                  className="p-1.5 text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
                  title="Change address username or domain"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {/* 1-Click Copy */}
            <button
              onClick={handleCopyAddress}
              disabled={isInitializing || !mailbox?.address}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all cursor-pointer ${
                copied
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-500/20'
              }`}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied to Clipboard!' : 'Copy Address'}</span>
            </button>

            {/* Change Address (temp-mail.org/en/change style) */}
            <button
              onClick={() => setIsChangeModalOpen(true)}
              disabled={!mailbox?.token}
              className="px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-750 transition-colors flex items-center space-x-1.5 cursor-pointer text-xs font-semibold"
              title="Change address username and domain"
            >
              <Edit2 className="w-4 h-4 text-indigo-500" />
              <span>Change</span>
            </button>

            {/* QR Code trigger */}
            <button
              onClick={() => setShowQrModal(true)}
              disabled={!mailbox?.address}
              className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-750 transition-colors cursor-pointer"
              title="Show QR Code for mobile testing"
            >
              <QrCode className="w-4 h-4" />
            </button>

            {/* Audio & Alert Toggle */}
            <button
              onClick={handleToggleSound}
              className={`p-2.5 rounded-xl border transition-colors cursor-pointer ${
                soundEnabled
                  ? 'border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
                  : 'border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'
              }`}
              title={soundEnabled ? 'Email alert chime: ON (Click to mute)' : 'Email alert chime: OFF (Click to enable)'}
            >
              {soundEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
            </button>

            {/* Refresh with countdown indicator */}
            <button
              onClick={refreshMessages}
              disabled={isRefreshing}
              className="px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-750 transition-all flex items-center space-x-2 cursor-pointer"
              title="Check for new messages"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-indigo-500' : ''}`} />
              <span className="text-xs font-mono font-medium">{countdown}s</span>
            </button>

            {/* New Mailbox / Delete */}
            <button
              onClick={handleDeleteMailbox}
              disabled={isInitializing}
              className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-500 hover:text-rose-600 dark:hover:text-rose-400 hover:border-rose-300 dark:hover:border-rose-900 transition-colors cursor-pointer"
              title="Delete mailbox and generate a fresh one"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={initializeNewMailbox}
              className="font-semibold underline hover:no-underline ml-3 cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}
      </div>

      {/* Main Mailbox Content: Split View */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start min-h-[460px]">
        {/* Message List Column */}
        <div
          className={`md:col-span-5 lg:col-span-4 h-full ${
            mobileView === 'detail' ? 'hidden md:block' : 'block'
          }`}
        >
          <MessageList
            messages={messages}
            selectedId={selectedMessage?.id || null}
            onSelectMessage={handleSelectMessage}
            isPolling={isRefreshing}
          />
        </div>

        {/* Message Detail Column */}
        <div
          className={`md:col-span-7 lg:col-span-8 h-full ${
            mobileView === 'list' ? 'hidden md:block' : 'block'
          }`}
        >
          <MessageDetail
            message={selectedMessage}
            detail={messageDetail}
            isLoading={isLoadingDetail}
            onBack={() => setMobileView('list')}
          />
        </div>
      </div>

      {/* Change Address Modal (temp-mail.org/en/change style) */}
      <ChangeAddressModal
        isOpen={isChangeModalOpen}
        onClose={() => setIsChangeModalOpen(false)}
        currentAddress={mailbox?.address || ''}
        onSave={handleChangeAddress}
      />

      {/* QR Code Modal for Mobile Quick Test */}
      {showQrModal && mailbox?.address && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl relative">
            <button
              onClick={() => setShowQrModal(false)}
              className="absolute top-4 right-4 p-1 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              Scan Disposable Email
            </h3>
            <p className="text-xs text-zinc-500">
              Scan with your mobile camera to quickly test signups and verifications on mobile apps.
            </p>

            <div className="p-4 bg-white rounded-xl inline-block shadow-xs border border-zinc-200">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                  mailbox.address
                )}`}
                alt={`QR code for ${mailbox.address}`}
                className="w-44 h-44 mx-auto"
              />
            </div>

            <p className="font-mono text-xs font-semibold text-zinc-700 dark:text-zinc-300 break-all">
              {mailbox.address}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
