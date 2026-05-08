# Security Policy

## Reporting a Vulnerability

For any security-related issues, please refer to our [Responsible Disclosure policy](https://www.kraken.com/features/security/bug-bounty). It's crucial that these matters are handled sensitively to protect all users.

## Disclosed Advisories

| Date       | CVE              | Severity | Component                          | Resolution                                                                 |
| ---------- | ---------------- | -------- | ---------------------------------- | -------------------------------------------------------------------------- |
| 2026-05-08 | CVE-2026-23869   | High 7.5 | React Server Components (App Router server actions) | Bumped `next` 15.4.11 → 15.5.15 and `react`/`react-dom` 19.0.4 → 19.0.5. See [Next.js advisory GHSA-q4gf-8mx6-v5v3](https://github.com/vercel/next.js/security/advisories/GHSA-q4gf-8mx6-v5v3) and [React advisory GHSA-479c-33wc-g2pg](https://github.com/facebook/react/security/advisories/GHSA-479c-33wc-g2pg). |
| 2026-05-08 | CVE-2026-44575 (+12 advisories) | High 7.5 | Next.js (App Router middleware bypass, RSC DoS, SSRF, cache poisoning, XSS) | Bumped `next` 15.5.15 → 15.5.18, which patches the May 6–7, 2026 Next.js disclosure wave. Includes [GHSA-267c-6grr-h53f](https://github.com/vercel/next.js/security/advisories/GHSA-267c-6grr-h53f), [GHSA-26hh-7cqf-hhc6](https://github.com/vercel/next.js/security/advisories/GHSA-26hh-7cqf-hhc6), [GHSA-8h8q-6873-q5fj](https://github.com/vercel/next.js/security/advisories/GHSA-8h8q-6873-q5fj), [GHSA-492v-c6pp-mqqv](https://github.com/vercel/next.js/security/advisories/GHSA-492v-c6pp-mqqv), [GHSA-c4j6-fc7j-m34r](https://github.com/vercel/next.js/security/advisories/GHSA-c4j6-fc7j-m34r), [GHSA-mg66-mrh9-m8jx](https://github.com/vercel/next.js/security/advisories/GHSA-mg66-mrh9-m8jx), and others. See the [v15.5.18 release notes](https://github.com/vercel/next.js/releases/tag/v15.5.18) for the full list. |
