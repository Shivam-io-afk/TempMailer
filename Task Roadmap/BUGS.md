# Bugs Log

### BUG-001 — Multi-Mailbox Vault pills reordered unexpectedly on adding new inbox
Severity: medium     Status: VERIFIED
Class: UX / code
Repro:
1. Open TempMailer with initial mailbox #1.
2. Click "+ Add Inbox" to spin up an additional concurrent mailbox.
Expected: Mailbox #1 remains pill #1, and the new mailbox is appended as pill #2.
Actual: The new mailbox was prepended to index 0, causing existing pill #1 to shift to #2 and confusing the active selection.
Root cause: `addMailboxToVault` in `src/services/burnerMailApi.ts` prepended new mailboxes `[mailbox, ...filtered]` rather than appending.
Fix: Updated `addMailboxToVault` to append new mailboxes to the end: `[...existing, mailbox].slice(0, 5)`, and update in-place if the address already exists.
Regression check: Playwright test `e2e/04-mailbox-vault.spec.ts` verifies adding an inbox, switching back and forth, and maintaining tab order. Status: VERIFIED (passed in 2.2s).
