import React from 'react';
import { Clock, Radio, Inbox } from 'lucide-react';
import type { BurnerMessage } from '../../types';

interface MessageListProps {
  messages: BurnerMessage[];
  selectedId: string | null;
  onSelectMessage: (message: BurnerMessage) => void;
  isPolling: boolean;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  selectedId,
  onSelectMessage,
  isPolling,
}) => {
  if (messages.length === 0) {
    return (
      <div className="h-full min-h-[320px] flex flex-col items-center justify-center p-8 text-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
        <div className="relative mb-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <Inbox className="w-7 h-7" />
          </div>
          {isPolling && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500"></span>
            </span>
          )}
        </div>

        <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
          Waiting for incoming emails...
        </h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1.5 max-w-xs leading-relaxed">
          Send an email or verification code to your temporary address. It will appear here automatically within seconds.
        </p>

        <div className="mt-4 inline-flex items-center space-x-1.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-500/20">
          <Radio className="w-3.5 h-3.5 animate-pulse" />
          <span>Live Mailbox Listening Active</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm flex flex-col h-full">
      <div className="p-3.5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/40 flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
          Inbox ({messages.length})
        </span>
        {isPolling && (
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center space-x-1 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Live Sync</span>
          </span>
        )}
      </div>

      <div className="divide-y divide-zinc-100 dark:divide-zinc-800/80 overflow-y-auto flex-1 max-h-[550px]">
        {messages.map((msg) => {
          const isSelected = selectedId === msg.id;
          return (
            <div
              key={msg.id}
              onClick={() => onSelectMessage(msg)}
              className={`p-3.5 transition-all cursor-pointer select-none ${
                isSelected
                  ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-l-4 border-l-indigo-600'
                  : 'hover:bg-zinc-50 dark:hover:bg-zinc-850'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center space-x-2 truncate">
                  {!msg.isRead && (
                    <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0"></span>
                  )}
                  <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                    {msg.from}
                  </span>
                </div>
                <div className="flex items-center space-x-1 text-[11px] text-zinc-400 shrink-0">
                  <Clock className="w-3 h-3" />
                  <span>{msg.date}</span>
                </div>
              </div>

              <h4 className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 mt-1 truncate">
                {msg.subject}
              </h4>

              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 line-clamp-1">
                {msg.bodyPreview}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
