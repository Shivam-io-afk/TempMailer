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
### BUG-002 — Email address stuck on "Generating address..." on initial load
Severity: high     Status: VERIFIED
Class: code / lifecycle
Repro:
1. Open http://localhost:5174/ in a browser in development mode.
Expected: Temporary email address is generated and displayed within 1-2 seconds.
Actual: The address display remained stuck on "Generating address...".
Root cause:
Twofold:
1) React StrictMode double-mounting cancelled the `setTimeout` on initial mount while leaving an initialization guard flag set, skipping initialization on remount.
2) Accidental reference error on `countdownTimerRef` combined with a cascading dependency array `[mailbox, refreshMessages]` caused effect interruption.
Fix:
1) Restored `countdownTimerRef` declaration.
2) Streamlined mount effect with a clean mount cancellation flag scoped strictly to component mount `[]`.
3) Added explicit loading spinner and fallback "Generate Email Address" button so UI never gets stuck in a blank or unclickable state.
Regression check: Verified with direct headless Chromium test on live server (`zdrgqgiz@guerrillamailblock.com` generated in <2s) and full Playwright suite 9/9 passing (`VERIFIED`).
