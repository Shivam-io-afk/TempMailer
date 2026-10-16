import process from 'node:process';
import { generateSecurePassword, generateRandomIdentity } from '../src/utils/cryptoGenerator.ts';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    process.exit(1);
  } else {
    console.log(`✅ PASS: ${message}`);
  }
}

console.log('--- Running Crypto Generator Unit Tests ---');

// 1. Length check
const p16 = generateSecurePassword({ length: 16 });
assert(p16.length === 16, 'Generates password of exact requested length 16');

const p24 = generateSecurePassword({ length: 24 });
assert(p24.length === 24, 'Generates password of exact requested length 24');

// 2. Character set inclusion
const complex = generateSecurePassword({
  length: 20,
  includeUppercase: true,
  includeLowercase: true,
  includeNumbers: true,
  includeSymbols: true,
});
assert(/[A-Z]/.test(complex), 'Includes uppercase character');
assert(/[a-z]/.test(complex), 'Includes lowercase character');
assert(/[0-9]/.test(complex), 'Includes number');
assert(/[!@#$%^&*-_+=]/.test(complex), 'Includes symbol');

// 3. Uniqueness / Entropy
const passwords = new Set<string>();
for (let i = 0; i < 50; i++) {
  passwords.add(generateSecurePassword({ length: 16 }));
}
assert(passwords.size === 50, 'All 50 generated passwords are completely unique');

// 4. Identity Generator
const id1 = generateRandomIdentity();
assert(!!id1.fullName && id1.fullName.includes(' '), 'Generates full name with first and last');
assert(!!id1.username && id1.username.includes('.'), 'Generates realistic username handle');

console.log('--- All Crypto Generator Tests Passed! ---');
