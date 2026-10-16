export interface ExtractedVerification {
  code: string | null;
  link: string | null;
  service: string | null;
}

/**
 * Strips HTML tags and decodes common entities to obtain clean plaintext for regex parsing
 */
function cleanHtml(html: string): string {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/\s+/g, ' ');
}

/**
 * Known platforms and services registry for sender / origin identification
 */
const KNOWN_SERVICES: Array<{ regex: RegExp; name: string }> = [
  { regex: /google|gmail|youtube/i, name: 'Google' },
  { regex: /netflix/i, name: 'Netflix' },
  { regex: /spotify/i, name: 'Spotify' },
  { regex: /amazon/i, name: 'Amazon' },
  { regex: /discord/i, name: 'Discord' },
  { regex: /github/i, name: 'GitHub' },
  { regex: /instagram/i, name: 'Instagram' },
  { regex: /steam/i, name: 'Steam' },
  { regex: /telegram/i, name: 'Telegram' },
  { regex: /openai|chatgpt/i, name: 'OpenAI' },
  { regex: /twitter|x\.com/i, name: 'X (Twitter)' },
  { regex: /facebook|meta/i, name: 'Meta' },
  { regex: /uber/i, name: 'Uber' },
  { regex: /paypal/i, name: 'PayPal' },
  { regex: /microsoft|outlook|live\.com|azure/i, name: 'Microsoft' },
  { regex: /apple|icloud/i, name: 'Apple' },
  { regex: /tiktok/i, name: 'TikTok' },
  { regex: /linkedin/i, name: 'LinkedIn' },
  { regex: /reddit/i, name: 'Reddit' },
  { regex: /dropbox/i, name: 'Dropbox' },
  { regex: /slack/i, name: 'Slack' },
  { regex: /whatsapp/i, name: 'WhatsApp' },
  { regex: /guerrillamail/i, name: 'GuerrillaMail' },
];

/**
 * Extracts a recognizable service or company name from the sender and subject
 */
export function extractServiceName(from?: string, subject?: string): string {
  const combined = `${from || ''} ${subject || ''}`;

  // 1. Check against known service patterns
  for (const item of KNOWN_SERVICES) {
    if (item.regex.test(combined)) {
      return item.name;
    }
  }

  // 2. Extract friendly display name from sender format: "Acme Corp <noreply@acme.com>"
  if (from) {
    const angleBracketMatch = from.match(/^([^<]+)<[^>]+>$/);
    if (angleBracketMatch && angleBracketMatch[1]) {
      const displayName = angleBracketMatch[1].replace(/["']/g, '').trim();
      if (displayName && !displayName.includes('@') && displayName.length > 1) {
        return displayName;
      }
    }

    // 3. Fallback to domain root extraction: "support@service.io" -> "Service"
    const emailMatch = from.match(/@([a-z0-9.-]+\.[a-z]{2,})/i);
    if (emailMatch && emailMatch[1]) {
      const host = emailMatch[1].toLowerCase();
      // Remove common subdomains like mail., mailer., accounts., notify., no-reply.
      const cleanedDomain = host.replace(/^(?:mail|mailer|accounts|auth|security|notify|no-reply|noreply|service)\./, '');
      const parts = cleanedDomain.split('.');
      if (parts.length >= 2) {
        const root = parts[0];
        return root.charAt(0).toUpperCase() + root.slice(1);
      }
      return cleanedDomain;
    }
  }

  // 4. Check subject for phrases like "... for <Service>" or "<Service> verification"
  if (subject) {
    const subjectServiceMatch = subject.match(/(?:for|from|on)\s+([A-Z][a-zA-Z0-9]+)/);
    if (subjectServiceMatch && subjectServiceMatch[1]) {
      return subjectServiceMatch[1];
    }
  }

  return 'Online Service';
}

/**
 * Heuristically extracts OTP verification codes, confirmation links, and sender origin
 */
export function extractVerificationData(
  subject: string,
  bodyPreview: string,
  bodyHtml?: string,
  from?: string
): ExtractedVerification {
  const fullText = `${subject} ${bodyPreview} ${bodyHtml ? cleanHtml(bodyHtml) : ''}`;
  let code: string | null = null;
  let link: string | null = null;

  // 1. High-priority Regex patterns for OTP codes with contextual keywords
  const contextPatterns = [
    /(?:verification|security|confirmation|authorization|access|login|one-time|otp|pin)\s+(?:code|pin|password|number)?[\s:=is]+([0-9]{4,8}|[A-Z]-[0-9]{4,8})/i,
    /(?:code|pin)\s+(?:is|:)\s*([0-9]{4,8}|[A-Z]-[0-9]{4,8})/i,
    /([0-9]{4,8})\s+is\s+your\s+(?:verification|security|login|confirmation)?\s*code/i,
    /(?:enter|use)\s+([0-9]{4,8})\s+to\s+(?:verify|confirm|log\s*in|continue)/i,
    /(?:G-[0-9]{6})/i, // Google style
  ];

  for (const regex of contextPatterns) {
    const match = fullText.match(regex);
    if (match) {
      const candidate = (match[1] || match[0]).trim();
      // Ensure candidate isn't just a current year (e.g. 2024, 2025, 2026)
      if (!/^202[0-9]$/.test(candidate)) {
        code = candidate;
        break;
      }
    }
  }

  // 2. Check subject line for standalone codes if not found in body
  if (!code) {
    const subjectMatch = subject.match(/\b([0-9]{4,8})\b/);
    if (subjectMatch && !/^202[0-9]$/.test(subjectMatch[1])) {
      code = subjectMatch[1];
    }
  }

  // 3. Extract primary verification or activation link
  if (bodyHtml) {
    // Search for anchor hrefs with confirmation/activation keywords
    const linkRegex = /href=["'](https?:\/\/[^"']*(?:confirm|verify|activation|activate|validate|token=)[^"']*)["']/i;
    const linkMatch = bodyHtml.match(linkRegex);
    if (linkMatch && linkMatch[1]) {
      link = linkMatch[1];
    }
  }

  // Fallback plaintext link detection if no HTML link found
  if (!link) {
    const textLinkRegex = /(https?:\/\/[^\s<>'"]*(?:confirm|verify|activation|activate|validate|token=)[^\s<>'"]*)/i;
    const textLinkMatch = fullText.match(textLinkRegex);
    if (textLinkMatch && textLinkMatch[1]) {
      link = textLinkMatch[1];
    }
  }

  // 4. Identify sender service / origin
  const service = extractServiceName(from, subject);

  return { code, link, service };
}
