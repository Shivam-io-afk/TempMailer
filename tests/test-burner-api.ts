import process from 'node:process';
import {
  initBurnerMailbox,
  checkBurnerMessages,
  fetchBurnerMessageDetail,
} from '../src/services/burnerMailApi.ts';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    process.exit(1);
  } else {
    console.log(`✅ PASS: ${message}`);
  }
}

async function run() {
  console.log('--- Testing Live Disposable Email API Service ---');
  try {
    // 1. Initialize Mailbox
    const mailbox = await initBurnerMailbox();
    assert(!!mailbox.address, `Mailbox address received: ${mailbox.address}`);
    assert(!!mailbox.token, `Session token received: ${mailbox.token}`);
    assert(mailbox.address.includes('@'), 'Address contains @ domain');

    // 2. Check Messages
    const messages = await checkBurnerMessages(mailbox.token!);
    assert(Array.isArray(messages), `Messages array returned (count: ${messages.length})`);
    
    // Guerrilla mail creates a welcome email on init
    if (messages.length > 0) {
      const first = messages[0];
      assert(!!first.id, `First message ID present: ${first.id}`);
      assert(!!first.subject, `First message subject: ${first.subject}`);

      // 3. Fetch full detail
      const detail = await fetchBurnerMessageDetail(first.id, mailbox.token!);
      assert(!!detail.mail_body, 'Email detail body successfully fetched');
      assert(detail.mail_subject === first.subject, 'Subject matches');
    }

    console.log('--- Live API Service Tests 100% Passed! ---');
  } catch (err: unknown) {
    console.error('API Test Error:', (err as Error).message);
    process.exit(1);
  }
}

run();

