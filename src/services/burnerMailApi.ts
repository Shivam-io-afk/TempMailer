import type { BurnerMailbox, BurnerMessage } from '../types';

const BASE_URL = 'https://api.guerrillamail.com/ajax.php';

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
  const response = await fetch(url, {
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

  // Cache to session storage if running in browser
  if (typeof window !== 'undefined' && window.sessionStorage) {
    sessionStorage.setItem('tempgmail_burner_session', JSON.stringify(mailbox));
  }
  return mailbox;
}

/**
 * Checks for incoming emails in the active session
 */
export async function checkBurnerMessages(token: string): Promise<BurnerMessage[]> {
  const url = `${BASE_URL}?f=check_email&seq=0&sid_token=${encodeURIComponent(token)}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: { 'Accept': 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`Failed to check messages (HTTP ${response.status})`);
  }

  const data = await response.json();
  const list: RawEmailItem[] = data.list || [];

  return list.map((item) => ({
    id: String(item.mail_id),
    from: item.mail_from,
    subject: item.mail_subject || '(No subject)',
    date: item.mail_date,
    bodyPreview: item.mail_excerpt || '',
    isRead: item.mail_read === 1,
  }));
}

/**
 * Fetches complete email content and sanitized HTML/text
 */
export async function fetchBurnerMessageDetail(
  mailId: string,
  token: string
): Promise<RawEmailDetail> {
  const url = `${BASE_URL}?f=fetch_email&email_id=${encodeURIComponent(
    mailId
  )}&sid_token=${encodeURIComponent(token)}`;
  const response = await fetch(url, {
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
 * Sets a custom username for the current burner mailbox
 */
export async function setCustomBurnerUsername(
  username: string,
  token: string
): Promise<BurnerMailbox> {
  const cleanUser = username.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
  if (!cleanUser) {
    throw new Error('Username must contain letters or numbers.');
  }

  const url = `${BASE_URL}?f=set_email_user&email_user=${encodeURIComponent(
    cleanUser
  )}&sid_token=${encodeURIComponent(token)}`;
  const response = await fetch(url, {
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

  if (typeof window !== 'undefined' && window.sessionStorage) {
    sessionStorage.setItem('tempgmail_burner_session', JSON.stringify(mailbox));
  }
  return mailbox;
}

/**
 * Deletes current session
 */
export async function forgetBurnerMailbox(address: string, token: string): Promise<void> {
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
  try {
    if (typeof window === 'undefined' || !window.sessionStorage) return null;
    const raw = sessionStorage.getItem('tempgmail_burner_session');
    if (!raw) return null;
    const mailbox: BurnerMailbox = JSON.parse(raw);
    if (mailbox.expiresAt && Date.now() > mailbox.expiresAt) {
      sessionStorage.removeItem('tempgmail_burner_session');
      return null;
    }
    return mailbox;
  } catch {
    return null;
  }
}
