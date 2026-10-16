## State
Mode: LIGHTWEIGHT | Phase: 5 (Deploy & Release) | Current task: Production Ready & Verified | Blockers: None

## Decisions
- [2026-10-16] Product Architecture: Hybrid Dual-Engine (Gmail Dot/Tag Generator + Live Disposable Burner Inbox) to satisfy both real-Gmail power users and anonymous throwaway use cases — Accepted
- [2026-10-16] Client-Side Privacy: Dot matrix and plus alias generation runs 100% in browser memory; zero emails stored or transmitted to custom servers — Accepted
- [2026-10-16] Tech Stack: Vite + React 19 + TypeScript + Tailwind CSS v4 + Lucide Icons + DOMPurify for fast static hosting compatibility — Accepted
- [2026-10-16] Disposable Mail Provider: Selected GuerrillaMail REST API following empirical testing verifying native wildcard CORS support (`*`) and active session lifecycle without backend proxy requirement — Accepted

## Constraints & known limitations
- Literal `@gmail.com` addresses cannot be generated as new independent mailboxes via third parties without Google account creation (requires phone verification and violates ToS).
- Long usernames (>14 characters) have $2^{13} = 8,192+$ dot permutations. Algorithmic generator caps max combinations per render (1,024) and paginates display to prevent UI thread lock.
- External disposable mail APIs may have rate limits or intermittent domain blocks by third-party services.

## Lessons (things that failed and why)
- TypeScript tsconfig with `verbatimModuleSyntax: true` requires explicit `import type { ... }` for type-only imports to prevent build errors.
- Fast Refresh with Oxlint requires context hooks (`useTheme`) to be split into separate files (`useTheme.ts`) rather than exported alongside React components.
- In Node test environments, `window` and `sessionStorage` must be guarded with `typeof window !== 'undefined'` for SSR compatibility.

## Temporary code (purpose · reason · replacement plan)
- (None yet)

## Do not touch without approval
- Core RFC dot permutation algorithm logic
- DOMPurify sanitization pipeline for email viewer (security critical)

