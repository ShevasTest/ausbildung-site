# 🇩🇪 Alexander — Ausbildung Portfolio (Fachinformatiker AE)

A production-ready portfolio website built to apply for **Ausbildung Fachinformatiker für Anwendungsentwicklung (2026)** in Germany.

The goal is simple: show practical frontend engineering skills in a way that is clear for both technical reviewers and HR.

## ✨ Live Project

- **Target URL:** `https://alex-ausbildung-portfolio.vercel.app`

> If you deploy to another domain, update `siteConfig.baseUrl` in `src/lib/seo.ts`.

## 🚀 Highlights

- **Bilingual UX (DE/EN)** with `next-intl`
- **Mobile-first design** and clean information hierarchy
- **Dark/Light theme** with accessible controls
- **Performance-first animations** (only `transform` + `opacity`, no blur/filter effects)
- **5 practical project demos** with real interaction logic (mock data where needed)
- **SEO-ready** metadata + Open Graph images + structured data + sitemap + robots
- **Accessibility pass** (keyboard navigation, focus-visible states, skip link, ARIA support)
- **PWA basics** (manifest + service worker registration)

## 🧩 Included Demo Projects

1. **KI-Bewerbungshelfer**  
   AI-style helper that analyzes a job posting and streams a tailored cover letter.

2. **Mietpreise-Tracker**  
   Rental analytics dashboard for German cities with trends and affordability calculator.

3. **SmartChat**  
   Chat-style AI assistant demo with streaming responses, markdown rendering and code highlighting.

4. **DevDash**  
   Developer dashboard with widgets, drag-and-drop layout, Pomodoro timer, notes and PWA install flow.

5. **This Portfolio**  
   The portfolio itself as an open, structured engineering showcase.

## 🛠️ Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript (strict)
- **Styling:** Tailwind CSS v4
- **Animation:** Framer Motion + CSS transitions
- **i18n:** next-intl
- **Linting:** ESLint

## 📦 Local Setup

```bash
git clone <your-repo-url>
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

## 🏗️ Deploy to GitHub + Vercel

### 1) Push to GitHub

```bash
git init
git add .
git commit -m "feat: initial Ausbildung portfolio release"
git branch -M main
git remote add origin https://github.com/<your-username>/ausbildung-site.git
git push -u origin main
```

### 2) Deploy on Vercel

#### Option A (recommended)
- Import the GitHub repository in Vercel UI
- Framework preset: **Next.js** (auto-detected)
- Build command: `npm run build`
- Output: default Next.js output

#### Option B (CLI)
```bash
npm i -g vercel
vercel login
vercel
vercel --prod
```

No runtime secrets are required for the current demo setup.

## 📁 Project Structure

```text
src/
  app/
  components/
  i18n/
  lib/
messages/
memory/
public/
```

## 👤 Author

**Alexander Shevchenko**
- GitHub: https://github.com/ShevasTest
- LinkedIn: https://www.linkedin.com/in/oleksandr-it/
- Email: oleksandr.o.shevchenko@gmail.com

---

Built with focus on clarity, performance, and practical product thinking for the German Ausbildung market.