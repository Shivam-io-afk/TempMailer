import process from 'node:process';
import { generateGmailFilterXml } from '../src/utils/filterXmlGenerator.ts';
import type { GeneratedEmail, GmailFilterRule } from '../src/types/index.ts';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    process.exit(1);
  } else {
    console.log(`✅ PASS: ${message}`);
  }
}

console.log('--- Running Gmail Filter XML Unit Tests ---');

const sampleEmails: GeneratedEmail[] = [
  { id: '1', address: 'alex.dev@gmail.com', type: 'dot' },
  { id: '2', address: 'a.lexdev@gmail.com', type: 'dot' },
  { id: '3', address: 'alexdev+trial@gmail.com', type: 'plus' },
];

const sampleRule: GmailFilterRule = {
  labelName: 'Special-Signups',
  applyLabel: true,
  skipInbox: true,
  markAsRead: false,
  star: true,
  neverSpam: true,
};

const xml = generateGmailFilterXml(sampleEmails, sampleRule, 'alexdev@gmail.com');

assert(xml.includes("<?xml version='1.0' encoding='UTF-8'?>"), 'Contains XML declaration');
assert(xml.includes("<feed xmlns='http://www.w3.org/2005/Atom'"), 'Contains Atom feed namespace');
assert(xml.includes("<apps:property name='label' value='Special-Signups'/>"), 'Contains custom label property');
assert(xml.includes("<apps:property name='shouldArchive' value='true'/>"), 'Contains shouldArchive property');
assert(xml.includes("<apps:property name='shouldStar' value='true'/>"), 'Contains shouldStar property');
assert(xml.includes("<apps:property name='neverSpam' value='true'/>"), 'Contains neverSpam property');
assert(xml.includes('alex.dev@gmail.com') && xml.includes('alexdev+trial@gmail.com'), 'Contains target alias email addresses in hasTheWord filter');

console.log('--- All Filter XML Tests Passed! ---');
