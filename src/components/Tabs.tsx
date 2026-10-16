import { Flame, HelpCircle, Layers } from 'lucide-react';
import type { ActiveTab } from '../types';

interface TabsProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  unreadCount?: number;
}

export const Tabs: React.FC<TabsProps> = ({ activeTab, onTabChange, unreadCount = 0 }) => {
  const tabs = [
    {
      id: 'gmail-matrix' as ActiveTab,
      label: 'Gmail Matrix & Filters',
      badge: 'Legit @gmail',
      badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      icon: Layers,
    },
    {
      id: 'burner-inbox' as ActiveTab,
      label: 'Live Burner Inbox',
      badge: unreadCount > 0 ? `${unreadCount} new` : 'Live Inbox',
      badgeColor: unreadCount > 0 
        ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30 font-bold animate-pulse'
        : 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
      icon: Flame,
    },
    {
      id: 'guide' as ActiveTab,
      label: 'Guide & Compatibility',
      badge: 'RFC Specs',
      badgeColor: 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20',
      icon: HelpCircle,
    },
  ];

  return (
    <div className="w-full border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex space-x-2 sm:space-x-4 overflow-x-auto py-2.5 scrollbar-none" aria-label="Tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm border border-zinc-200 dark:border-zinc-700'
                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800/50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-zinc-400'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border ${tab.badgeColor}`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
