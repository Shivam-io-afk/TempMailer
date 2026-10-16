export interface PasswordOptions {
  length?: number;
  includeUppercase?: boolean;
  includeLowercase?: boolean;
  includeNumbers?: boolean;
  includeSymbols?: boolean;
}

const UPPERCASE = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // Excludes confusing I, O
const LOWERCASE = 'abcdefghjkmnpqrstuvwxyz'; // Excludes confusing l, o
const NUMBERS = '23456789'; // Excludes confusing 0, 1
const SYMBOLS = '!@#$%^&*-_+=';

const FIRST_NAMES = [
  'Alex', 'Jordan', 'Taylor', 'Morgan', 'Sam', 'Casey', 'Riley', 'Avery',
  'Cameron', 'Dakota', 'Reese', 'Quinn', 'Harper', 'Rowan', 'Finley', 'Kai'
];

const LAST_NAMES = [
  'Vance', 'Sterling', 'Mercer', 'Cross', 'Sinclair', 'Hayes', 'Chen', 'Patel',
  'Novak', 'Kim', 'Brooks', 'Stone', 'Knight', 'Fox', 'Holloway', 'Winter'
];

/**
 * Generates a cryptographically strong password using window.crypto.getRandomValues
 */
export function generateSecurePassword(options: PasswordOptions = {}): string {
  const length = options.length ?? 16;
  const useUpper = options.includeUppercase ?? true;
  const useLower = options.includeLowercase ?? true;
  const useNums = options.includeNumbers ?? true;
  const useSyms = options.includeSymbols ?? true;

  let charset = '';
  const mandatoryChars: string[] = [];

  // Use crypto API (works in both Node.js with webcrypto and modern browsers)
  const cryptoObj =
    typeof window !== 'undefined' && window.crypto
      ? window.crypto
      : (globalThis as unknown as { crypto: Crypto }).crypto;

  const getRandomInt = (max: number): number => {
    if (cryptoObj && cryptoObj.getRandomValues) {
      const array = new Uint32Array(1);
      cryptoObj.getRandomValues(array);
      return array[0] % max;
    }
    return Math.floor(Math.random() * max);
  };

  if (useUpper) {
    charset += UPPERCASE;
    mandatoryChars.push(UPPERCASE[getRandomInt(UPPERCASE.length)]);
  }
  if (useLower) {
    charset += LOWERCASE;
    mandatoryChars.push(LOWERCASE[getRandomInt(LOWERCASE.length)]);
  }
  if (useNums) {
    charset += NUMBERS;
    mandatoryChars.push(NUMBERS[getRandomInt(NUMBERS.length)]);
  }
  if (useSyms) {
    charset += SYMBOLS;
    mandatoryChars.push(SYMBOLS[getRandomInt(SYMBOLS.length)]);
  }

  if (!charset) charset = LOWERCASE + NUMBERS;

  const passwordChars = [...mandatoryChars];
  while (passwordChars.length < length) {
    passwordChars.push(charset[getRandomInt(charset.length)]);
  }

  // Shuffle mandatory characters using Fisher-Yates
  for (let i = passwordChars.length - 1; i > 0; i--) {
    const j = getRandomInt(i + 1);
    [passwordChars[i], passwordChars[j]] = [passwordChars[j], passwordChars[i]];
  }

  return passwordChars.join('');
}

export interface RandomIdentity {
  fullName: string;
  firstName: string;
  lastName: string;
  username: string;
}

/**
 * Generates a realistic test identity and username handle
 */
export function generateRandomIdentity(): RandomIdentity {
  const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
  const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
  const num = Math.floor(10 + Math.random() * 90);
  const username = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${num}`;

  return {
    fullName: `${firstName} ${lastName}`,
    firstName,
    lastName,
    username,
  };
}
