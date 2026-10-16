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
Regression check: Playwright test `e2e/04-mailbox-vault.spec.ts` verifies adding an inbox, switching back and forth, and maintaining tab order. Status: VERIFIED (passed).

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
Regression check: Verified with direct headless Chromium test on live server and full Playwright suite passing (`VERIFIED`).

### BUG-003 — Mailbox deletion left phantom pills in vault & froze address display
Severity: high     Status: VERIFIED
Class: state / UX
Repro:
1. Spin up 2 or more mailboxes in the vault.
2. Click "Delete / Burn active mailbox".
Expected: Active mailbox is deleted on server, removed from local storage vault, and UI smoothly switches to remaining mailbox.
Actual: The deleted mailbox remained in local vault storage, exhausting the 5-inbox limit over time, and `isInitializing` stayed `true` indefinitely, locking the address display on "Generating disposable address...".
Root cause:
1) `handleDeleteMailbox` previously only called `forgetBurnerMailbox` on the server without calling `removeMailboxFromVault`.
2) `handleDeleteMailbox` set `setIsInitializing(true)` but delegating to `handleSwitchMailbox` never reset `isInitializing` to `false`.
Fix:
1) Integrated `removeMailboxFromVault(oldAddr)` and updated vault state.
2) Added `setIsInitializing(false)` inside `handleSwitchMailbox` and properly awaited state transitions in `handleDeleteMailbox`.
Regression check: Playwright test `e2e/07-deep-actions-and-fixes.spec.ts` (test 1) validates deletion, vault count decrement, and active address restoration. Status: VERIFIED (passed).

### BUG-004 — ChangeAddressModal retained stale username after switching mailboxes
Severity: medium     Status: VERIFIED
Class: UX / state
Repro:
1. Open mailbox #1, open Change Address modal, close modal.
2. Switch to mailbox #2, open Change Address modal.
Expected: Username input field displays the username prefix of active mailbox #2.
Actual: Username input field retained the username prefix of mailbox #1.
Root cause: Initial state was only assigned on component construction.
Fix: Added a synchronization `useEffect` listening on `[isOpen, currentAddress]` to re-populate `username` and `domain` whenever the modal is shown.
Regression check: Playwright test `e2e/07-deep-actions-and-fixes.spec.ts` (test 2) validates accurate prefix synchronization. Status: VERIFIED (passed).

### BUG-005 — Obsolete "TempGmail" branding in tab title flasher
Severity: low     Status: VERIFIED
Class: branding / polish
Repro:
1. Trigger browser backgrounding with unread messages.
Expected: Tab title displays `(${count}) ✉️ New OTP Received! • TempMailer`.
Actual: Tab title flashed `TempGmail — Disposable Email & Gmail Power Suite`.
Root cause: Hardcoded legacy string in `src/utils/soundAlert.ts`.
Fix: Updated strings to `TempMailer — Instant Disposable Temporary Email` and dynamic title restoration.
Regression check: Playwright test `e2e/07-deep-actions-and-fixes.spec.ts` (test 5) validates branding. Status: VERIFIED (passed).

### BUG-006 — Mobile view navigation trap when switching mailboxes
Severity: medium     Status: VERIFIED
Class: responsive / mobile
Repro:
1. On a mobile viewport, select an email so `mobileView` is set to `'detail'`.
2. Click a vault pill to switch to another mailbox.
Expected: Mobile view switches to message list for the newly selected mailbox.
Actual: User remained on the detail pane showing "No message selected" with no obvious way to get back to the message list without resizing or reloading.
Fix:
1) Reset `setMobileView('list')` whenever switching, creating, or deleting mailboxes in `BurnerInbox.tsx`.
2) Added an explicit `<ArrowLeft /> Back to inbox` button in `MessageDetail.tsx` when no message is selected.
Regression check: Playwright test `e2e/07-deep-actions-and-fixes.spec.ts` (test 3) validates mobile viewport navigation. Status: VERIFIED (passed).

### BUG-007 — Unsafe email body HTML link navigation
Severity: high     Status: VERIFIED
Class: security / UX
Repro:
1. Receive an HTML email with verification links without target attributes.
2. Click the link.
Expected: Links open in a separate tab (`target="_blank" rel="noopener noreferrer"`), preserving the user's active TempMailer session.
Actual: Links could open in the same window, causing the user to lose their temporary inbox session, or expose `window.opener`.
Fix: Added a post-sanitization hook in DOMPurify (`DOMPurify.addHook('afterSanitizeAttributes', ...)`) that enforces `target="_blank"` and `rel="noopener noreferrer"` on all `<a>` tags.
Regression check: Playwright test `e2e/07-deep-actions-and-fixes.spec.ts` (test 4) validates link sanitization and target/rel attributes. Status: VERIFIED (passed).

### BUG-008 — Indefinite network hangs on GuerrillaMail API
Severity: medium     Status: VERIFIED
Class: reliability / network
Repro:
1. When GuerrillaMail API is slow or rate limits client IP, HTTP requests hung indefinitely.
Expected: Request times out after reasonable period (8s) with friendly error message and retry button.
Actual: Browser default timeout (up to 2 minutes) left the user staring at an unresponsive loading state.
Fix: Implemented `fetchWithTimeout` wrapper in `src/services/burnerMailApi.ts` using `AbortController` with an 8000ms deadline.
Regression check: Validated through automated test timeout handling and error banner fallback. Status: VERIFIED.

### BUG-009 — Minified React Error #310 (Hook Order Violation in MessageDetail)
Severity: critical     Status: VERIFIED
Class: code / React lifecycle
Repro:
1. Load TempMailer with no message selected (`message === null`).
2. An incoming email is received and automatically selected (`message` becomes non-null).
Expected: Email detail view mounts smoothly with parsed OTP hero card and sanitized body.
Actual: React threw Minified React Error #310 ("Rendered more hooks than during the previous render"), causing the entire React root to unmount and leaving `<div id="root"></div>` blank.
Root cause: In `src/components/burner/MessageDetail.tsx`, the `useMemo` hook for `sanitizedHtml` was declared below the early return statements `if (!message) return ...` and `if (isLoading) return ...`. When `message` was null, 3 hooks executed; when `message` arrived, 4 hooks executed, violating the fundamental Rules of Hooks.
Fix: Moved `sanitizedHtml` hook to the top level of `MessageDetail`, ensuring identical hook counts on every render.
Regression check: All 14 Playwright tests in the test suite pass 100% green without any console or page errors. Status: VERIFIED (passed).
