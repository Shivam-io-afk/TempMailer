import type { Page } from '@playwright/test';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': '*',
};

export interface MockEmailItem {
  mail_id: string;
  mail_from: string;
  mail_subject: string;
  mail_excerpt: string;
  mail_date?: string;
  mail_body?: string;
}

export interface MockGuerrillaOptions {
  initialUser?: string;
  messages?: MockEmailItem[];
}

export async function setupMockGuerrillaApi(
  page: Page,
  options: MockGuerrillaOptions = {}
) {
  let currentUser = options.initialUser || 'testuser';
  let mailboxCounter = 1;
  const messages: MockEmailItem[] = options.messages || [
    {
      mail_id: '1',
      mail_from: 'welcome@guerrillamail.com',
      mail_subject: 'Welcome to Guerrilla Mail',
      mail_excerpt: 'Your temporary email address is ready.',
      mail_date: '12:00',
      mail_body: '<p>Welcome to Guerrilla Mail!</p>',
    },
  ];

  await page.route((url) => url.href.includes('guerrillamail.com/ajax.php'), async (route) => {
    if (route.request().method() === 'OPTIONS') {
      await route.fulfill({
        status: 200,
        headers: CORS_HEADERS,
      });
      return;
    }

    const url = new URL(route.request().url());
    const func = url.searchParams.get('f');

    if (func === 'get_email_address') {
      const user = `${currentUser}_${mailboxCounter++}`;
      await route.fulfill({
        status: 200,
        headers: CORS_HEADERS,
        contentType: 'application/json',
        body: JSON.stringify({
          email_addr: `${user}@guerrillamailblock.com`,
          sid_token: `token_${user}`,
          email_timestamp: Math.floor(Date.now() / 1000),
        }),
      });
      return;
    }

    if (func === 'set_email_user') {
      const newUser = url.searchParams.get('email_user') || currentUser;
      currentUser = newUser;
      await route.fulfill({
        status: 200,
        headers: CORS_HEADERS,
        contentType: 'application/json',
        body: JSON.stringify({
          email_addr: `${newUser}@guerrillamailblock.com`,
          sid_token: `token_${newUser}`,
          auth: { success: true, error_codes: [] },
        }),
      });
      return;
    }

    if (func === 'forget_me') {
      await route.fulfill({
        status: 200,
        headers: CORS_HEADERS,
        contentType: 'application/json',
        body: JSON.stringify({ auth: { success: true } }),
      });
      return;
    }

    if (func === 'check_email') {
      await route.fulfill({
        status: 200,
        headers: CORS_HEADERS,
        contentType: 'application/json',
        body: JSON.stringify({
          list: messages.map((m) => ({
            mail_id: m.mail_id,
            mail_from: m.mail_from,
            mail_subject: m.mail_subject,
            mail_excerpt: m.mail_excerpt,
            mail_date: m.mail_date || '12:00',
            mail_timestamp: Math.floor(Date.now() / 1000),
            mail_read: 0,
          })),
          count: String(messages.length),
        }),
      });
      return;
    }

    if (func === 'fetch_email') {
      const emailId = url.searchParams.get('email_id');
      const found = messages.find((m) => m.mail_id === emailId) || messages[0];
      await route.fulfill({
        status: 200,
        headers: CORS_HEADERS,
        contentType: 'application/json',
        body: JSON.stringify({
          mail_id: found ? found.mail_id : '1',
          mail_from: found ? found.mail_from : 'welcome@guerrillamail.com',
          mail_subject: found ? found.mail_subject : 'Welcome to Guerrilla Mail',
          mail_body: found?.mail_body || '<p>Welcome to Guerrilla Mail!</p>',
          mail_date: found?.mail_date || '12:00',
        }),
      });
      return;
    }

    await route.continue();
  });
}
