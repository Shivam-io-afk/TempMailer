import process from 'node:process';
import {
  validateGmailInput,
  getDotCombinationsCount,
  generateDotPermutations,
  generatePlusTags,
  generateGmailVariations,
  exportToTxt,
  exportToCsv,
} from '../src/utils/gmailGenerator.ts';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    process.exit(1);
  } else {
    console.log(`✅ PASS: ${message}`);
  }
}

console.log('--- Running Gmail Generator Unit Tests ---');

// 1. Validation
const v1 = validateGmailInput('  John.Doe+promo@Gmail.COM  ');
assert(v1.isValid === true, 'Normalizes case, whitespace, and strips existing dots & plus tags');
assert(v1.normalizedLocalPart === 'johndoe', 'Normalized local-part is "johndoe"');
assert(v1.domain === 'gmail.com', 'Domain is gmail.com');

const v2 = validateGmailInput('user@yahoo.com');
assert(v2.isValid === false, 'Rejects non-Google domains');

const v3 = validateGmailInput('ab');
assert(v3.isValid === false, 'Rejects usernames shorter than 3 characters');

// 2. Combination Counts
assert(getDotCombinationsCount(4) === 8, '4-letter username has 2^(4-1) = 8 combinations');
assert(getDotCombinationsCount(9) === 256, '9-letter username has 2^(9-1) = 256 combinations');
assert(getDotCombinationsCount(1) === 1, '1-letter username combination is 1');

// 3. Permutation Generation
const perms4 = generateDotPermutations('john', 100, 'all');
assert(perms4.length === 8, 'Generated all 8 permutations for "john"');
assert(new Set(perms4).size === 8, 'All 8 permutations are strictly unique');
assert(perms4.includes('john'), 'Includes un-dotted version');
assert(perms4.includes('j.o.h.n'), 'Includes fully dotted version');
assert(perms4.includes('j.ohn'), 'Includes first-dot variation');

// 4. Large Username Safety Cap
const longPerms = generateDotPermutations('verylongusernametest', 50, 'random');
assert(longPerms.length === 50, 'Respects maxResults cap for long usernames');
assert(new Set(longPerms).size === 50, 'Safe permutations for long username are unique');
assert(longPerms.every(p => p.replace(/\./g, '') === 'verylongusernametest'), 'Every variation preserves underlying characters');

// 5. Plus Tag Generation
const presetTags = generatePlusTags('preset', undefined, 5);
assert(presetTags.length === 5, 'Generates preset plus tags');
assert(presetTags.includes('trial'), 'Contains trial tag');

const customTags = generatePlusTags('custom', 'myFilter', 5);
assert(customTags[0] === 'myfilter', 'Sanitizes and handles custom tag');

// 6. Full Variation Engine
const fullResult = generateGmailVariations({
  email: 'alex@gmail.com',
  enableDots: true,
  dotMode: 'all',
  maxResults: 20,
  enablePlus: true,
  plusMode: 'preset',
  customTag: '',
  includeGooglemail: true,
});

assert(fullResult.emails.length > 0, 'Generated email variations');
assert(fullResult.emails.some(e => e.address.endsWith('@googlemail.com')), 'Includes @googlemail.com mirror');
assert(fullResult.emails.some(e => e.type === 'plus'), 'Includes plus-tagged emails');

// 7. Export Formatting
const txtExport = exportToTxt(fullResult.emails);
assert(txtExport.includes('alex@gmail.com'), 'TXT export contains email addresses');

const csvExport = exportToCsv(fullResult.emails);
assert(csvExport.startsWith('Email Address,Type,Tags'), 'CSV export starts with header');

console.log('--- All Generator Unit Tests Passed! ---');
