import { ThemeProvider } from './context/ThemeContext';
import { Header } from './components/Header';
import { BurnerInbox } from './components/burner/BurnerInbox';

function AppContent() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col font-sans transition-colors duration-200">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <BurnerInbox />
      </main>

      <footer className="border-t border-zinc-200 dark:border-zinc-800/80 py-6 text-center text-xs text-zinc-500 dark:text-zinc-400 bg-white/50 dark:bg-zinc-950/50">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>TempMailer — Instant Temporary Disposable Email for Sign-ins &amp; OTPs</p>
          <p className="text-[11px] text-zinc-400">Pure Client-Side Cryptographic &amp; Disposable API Safety</p>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
