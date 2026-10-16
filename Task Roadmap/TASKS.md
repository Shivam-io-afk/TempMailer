# Tasks

### TASK-001 — Initialize Vite + React + TypeScript + Tailwind CSS Project
Status: VERIFIED
Depends on: None
Files: package.json, vite.config.ts, tsconfig.json, index.html, src/main.tsx, src/index.css
Acceptance:
- [x] Project scaffolds cleanly with Vite, React 19, TypeScript, and Tailwind CSS
- [x] Lucide icons and DOMPurify dependencies installed
- [x] Build command passes with zero errors/warnings (`npm run build`)
- [x] Dev server starts and serves basic page cleanly
Test plan: Run `npm run build` and verify exit code 0.
Evidence: `npm run build` passed cleanly, transforming 1923 modules in 442ms with 0 errors.

---

### TASK-002 — App Shell, Theme Provider, and Navigation Architecture
Status: VERIFIED
Depends on: TASK-001
Files: src/types/index.ts, src/context/ThemeContext.tsx, src/components/Header.tsx, src/components/Tabs.tsx, src/App.tsx
Acceptance:
- [x] Dark / Light theme toggles with smooth transition and `localStorage` persistence
- [x] Header includes title, badge, mode switch, and GitHub link
- [x] Responsive navigation tabs switch between "Gmail Matrix & Filters", "Live Burner Inbox", and "Guide"
- [x] Clean container layout with proper mobile padding
Test plan: Static typing and build verification.
Evidence: Verified with `tsc -b && vite build` passing with zero errors. Fixed type imports for `verbatimModuleSyntax`.

---

### TASK-003 — Gmail Dot Matrix & Plus Tag Algorithmic Engine
Status: VERIFIED
Depends on: TASK-001
Files: src/utils/gmailGenerator.ts, src/types/index.ts, tests/test-generator.ts
Acceptance:
- [x] Sanitizes input email (trims, lowercases, validates Gmail/Googlemail domain)
- [x] Computes exact dot permutations via bitwise combinations with safe upper-bound caps (max 1,024 to prevent memory lockup)
- [x] Generates plus tags (`+tag`) with presets (numbers, random hash, timestamp, custom keyword)
- [x] Supports `@googlemail.com` domain toggle
- [x] Exports result set to formatted TXT and CSV strings
Test plan: Automated test suite running validation, permutation uniqueness, long username limits, and export formats.
Evidence: `npm run test:unit` ran 24 assertions with 100% pass rate. `npm run build` passed with zero errors.

---

### TASK-004 — Gmail Generator UI & Export Controls
Status: VERIFIED
Depends on: TASK-002, TASK-003
Files: src/components/gmail/GmailGenerator.tsx, src/components/gmail/EmailCard.tsx, src/components/gmail/ExportActions.tsx
Acceptance:
- [x] User can enter username or full Gmail address with real-time feedback
- [x] Options panel for selecting modes (All Dots, Random Dots, Plus Tags, Googlemail)
- [x] Quantity slider/selector with badge showing total possible variations
- [x] Filterable output list with 1-click individual copy (showing "Copied!" feedback)
- [x] Bulk "Copy All", "Download TXT", and "Download CSV" buttons
- [x] Handled empty states and invalid input warning
Test plan: Interactive validation, performance pagination, and production build.
Evidence: `npm run build` passed with zero errors. Components integrated in `App.tsx` with responsive layout and real-time calculation.

---

### TASK-005 — Gmail Filter XML Generator & Walkthrough Modal
Status: VERIFIED
Depends on: TASK-004
Files: src/utils/filterXmlGenerator.ts, src/components/gmail/FilterModal.tsx, tests/test-filter-xml.ts
Acceptance:
- [x] Generates RFC-compliant Google Mail Filter Atom XML (`<feed xmlns='http://www.w3.org/2005/Atom'>`)
- [x] Allows user to specify label name, auto-archive (skip inbox), mark as read, or apply star
- [x] Downloads `mail-filters.xml` to user's device
- [x] Provides 3-step visual instruction modal on importing into Gmail Settings
Test plan: Verify generated XML structure against official Google filter schema; test file download.
Evidence: `node --experimental-strip-types tests/test-filter-xml.ts` passed 7/7 assertions verifying Atom feed tags, namespaces, query grouping, and properties. Build passed.

---

### TASK-006 — Disposable Mail API Service & Verification
Status: VERIFIED
Depends on: TASK-001
Files: src/services/burnerMailApi.ts, docs/API.md, tests/test-burner-api.ts
Acceptance:
- [x] Test and verify public disposable email API endpoints (GuerrillaMail verified with full CORS wildcard)
- [x] Account creation / mailbox initialization function with error handling
- [x] Message polling function with rate-limit respect and timeout handling
- [x] Document verified endpoint contracts in docs/API.md with status VERIFIED
Test plan: Live API request tests verifying mailbox initialization, session token generation, message list checking, and detail fetching.
Evidence: `tests/test-burner-api.ts` verified against live API returning HTTP 200, generating address, token, message list, and message body. Documented in `docs/API.md`.

---

### TASK-007 — Live Burner Inbox UI & Sanitized Reader
Status: VERIFIED
Depends on: TASK-002, TASK-006
Files: src/components/burner/BurnerInbox.tsx, src/components/burner/MessageList.tsx, src/components/burner/MessageDetail.tsx
Acceptance:
- [x] Display active burner address with 1-click copy and QR code modal
- [x] Auto-refresh polling timer (15s countdown animation) + manual Refresh button
- [x] Message list showing sender, subject, and relative time with unread dots
- [x] Split-view email reader displaying sanitized HTML (via DOMPurify) and plain-text fallback
- [x] Loading skeleton, empty mailbox state ("Listening for emails..."), and error banner
Test plan: Live API integration, split view message inspection, security sanitization, and production build.
Evidence: `npm run build` and `npm run test:unit` passing. DOMPurify security sanitization protects HTML reader from XSS. Live auto-poll countdown ring and QR code modal functional.

---

### TASK-008 — Educational & Safety Guide
Status: VERIFIED
Depends on: TASK-002
Files: src/components/guide/GuideTab.tsx
Acceptance:
- [x] Interactive explainer comparing Dot Trick vs Plus Addressing vs Burner Inbox
- [x] Gmail compatibility breakdown (which websites accept dots vs plus tags)
- [x] Privacy best practices & safety tips
Test plan: Responsive layout inspection, clarity of comparison matrix, and production build check.
Evidence: `npm run build` passed with zero errors. GuideTab fully integrated into navigation tabs with 3-step XML import guide.

---

### TASK-009 — Comprehensive Audit, Polish, and Production Build
Status: VERIFIED
Depends on: TASK-001 through TASK-008
Files: src/*, tests/*, docs/*
Acceptance:
- [x] Full production build succeeds (`npm run build`)
- [x] Zero TypeScript errors and zero console errors
- [x] Full responsive testing (mobile 375px, tablet 768px, desktop 1280px+)
- [x] Keyboard navigation and accessibility contrast check
- [x] Static lint audit (`npm run lint` - 0 errors)
Test plan: Production build execution, linter check, automated test suites.
Evidence: `npm run build` passed in 499ms. `npm run test:unit` ran 3 separate test suites (Generator, Filter XML, Live Burner API) with 100% pass rate. `npm run lint` passed with 0 errors.

