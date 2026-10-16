import process from 'node:process';
import { extractVerificationData } from '../src/utils/otpExtractor.ts';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    process.exit(1);
  } else {
    console.log(`✅ PASS: ${message}`);
  }
}

console.log('--- Running OTP & Verification Link Extractor Unit Tests ---');

// Test 1: Standard 6-digit verification code
const t1 = extractVerificationData(
  'Your verification code',
  'Welcome! Your verification code is 492041. Enter it to confirm your account.'
);
assert(t1.code === '492041', 'Extracts 6-digit code from "Your verification code is 492041"');

// Test 2: Google-style G-XXXXXX code
const t2 = extractVerificationData(
  'Google verification code',
  'Use G-892140 to verify your identity.'
);
assert(t2.code === 'G-892140', 'Extracts Google-style "G-892140" code');

// Test 3: Code in subject line
const t3 = extractVerificationData(
  '784912 is your security pin',
  'Please enter the security pin on the screen.'
);
assert(t3.code === '784912', 'Extracts code when present in subject');

// Test 4: Year avoidance (does not falsely classify 2026 as an OTP)
const t4 = extractVerificationData(
  'Welcome to Service 2026',
  'Copyright 2026 All rights reserved. Please click below.'
);
assert(t4.code === null, 'Avoids classifying copyright year (2026) as OTP code');

// Test 5: Verification link in HTML
const t5 = extractVerificationData(
  'Activate your subscription',
  'Click the link to verify.',
  '<div><p>Please click here:</p><a href="https://example.com/api/verify?token=abc123xyz">Verify My Email</a></div>'
);
assert(t5.link === 'https://example.com/api/verify?token=abc123xyz', 'Extracts verification URL from HTML anchor href');

// Test 6: Combined code and link
const t6 = extractVerificationData(
  'Discord Login Verification',
  'Your login code is 883921 or visit https://discord.com/verify?token=xyz'
);
assert(t6.code === '883921', 'Extracts code from combined message');
assert(t6.link === 'https://discord.com/verify?token=xyz', 'Extracts link from combined message');

console.log('--- All OTP Extractor Tests Passed! ---');
