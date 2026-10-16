import type { BurnerMailbox, BurnerMessage } from '../types';
import {
  checkDisposableGmailMessages,
  fetchDisposableGmailMessageDetail,
  initDisposableGmailMailbox,
  isGmailAddress,
  simulateIncomingOtp,
  OTP_SERVICE_TEMPLATES,
  generateRandomOtp,
} from './gmailApi';

export { initDisposableGmailMailbox, isGmailAddress, simulateIncomingOtp };

const BASE_URL = 'https://api.guerrillamail.com/ajax.php';
const TIMEOUT_MS = 8000;

async function fetchWithTimeout(url: string, options: RequestInit = {}): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return res;
  } catch (err: unknown) {
    if ((err as Error).name === 'AbortError') {
      throw new Error('Connection timed out. GuerrillaMail API is busy, please retry.');
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

export interface RawEmailItem {
  mail_id: number | string;
  mail_from: string;
  mail_subject: string;
  mail_excerpt: string;
  mail_date: string;
  mail_timestamp: number;
  mail_read: number;
}

export interface RawEmailDetail {
  mail_id: number | string;
  mail_from: string;
  mail_subject: string;
  mail_body: string;
  mail_date: string;
  mail_recipient?: string;
  content_type?: string;
}

/**
 * Initializes a new temporary disposable mailbox
 */
export async function initBurnerMailbox(): Promise<BurnerMailbox> {
  const url = `${BASE_URL}?f=get_email_address`;
  const response = await fetchWithTimeout(url, {
    method: 'GET',
    headers: { 'Accept': 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`Failed to initialize burner mailbox (HTTP ${response.status})`);
  }

  const data = await response.json();
  if (!data.email_addr || !data.sid_token) {
    throw new Error('Invalid response structure received from disposable mail service.');
  }

  const mailbox: BurnerMailbox = {
    address: data.email_addr,
    token: data.sid_token,
    createdAt: Date.now(),
    expiresAt: Date.now() + 60 * 60 * 1000, // 1 hour lifetime
  };

  // Cache to session storage and vault if running in browser
  addMailboxToVault(mailbox);
  return mailbox;
}

/**
 * Checks for incoming emails in the active session (Guerrilla or Gmail)
 */
export async function checkBurnerMessages(token: string, address?: string): Promise<BurnerMessage[]> {
  if (token?.startsWith('gmail_') || (address && isGmailAddress(address))) {
    return checkDisposableGmailMessages(address || token);
  }

  const url = `${BASE_URL}?f=check_email&seq=0&sid_token=${encodeURIComponent(token)}`;
  const response = await fetchWithTimeout(url, {
    method: 'GET',
    headers: { 'Accept': 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`Failed to check messages (HTTP ${response.status})`);
  }

  const data = await response.json();
  const list: RawEmailItem[] = data.list || [];

  const remote = list.map((item) => ({
    id: String(item.mail_id),
    from: item.mail_from,
    subject: item.mail_subject || '(No subject)',
    date: item.mail_date,
    bodyPreview: item.mail_excerpt || '',
    isRead: item.mail_read === 1,
  }));

  // Include any locally simulated test OTP messages for this address
  if (address && typeof window !== 'undefined' && window.sessionStorage) {
    const simKey = `tempmailer_sim_${address.toLowerCase()}`;
    const rawSim = sessionStorage.getItem(simKey);
    if (rawSim) {
      try {
        const simList: BurnerMessage[] = JSON.parse(rawSim);
        return [...simList, ...remote];
      } catch {
        // ignore
      }
    }
  }

  return remote;
}

/**
 * Fetches complete email content and sanitized HTML/text
 */
export async function fetchBurnerMessageDetail(
  mailId: string,
  token: string,
  address?: string
): Promise<RawEmailDetail> {
  if (token?.startsWith('gmail_') || (address && isGmailAddress(address))) {
    return fetchDisposableGmailMessageDetail(mailId, address || '');
  }

  // Check if it was a simulated OTP message
  if (address && typeof window !== 'undefined' && window.sessionStorage) {
    const simKey = `tempmailer_sim_${address.toLowerCase()}`;
    const rawSim = sessionStorage.getItem(simKey);
    if (rawSim) {
      try {
        const simList: BurnerMessage[] = JSON.parse(rawSim);
        const found = simList.find((m) => m.id === mailId);
        if (found) {
          return {
            mail_id: found.id,
            mail_from: found.from,
            mail_subject: found.subject,
            mail_date: found.date,
            mail_body: found.htmlBody || `<p>${found.bodyPreview}</p>`,
          };
        }
      } catch {
        // ignore
      }
    }
  }

  const url = `${BASE_URL}?f=fetch_email&email_id=${encodeURIComponent(
    mailId
  )}&sid_token=${encodeURIComponent(token)}`;
  const response = await fetchWithTimeout(url, {
    method: 'GET',
    headers: { 'Accept': 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch email detail (HTTP ${response.status})`);
  }

  const data: RawEmailDetail = await response.json();
  return data;
}

/**
 * Simulates a fresh incoming OTP message for any disposable mailbox
 */
export function simulateBurnerOtp(mailbox: BurnerMailbox, serviceName?: string): BurnerMessage {
  if (isGmailAddress(mailbox.address) || mailbox.token?.startsWith('gmail_')) {
    return simulateIncomingOtp(mailbox.address, serviceName);
  }

  let template = serviceName
    ? OTP_SERVICE_TEMPLATES.find((t) => t.service.toLowerCase() === serviceName.toLowerCase())
    : null;

  if (!template) {
    template = OTP_SERVICE_TEMPLATES[Math.floor(Math.random() * OTP_SERVICE_TEMPLATES.length)];
  }

  const freshOtp = generateRandomOtp();
  const subject = template.createSubject(freshOtp);
  const bodyPreview = template.createBodyPreview(freshOtp, mailbox.address);
  const htmlBody = template.createHtml(freshOtp, mailbox.address);

  const simMsg: BurnerMessage = {
    id: `sim-otp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    from: template.from,
    subject,
    date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    bodyPreview,
    htmlBody,
    isRead: false,
  };

  if (typeof window !== 'undefined' && window.sessionStorage) {
    const simKey = `tempmailer_sim_${mailbox.address.toLowerCase()}`;
    const prevRaw = sessionStorage.getItem(simKey);
    const prevList: BurnerMessage[] = prevRaw ? JSON.parse(prevRaw) : [];
    sessionStorage.setItem(simKey, JSON.stringify([simMsg, ...prevList]));
  }

  return simMsg;
}

/**
 * Sets a custom username for the current burner mailbox
 */
export async function setCustomBurnerUsername(
  username: string,
  token: string,
  domain: string = 'guerrillamailblock.com'
): Promise<BurnerMailbox> {
  const cleanUser = username.trim().toLowerCase().replace(/[^a-z0-9._-]/g, '');
  if (!cleanUser) {
    throw new Error('Username must contain letters or numbers.');
  }

  if (domain === 'gmail.com' || domain === 'googlemail.com' || isGmailAddress(`x@${domain}`)) {
    const mailbox = initDisposableGmailMailbox(cleanUser, domain);
    addMailboxToVault(mailbox);
    return mailbox;
  }

  const url = `${BASE_URL}?f=set_email_user&email_user=${encodeURIComponent(
    cleanUser
  )}&sid_token=${encodeURIComponent(token)}`;
  const response = await fetchWithTimeout(url, {
    method: 'GET',
    headers: { 'Accept': 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`Failed to set custom username (HTTP ${response.status})`);
  }

  const data = await response.json();
  const mailbox: BurnerMailbox = {
    address: data.email_addr,
    token: data.sid_token,
    createdAt: Date.now(),
    expiresAt: Date.now() + 60 * 60 * 1000,
  };

  addMailboxToVault(mailbox);
  return mailbox;
}

/**
 * Deletes current session
 */
export async function forgetBurnerMailbox(address: string, token: string): Promise<void> {
  if (isGmailAddress(address) || token?.startsWith('gmail_')) {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      sessionStorage.removeItem(`tempmailer_gmail_msgs_${address.toLowerCase()}`);
      sessionStorage.removeItem('tempgmail_burner_session');
    }
    return;
  }

  try {
    const url = `${BASE_URL}?f=forget_me&email_addr=${encodeURIComponent(
      address
    )}&sid_token=${encodeURIComponent(token)}`;
    await fetch(url, { method: 'GET' });
  } finally {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      sessionStorage.removeItem('tempgmail_burner_session');
    }
  }
}

/**
 * Retrieves cached active mailbox session if still valid
 */
export function getSavedBurnerMailbox(): BurnerMailbox | null {
  const vault = getSavedMailboxVault();
  return vault.length > 0 ? vault[0] : null;
}

const VAULT_STORAGE_KEY = 'tempgmail_burner_vault';

/**
 * Retrieves all stored active mailboxes from the vault
 */
export function getSavedMailboxVault(): BurnerMailbox[] {
  try {
    if (typeof window === 'undefined' || !window.sessionStorage) return [];
    const raw = sessionStorage.getItem(VAULT_STORAGE_KEY);
    if (!raw) return [];
    const list: BurnerMailbox[] = JSON.parse(raw);
    const valid = list.filter((m) => !m.expiresAt || Date.now() < m.expiresAt);
    if (valid.length !== list.length) {
      sessionStorage.setItem(VAULT_STORAGE_KEY, JSON.stringify(valid));
    }
    return valid;
  } catch {
    return [];
  }
}

/**
 * Saves mailbox vault list to sessionStorage (capped at 5)
 */
export function saveMailboxVault(vault: BurnerMailbox[]): void {
  try {
    if (typeof window === 'undefined' || !window.sessionStorage) return;
    sessionStorage.setItem(VAULT_STORAGE_KEY, JSON.stringify(vault.slice(0, 5)));
  } catch (err) {
    console.warn('Failed to save mailbox vault:', err);
  }
}

/**
 * Adds or updates a mailbox in the vault
 */
export function addMailboxToVault(mailbox: BurnerMailbox): BurnerMailbox[] {
  const existing = getSavedMailboxVault();
  const exists = existing.find((m) => m.address === mailbox.address);
  let updated: BurnerMailbox[];
  if (exists) {
    updated = existing.map((m) => (m.address === mailbox.address ? mailbox : m));
  } else {
    updated = [...existing, mailbox].slice(0, 5);
  }
  saveMailboxVault(updated);
  return updated;
}

/**
 * Removes a mailbox from the vault
 */
export function removeMailboxFromVault(address: string): BurnerMailbox[] {
  const existing = getSavedMailboxVault();
  const updated = existing.filter((m) => m.address !== address);
  saveMailboxVault(updated);
  return updated;
}
