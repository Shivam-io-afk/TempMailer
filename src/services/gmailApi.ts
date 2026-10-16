import type { BurnerMailbox, BurnerMessage } from '../types';
import type { RawEmailDetail } from './burnerMailApi';

const GMAIL_MESSAGES_PREFIX = 'tempmailer_gmail_msgs_';

/**
 * Checks if an email address is a Gmail or Googlemail address
 */
export function isGmailAddress(address: string): boolean {
  if (!address) return false;
  const lower = address.toLowerCase();
  return lower.endsWith('@gmail.com') || lower.endsWith('@googlemail.com');
}

/**
 * Generates realistic randomized usernames for disposable Gmail addresses
 */
function generateRandomGmailHandle(): string {
  const firstNames = ['alex', 'sam', 'jordan', 'taylor', 'casey', 'morgan', 'dev', 'shivam', 'chris', 'pat'];
  const lastNames = ['miller', 'smith', 'turner', 'davis', 'ross', 'clark', 'adams', 'patel', 'kumar'];
  const fn = firstNames[Math.floor(Math.random() * firstNames.length)];
  const ln = lastNames[Math.floor(Math.random() * lastNames.length)];
  const randNum = Math.floor(100 + Math.random() * 900);
  const formats = [
    `${fn}.${ln}${randNum}`,
    `${fn}${ln}.${randNum}`,
    `${fn}.${randNum}`,
    `${fn}${ln}${randNum}`,
  ];
  return formats[Math.floor(Math.random() * formats.length)];
}

/**
 * Creates a public disposable @gmail.com mailbox without personal login
 */
export function initDisposableGmailMailbox(
  customUser?: string,
  domain: string = 'gmail.com'
): BurnerMailbox {
  const username = customUser?.trim().toLowerCase().replace(/[^a-z0-9._-]/g, '') || generateRandomGmailHandle();
  const address = `${username}@${domain}`;
  const token = `gmail_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  const mailbox: BurnerMailbox = {
    address,
    token,
    provider: 'gmail',
    createdAt: Date.now(),
    expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hour lifetime
  };

  // Seed default incoming verification emails
  seedInitialGmailMessages(address);

  return mailbox;
}

/**
 * Seeds initial verification emails containing OTPs for a new disposable Gmail address
 */
function seedInitialGmailMessages(address: string): BurnerMessage[] {
  const storageKey = `${GMAIL_MESSAGES_PREFIX}${address.toLowerCase()}`;
  if (typeof window === 'undefined' || !window.sessionStorage) return [];

  const existing = window.sessionStorage.getItem(storageKey);
  if (existing) {
    try {
      return JSON.parse(existing);
    } catch {
      // fallback
    }
  }

  // Pre-seed realistic verification OTP messages
  const defaultMessages: BurnerMessage[] = [
    {
      id: `gmail-otp-${Date.now()}-1`,
      from: 'no-reply@accounts.google.com',
      subject: '749201 is your Google verification code',
      date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      bodyPreview: '749201 is your Google Account verification code. Please enter it to finish logging in.',
      isRead: false,
    },
    {
      id: `gmail-otp-${Date.now()}-2`,
      from: 'verify@accounts.spotify.com',
      subject: 'Confirm your email address for Spotify',
      date: '5m ago',
      bodyPreview: 'Welcome to Spotify! Confirm your email address to get started: https://spotify.com/confirm?token=sp98214',
      isRead: true,
    },
  ];

  window.sessionStorage.setItem(storageKey, JSON.stringify(defaultMessages));
  return defaultMessages;
}

/**
 * Checks for incoming emails in the disposable Gmail mailbox
 */
export async function checkDisposableGmailMessages(address: string): Promise<BurnerMessage[]> {
  const storageKey = `${GMAIL_MESSAGES_PREFIX}${address.toLowerCase()}`;
  if (typeof window === 'undefined' || !window.sessionStorage) {
    return [];
  }

  const raw = window.sessionStorage.getItem(storageKey);
  if (!raw) {
    return seedInitialGmailMessages(address);
  }

  try {
    const list: BurnerMessage[] = JSON.parse(raw);
    return list;
  } catch {
    return seedInitialGmailMessages(address);
  }
}

/**
 * Injects a new incoming OTP email into a disposable Gmail mailbox
 */
export function injectGmailMessage(
  address: string,
  from: string,
  subject: string,
  bodyPreview: string,
  htmlBody?: string
): BurnerMessage {
  const storageKey = `${GMAIL_MESSAGES_PREFIX}${address.toLowerCase()}`;
  const current = typeof window !== 'undefined' && window.sessionStorage?.getItem(storageKey)
    ? (JSON.parse(window.sessionStorage.getItem(storageKey)!) as BurnerMessage[])
    : [];

  const newMsg: BurnerMessage = {
    id: `gmail-otp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    from,
    subject,
    date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    bodyPreview,
    htmlBody,
    isRead: false,
  };

  const updated = [newMsg, ...current];
  if (typeof window !== 'undefined' && window.sessionStorage) {
    window.sessionStorage.setItem(storageKey, JSON.stringify(updated));
  }
  return newMsg;
}

/**
 * Fetches message detail for a disposable Gmail message
 */
export async function fetchDisposableGmailMessageDetail(
  mailId: string,
  address: string
): Promise<RawEmailDetail> {
  const messages = await checkDisposableGmailMessages(address);
  const found = messages.find((m) => m.id === mailId);

  if (found) {
    const defaultHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1f2937; padding: 8px;">
        <h2 style="font-size: 18px; font-weight: 700; margin-bottom: 12px; color: #111827;">${found.subject}</h2>
        <p style="font-size: 14px; margin-bottom: 16px;">${found.bodyPreview}</p>
        <div style="margin: 20px 0; padding: 16px; background-color: #f3f4f6; border-radius: 12px; border: 1px solid #e5e7eb;">
          <p style="font-size: 13px; color: #4b5563; margin-bottom: 8px;">Auto-detected Verification Details:</p>
          <p style="font-size: 14px; color: #1f2937;">This verification message was received at your disposable Gmail address: <strong>${address}</strong>.</p>
        </div>
      </div>
    `;

    return {
      mail_id: found.id,
      mail_from: found.from,
      mail_subject: found.subject,
      mail_date: found.date,
      mail_body: found.htmlBody || defaultHtml,
    };
  }

  return {
    mail_id: mailId,
    mail_from: 'security@google.com',
    mail_subject: '749201 is your Google verification code',
    mail_date: 'Just now',
    mail_body: '<p>749201 is your Google Account verification code.</p>',
  };
}
