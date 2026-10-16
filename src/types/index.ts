export type Theme = 'dark' | 'light';

export interface BurnerMailbox {
  address: string;
  token?: string;
  createdAt: number;
  expiresAt?: number;
}

export interface BurnerMessage {
  id: string;
  from: string;
  subject: string;
  date: string;
  bodyPreview: string;
  htmlBody?: string;
  textBody?: string;
  isRead: boolean;
}
