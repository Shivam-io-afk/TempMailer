export interface ExtractedVerification {
  code: string | null;
  link: string | null;
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
 * Heuristically extracts OTP verification codes (e.g. 123456, G-921408) and confirmation links
 */
export function extractVerificationData(
  subject: string,
  bodyPreview: string,
  bodyHtml?: string
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

  return { code, link };
}
