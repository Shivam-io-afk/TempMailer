import type { DotMode, GmailGeneratorConfig, GeneratedEmail, PlusMode } from '../types';

export interface ValidationResult {
  isValid: boolean;
  normalizedLocalPart: string;
  domain: string;
  error?: string;
}

export const COMMON_PLUS_PRESETS = [
  'trial',
  'newsletter',
  'netflix',
  'amazon',
  'spotify',
  'testing',
  'dev',
  'temp',
  'social',
  'shopping',
  'finance',
  'promo',
];

/**
 * Validates and extracts local-part and domain from an email or username string.
 */
export function validateGmailInput(input: string): ValidationResult {
  const trimmed = input.trim().toLowerCase();
  if (!trimmed) {
    return {
      isValid: false,
      normalizedLocalPart: '',
      domain: 'gmail.com',
      error: 'Please enter a Gmail username or email address.',
    };
  }

  let localPart = trimmed;
  let domain = 'gmail.com';

  if (trimmed.includes('@')) {
    const parts = trimmed.split('@');
    if (parts.length !== 2 || !parts[0] || !parts[1]) {
      return {
        isValid: false,
        normalizedLocalPart: '',
        domain: 'gmail.com',
        error: 'Invalid email format. Expected format: username@gmail.com',
      };
    }
    localPart = parts[0];
    domain = parts[1];

    if (domain !== 'gmail.com' && domain !== 'googlemail.com') {
      return {
        isValid: false,
        normalizedLocalPart: '',
        domain,
        error: 'Only @gmail.com or @googlemail.com addresses are supported.',
      };
    }
  }

  // Remove existing tags if entered: e.g. user+tag -> user
  if (localPart.includes('+')) {
    localPart = localPart.split('+')[0];
  }

  // Strip existing dots to find base local part
  const normalizedLocalPart = localPart.replace(/\./g, '');

  if (normalizedLocalPart.length < 3) {
    return {
      isValid: false,
      normalizedLocalPart,
      domain,
      error: 'Username must be at least 3 characters long.',
    };
  }

  if (normalizedLocalPart.length > 30) {
    return {
      isValid: false,
      normalizedLocalPart,
      domain,
      error: 'Gmail usernames cannot exceed 30 characters.',
    };
  }

  // Gmail allows letters (a-z) and numbers (0-9)
  const validCharsRegex = /^[a-z0-9]+$/;
  if (!validCharsRegex.test(normalizedLocalPart)) {
    return {
      isValid: false,
      normalizedLocalPart,
      domain,
      error: 'Gmail usernames can only contain letters (a-z) and numbers (0-9).',
    };
  }

  return {
    isValid: true,
    normalizedLocalPart,
    domain,
  };
}

/**
 * Calculates total possible dot combinations: 2^(length - 1)
 */
export function getDotCombinationsCount(localPartLength: number): number {
  if (localPartLength <= 1) return 1;
  const slots = localPartLength - 1;
  if (slots > 30) return Math.pow(2, 30); // Prevent overflow
  return Math.pow(2, slots);
}

/**
 * Generate dot permutations using bitmasking with safe upper-bound capping
 */
export function generateDotPermutations(
  localPart: string,
  maxResults: number = 100,
  mode: DotMode = 'all'
): string[] {
  const len = localPart.length;
  if (len <= 1) return [localPart];

  const slots = len - 1;
  const totalCombinations = getDotCombinationsCount(len);
  const targetCount = Math.min(maxResults, totalCombinations);

  const applyMask = (mask: number): string => {
    let result = '';
    for (let i = 0; i < len; i++) {
      result += localPart[i];
      if (i < slots && (mask & (1 << i))) {
        result += '.';
      }
    }
    return result;
  };

  if (mode === 'all' && totalCombinations <= targetCount) {
    // Generate all exact permutations in order
    const list: string[] = [];
    for (let mask = 0; mask < totalCombinations; mask++) {
      list.push(applyMask(mask));
    }
    return list;
  }

  // When combinations exceed targetCount or random mode is requested
  const seenMasks = new Set<number>();
  const list: string[] = [];

  // Key deterministic patterns always included
  const priorityMasks = [
    0, // no dots
    (1 << slots) - 1, // all dots
    1, // first dot
    1 << (slots - 1), // last dot
    0x55555555 & ((1 << slots) - 1), // alternating
    0x2aaaaaaa & ((1 << slots) - 1), // inverse alternating
  ];

  for (const mask of priorityMasks) {
    if (mask < totalCombinations && !seenMasks.has(mask) && list.length < targetCount) {
      seenMasks.add(mask);
      list.push(applyMask(mask));
    }
  }

  // Fill remaining with deterministic stride or random sampling
  let step = Math.max(1, Math.floor(totalCombinations / targetCount));
  let currentMask = 1;
  while (list.length < targetCount && currentMask < totalCombinations) {
    if (!seenMasks.has(currentMask)) {
      seenMasks.add(currentMask);
      list.push(applyMask(currentMask));
    }
    currentMask += step;
  }

  // If still room, generate pseudo-random masks
  let attempts = 0;
  while (list.length < targetCount && attempts < targetCount * 3) {
    attempts++;
    const randomMask = Math.floor(Math.random() * totalCombinations);
    if (!seenMasks.has(randomMask)) {
      seenMasks.add(randomMask);
      list.push(applyMask(randomMask));
    }
  }

  return list;
}

/**
 * Generates plus tags based on mode and optional custom tag
 */
export function generatePlusTags(
  mode: PlusMode,
  customTag?: string,
  count: number = 10
): string[] {
  if (mode === 'none') return [];

  const now = new Date();
  const yearMonthDay = now.toISOString().slice(0, 10).replace(/-/g, '');
  const monthName = now.toLocaleString('en-US', { month: 'short' }).toLowerCase();

  switch (mode) {
    case 'preset':
      return COMMON_PLUS_PRESETS.slice(0, count);

    case 'timestamp':
      return [
        yearMonthDay,
        `${monthName}${now.getFullYear()}`,
        `d${now.getDate()}`,
        `t${now.getHours()}${now.getMinutes()}`,
        `${now.getFullYear()}q${Math.floor(now.getMonth() / 3) + 1}`,
      ];

    case 'random': {
      const tags: string[] = [];
      for (let i = 0; i < count; i++) {
        const rand = Math.random().toString(36).substring(2, 6);
        tags.push(`x${rand}`);
      }
      return tags;
    }

    case 'custom': {
      const sanitized = (customTag || 'tag').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
      if (!sanitized) return ['custom'];
      const tags = [sanitized];
      for (let i = 1; i <= Math.min(count - 1, 9); i++) {
        tags.push(`${sanitized}${i}`);
      }
      return tags;
    }

    default:
      return [];
  }
}

/**
 * Main engine combining dot permutations, plus-tagging, and domain mirroring
 */
export function generateGmailVariations(
  config: GmailGeneratorConfig
): {
  emails: GeneratedEmail[];
  totalPossible: number;
  normalizedLocalPart: string;
  domain: string;
} {
  const validation = validateGmailInput(config.email);
  if (!validation.isValid) {
    return {
      emails: [],
      totalPossible: 0,
      normalizedLocalPart: '',
      domain: 'gmail.com',
    };
  }

  const { normalizedLocalPart, domain } = validation;
  const totalDotsPossible = getDotCombinationsCount(normalizedLocalPart.length);

  // 1. Generate base dot variations
  let baseVariations = [normalizedLocalPart];
  if (config.enableDots) {
    baseVariations = generateDotPermutations(
      normalizedLocalPart,
      config.maxResults,
      config.dotMode
    );
  }

  // 2. Generate plus tags
  const tags = config.enablePlus
    ? generatePlusTags(config.plusMode, config.customTag, 10)
    : [];

  const results: GeneratedEmail[] = [];
  let idCounter = 1;

  // Add primary base email
  results.push({
    id: `email-${idCounter++}`,
    address: `${normalizedLocalPart}@${domain}`,
    type: 'dot',
    tags: ['primary'],
  });

  // Apply dot variations
  for (const dotVar of baseVariations) {
    if (dotVar === normalizedLocalPart) continue; // Already added as primary
    if (results.length >= config.maxResults) break;

    results.push({
      id: `email-${idCounter++}`,
      address: `${dotVar}@${domain}`,
      type: 'dot',
      tags: ['dot-trick'],
    });
  }

  // Apply plus tags to base or to variations if configured
  if (config.enablePlus && tags.length > 0) {
    for (const tag of tags) {
      if (results.length >= config.maxResults) break;
      results.push({
        id: `email-${idCounter++}`,
        address: `${normalizedLocalPart}+${tag}@${domain}`,
        type: 'plus',
        tags: [`+${tag}`],
      });
    }

    // Add a few hybrid (dot + plus) if space permits
    if (config.enableDots && baseVariations.length > 1 && results.length < config.maxResults) {
      const sampleDot = baseVariations[1];
      for (const tag of tags.slice(0, 3)) {
        if (results.length >= config.maxResults) break;
        results.push({
          id: `email-${idCounter++}`,
          address: `${sampleDot}+${tag}@${domain}`,
          type: 'combined',
          tags: ['dot-trick', `+${tag}`],
        });
      }
    }
  }

  // Apply googlemail domain alias if enabled
  if (config.includeGooglemail) {
    const mirrorDomain = domain === 'gmail.com' ? 'googlemail.com' : 'gmail.com';
    const currentEmails = [...results];
    for (const item of currentEmails) {
      if (results.length >= config.maxResults * 1.5) break;
      const [local] = item.address.split('@');
      results.push({
        id: `email-${idCounter++}`,
        address: `${local}@${mirrorDomain}`,
        type: 'googlemail',
        tags: [...(item.tags || []), 'domain-alias'],
      });
    }
  }

  const totalPossible =
    totalDotsPossible * (tags.length > 0 ? tags.length + 1 : 1) * (config.includeGooglemail ? 2 : 1);

  return {
    emails: results,
    totalPossible,
    normalizedLocalPart,
    domain,
  };
}

/**
 * Export email list to plaintext (.txt)
 */
export function exportToTxt(emails: GeneratedEmail[]): string {
  return emails.map((e) => e.address).join('\r\n');
}

/**
 * Export email list to CSV (.csv)
 */
export function exportToCsv(emails: GeneratedEmail[]): string {
  const header = 'Email Address,Type,Tags\r\n';
  const rows = emails
    .map((e) => `"${e.address}","${e.type}","${(e.tags || []).join('; ')}"`)
    .join('\r\n');
  return header + rows;
}

