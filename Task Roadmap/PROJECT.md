# PROJECT: TempGmail Suite

Dual-Engine Disposable Email & Gmail Power Suite web application.

---

## 1. Product Blueprint

### Vision & Problem
* **Problem:** Users face privacy leaks, tracking, spam, and signup friction when giving out primary email addresses.
* **Solution:** A unified, privacy-first web utility offering two distinct solutions in one place:
  1. **Gmail Matrix & Filter Suite:** Generate valid `@gmail.com` dot permutations and `+tag` aliases routing to the user's existing inbox, with 1-click downloadable Google Mail Filter XML to auto-organize/archive them. 100% client-side.
  2. **Instant Burner Inbox:** A disposable temporary email inbox for completely anonymous throwaway needs (e.g. one-off verifications), fetching and displaying real-time incoming emails in the browser.

### Target Audience
* Developers & QA engineers testing signup / authentication flows.
* Privacy-conscious internet users.
* Power users managing multiple newsletters and registrations.

### Core Features (MVP)
1. **Engine 1 — Gmail Dot & Tag Generator:**
   * Input Gmail address with instant real-time format validation.
   * Dot Trick Permutations ($2^{n-1}$ algorithm with smart pagination/sampling for long usernames).
   * Plus Addressing generator (`+random`, `+service`, `+date`, `+custom`).
   * `@googlemail.com` domain toggle.
   * Single-click copy with toast feedback.
   * Bulk actions: Copy All, Export as `.txt`, Export as `.csv`.
2. **Gmail Filter XML Export:**
   * Configure Gmail rule (Label name, Skip Inbox / Archive, Mark as Read, Star).
   * Generate valid Atom XML file (`mail-filters.xml`) compatible with Gmail Import.
   * Integrated step-by-step visual import guide.
3. **Engine 2 — Instant Live Burner Inbox:**
   * 1-click instant disposable email address creation.
   * Copy to clipboard, QR Code display (for mobile verification).
   * Live message polling with countdown timer (auto-refresh every 15s + manual refresh).
   * Message list + Split message viewer with sanitized HTML / Plain Text viewer.
   * Auto-cleanup and "Change Address" trigger.
4. **Educational & Privacy Guide:**
   * Visual explanation of RFC dot-handling, plus-addressing compatibility, and safety comparison.

---

## 2. UX / UI Design Specification

### Design Tokens
* **Theme:** Default Dark Mode with persistent Light Mode toggle.
* **Palette:**
  * Background: `zinc-950` (dark) / `slate-50` (light)
  * Surface/Cards: `zinc-900` / `white` with subtle `zinc-800` borders
  * Primary Accent: `indigo-500` / `violet-500` gradient
  * Success/Active: `emerald-500` / `emerald-400`
  * Text: `zinc-100` (high contrast) / `zinc-400` (muted)
* **Typography:**
  * UI font: Sans-serif (Inter / system-ui)
  * Monospace: `font-mono` (Fira Code / JetBrains Mono / ui-monospace) for all emails, codes, and XML.
* **Interactions:**
  * Instant clipboard feedback with animated checkmark.
  * Tab transition animations.
  * Pulse indicators for live polling status.

### Screen Layouts & Components
* **Header:** Logo, tagline, active engine switcher tabs, GitHub link, Theme toggle.
* **Tab 1 — Gmail Matrix & Filters:**
  * Input Bar: Clean hero card with username input, domain badge, presets (Quick 10, Random 25, Full Matrix).
  * Generator Controls: Checkbox toggles for Dot Variations, Plus Tags, Googlemail mirror.
  * Results Grid: Filterable list with copy button per item, copy all, and export dropdown.
  * Filter Rule Drawer/Modal: Pre-configured XML generator.
* **Tab 2 — Live Burner Inbox:**
  * Active Mailbox Bar: Display address, copy button, QR modal button, new address button, refresh status.
  * Mailbox View: Split screen (Inbox list on left / message reader on right) with empty states ("Waiting for incoming emails...").
* **Tab 3 — Guide & Docs:**
  * Interactive accordion explaining Gmail tricks, compatibility test, and step-by-step filter installation.

---

## 3. Technical Architecture

### Stack
* **Framework:** React 19 + TypeScript + Vite
* **Styling:** Tailwind CSS + Lucide React (icons)
* **Animation & Polish:** Lightweight CSS / Motion transitions
* **State Management:** React hooks + `localStorage` for user preferences and saved alias history
* **HTML Sanitization:** DOMPurify for secure email body rendering in Burner Inbox

### External APIs
* **Mail API for Burner Inbox:** Free public disposable mail API (`mail.tm` or `1secmail`).
  * *API STATUS:* UNVERIFIED (Will be tested and verified during Phase 2/3).
  * Fallback: Graceful offline message or alternative public endpoint.
* **Dot Generator & Filter XML:** Pure client-side algorithms (0 API dependencies, 100% private).

---

## 4. Constraints & Non-Negotiables
* **Zero PII Exposure:** User Gmail addresses entered into the dot generator are strictly processed in-memory client-side. Never sent to any backend or logged.
* **Security:** In-browser message viewer must safely sanitize HTML to prevent XSS.
* **Performance:** Generation of dot variations must be non-blocking (capped/paginated for long usernames where $2^{n-1} > 10,000$).

