# 🇩🇪 Oleksandr — Ausbildung Portfolio (Fachinformatiker AE)

A production-ready portfolio website built to apply for **Ausbildung Fachinformatiker für Anwendungsentwicklung (2026)** in Germany.

The goal is simple: show practical frontend engineering skills in a way that is clear for both technical reviewers and HR.

## ✨ Live

- **Production:** https://oleksandr-shevchenko.de

## 🚀 Highlights

- **Bilingual UX (DE/EN)** with `next-intl`
- **Distinct visual identity** — "technical documentation" design language: IBM Plex + Bricolage Grotesque, ink-blue palette, blueprint grid, dimension-line section labels
- **Motion as progressive enhancement** — CSS scroll-driven animations (`animation-timeline: view()` / `scroll()`), content is always visible without JS, full `prefers-reduced-motion` support
- **Performance-first** — server components wherever possible, `transform`/`opacity`-only animations, lazy-loaded demos
- **Real project demos** (see below) — live APIs and real LLM streaming instead of mock data
- **Real contact form** — server route with Resend integration, honeypot and rate limiting (mailto fallback if not configured)
- **SEO-ready** metadata + Open Graph images + structured data + sitemap + robots
- **Accessibility pass** (keyboard navigation, focus-visible states, skip link, ARIA support)
- **PWA basics** (manifest + service worker registration)

## 🧩 Demo Projects

1. **KI-Bewerbungshelfer** — analyzes a job posting and streams a tailored German cover letter from a real language model through a rate-limited server route. Falls back to an honest local demo mode when no API key is configured.

2. **SmartChat** — ChatGPT-like interface with real LLM streaming, answer styles, markdown + code highlighting and chat history persisted in `localStorage`. Same transparent live/demo behavior.

3. **Mietpreise-Tracker** — rental analytics for 12 German cities based on published median asking rents (2020–2025, curated static dataset with cited sources), SVG trend charts and an affordability calculator.

4. **DevDash** — developer dashboard with live APIs: Open-Meteo weather, real public GitHub activity (server route with caching), Hacker News feed, plus Pomodoro timer, notes and drag-and-drop layout stored locally.

5. **This portfolio** — the site itself as an open, structured engineering showcase.

## 🛠️ Tech Stack

- **Framework:** Next.js 15 (App Router, React Server Components, Route Handlers)
- **Language:** TypeScript (strict)
- **Styling:** Tailwind CSS v4
- **Motion:** CSS scroll-driven animations + transitions (no animation libraries)
- **i18n:** next-intl
- **Fonts:** IBM Plex Sans / IBM Plex Mono / Bricolage Grotesque via `next/font`

## 🔐 Environment Variables (all optional)

The site works fully without secrets — AI demos then run in a clearly labeled local demo mode and the contact form falls back to a prefilled mailto draft.

| Variable | Purpose |
| --- | --- |
| `ANTHROPIC_API_KEY` | Live LLM for SmartChat + KI-Bewerbungshelfer (Claude) |
| `GROQ_API_KEY` | Alternative LLM provider (Llama 3.3 on Groq) |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Alternative LLM provider (Gemini, free tier available) |
| `LLM_MODEL` | Optional model override for the selected provider |
| `RESEND_API_KEY` | Real contact form delivery via Resend |
| `CONTACT_TO_EMAIL` | Recipient address for contact form messages |
| `CONTACT_FROM_EMAIL` | Verified sender, e.g. `Kontakt <mail@domain.de>` |
| `GITHUB_TOKEN` | Optional: higher GitHub API rate limits for DevDash |

Provider priority for the LLM routes: Anthropic → Groq → Google (first configured key wins).

## 📦 Local Setup

```bash
git clone https://github.com/ShevasTest/ausbildung-site.git
cd ausbildung-site
npm install
npm run dev
```

Open `http://localhost:3000`.

## 🧪 Scripts

```bash
npm run dev      # start local development
npm run build    # production build check
npm run start    # start production server
npm run lint     # lint project
```

## 📁 Project Structure

```text
src/
  app/            # routes, layouts, API route handlers (chat, anschreiben, contact, github)
  components/     # sections + project demos
  i18n/           # next-intl setup
  lib/            # llm provider adapter, rate limiting, seo helpers
messages/         # de.json / en.json
memory/           # working notes (backlog, decisions, progress)
public/
```

## 👤 Author

**Oleksandr Shevchenko**
- GitHub: https://github.com/ShevasTest
- LinkedIn: https://www.linkedin.com/in/oleksandr-it/
- Email: oleksandr.o.shevchenko@gmail.com

---

Built with focus on clarity, performance, and practical product thinking for the German Ausbildung market.
