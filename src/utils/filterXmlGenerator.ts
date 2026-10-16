import type { GmailFilterRule, GeneratedEmail } from '../types';

/**
 * Escapes XML special characters for safety
 */
function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '&':
        return '&amp;';
      case '\'':
        return '&apos;';
      case '"':
        return '&quot;';
      default:
        return c;
    }
  });
}

/**
 * Generates official Google Mail Filter Atom XML (<feed>) compatible with Gmail Settings Import
 */
export function generateGmailFilterXml(
  emails: GeneratedEmail[],
  rule: GmailFilterRule,
  baseEmail?: string
): string {
  const timestamp = new Date().toISOString();
  
  // Format the 'to' query. If there are many emails, group them with OR
  // If baseEmail with '+' exists, we can use `to:(baseEmail+* OR email1 OR email2)`
  let toQuery = '';
  if (emails.length === 0 && baseEmail) {
    toQuery = `${baseEmail.split('@')[0]}+*`;
  } else if (emails.length > 50 && baseEmail) {
    // Gmail queries have length limits, so for very large lists, use smart wildcard + explicit top list
    const [local, domain] = baseEmail.split('@');
    toQuery = `to:(${local}+*@${domain || 'gmail.com'})`;
  } else {
    toQuery = emails.map((e) => e.address).join(' OR ');
  }

  const escapedTo = escapeXml(toQuery);
  const escapedLabel = escapeXml(rule.labelName || 'Temp-Aliases');

  const properties: string[] = [
    `\t\t<apps:property name='hasTheWord' value='${escapedTo}'/>`,
  ];

  if (rule.applyLabel && rule.labelName.trim()) {
    properties.push(`\t\t<apps:property name='label' value='${escapedLabel}'/>`);
  }
  if (rule.skipInbox) {
    properties.push(`\t\t<apps:property name='shouldArchive' value='true'/>`);
  }
  if (rule.markAsRead) {
    properties.push(`\t\t<apps:property name='shouldMarkAsRead' value='true'/>`);
  }
  if (rule.star) {
    properties.push(`\t\t<apps:property name='shouldStar' value='true'/>`);
  }
  if (rule.neverSpam) {
    properties.push(`\t\t<apps:property name='neverSpam' value='true'/>`);
  }

  const xml = `<?xml version='1.0' encoding='UTF-8'?>
<feed xmlns='http://www.w3.org/2005/Atom' xmlns:apps='http://schemas.google.com/apps/2006'>
\t<title>Mail Filters</title>
\t<id>tag:mail.google.com,2008:filters:</id>
\t<updated>${timestamp}</updated>
\t<author>
\t\t<name>TempGmail Suite</name>
\t</author>
\t<entry>
\t\t<category term='filter'></category>
\t\t<title>Mail Filter</title>
\t\t<id>tag:mail.google.com,2008:filter:tempgmail-${Date.now()}</id>
\t\t<updated>${timestamp}</updated>
\t\t<content></content>
${properties.join('\n')}
\t</entry>
</feed>`;

  return xml;
}

/**
 * Initiates browser download of the mail-filters.xml file
 */
export function downloadFilterXml(xmlContent: string, fileName = 'mail-filters.xml'): void {
  const blob = new Blob([xmlContent], { type: 'application/xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

