let titleInterval: number | null = null;
const ORIGINAL_TITLE = 'TempGmail — Disposable Email & Gmail Power Suite';

/**
 * Plays a pleasant, subtle dual-tone notification chime using Web Audio API (0 external assets)
 */
export function playEmailChime(): void {
  try {
    const AudioContextClass =
      window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    // First tone (D5 - 587.33 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now);
    gain1.gain.setValueAtTime(0, now);
    gain1.gain.linearRampToValueAtTime(0.15, now + 0.03);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.35);

    // Second tone (A5 - 880 Hz) slightly delayed
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, now + 0.12);
    gain2.gain.setValueAtTime(0, now + 0.12);
    gain2.gain.linearRampToValueAtTime(0.2, now + 0.15);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.55);
  } catch (err) {
    console.warn('Audio chime unavailable:', err);
  }
}

/**
 * Requests desktop Notification permission from browser
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission !== 'denied') {
    const perm = await Notification.requestPermission();
    return perm === 'granted';
  }
  return false;
}

/**
 * Dispatches a native desktop notification if user allowed
 */
export function showDesktopNotification(title: string, body: string): void {
  try {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    if (Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/favicon.svg',
      });
    }
  } catch (err) {
    console.warn('Desktop notification failed:', err);
  }
}

/**
 * Flashes the browser tab document title to notify user in another tab
 */
export function startTitleAlert(count: number = 1): void {
  stopTitleAlert();
  let toggle = false;
  titleInterval = window.setInterval(() => {
    document.title = toggle
      ? `(${count}) ✉️ New Email! • TempGmail`
      : ORIGINAL_TITLE;
    toggle = !toggle;
  }, 1000);
}

/**
 * Restores original document title
 */
export function stopTitleAlert(): void {
  if (titleInterval) {
    clearInterval(titleInterval);
    titleInterval = null;
  }
  document.title = ORIGINAL_TITLE;
}
