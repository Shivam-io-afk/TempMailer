export type Theme = 'dark' | 'light';

export type ActiveTab = 'gmail-matrix' | 'burner-inbox' | 'guide';

export type DotMode = 'all' | 'random' | 'custom';
export type PlusMode = 'none' | 'preset' | 'timestamp' | 'random' | 'custom';

export interface GmailGeneratorConfig {
  email: string;
  enableDots: boolean;
  dotMode: DotMode;
  maxResults: number;
  enablePlus: boolean;
  plusMode: PlusMode;
  customTag: string;
  includeGooglemail: boolean;
}

export interface GeneratedEmail {
  id: string;
  address: string;
  type: 'dot' | 'plus' | 'googlemail' | 'combined';
  tags?: string[];
}

export interface GmailFilterRule {
  labelName: string;
  applyLabel: boolean;
  skipInbox: boolean;
  markAsRead: boolean;
  star: boolean;
  neverSpam: boolean;
}

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

