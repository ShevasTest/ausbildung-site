# Decisions — Ausbildung Portfolio

## Стек
- Next.js 15 App Router (RSC + Server Actions)
- TypeScript strict
- Tailwind CSS v4
- CSS анимации (opacity + transform only)
- next-intl (i18n)
- НЕТ Three.js — производительность важнее 3D

## Дизайн
- Mobile-first
- Dark/light тема с CSS variables
- Цвета: blue (#3B82F6) + emerald (#10B981), bg dark #0A0A0F, bg light #FAFAFA
- Fonts: Inter (body) + JetBrains Mono (code)
- Анимации: ТОЛЬКО opacity + transform. НИКОГДА filter:blur()
- Стиль: Brittany Chiang + Tim TB — профессиональный, чистый, контент-first

## Контент
- Основной язык: Deutsch
- Код/tech terms: English
- Целевая аудитория: немецкие HR для Ausbildung Fachinformatiker AE
- Тон: профессиональный, но живой. Показать Eigeninitiative

## Производительность
- Lighthouse target: 95+ на всех страницах
- No `use client` без необходимости
- Lazy load всех демо-проектов
- Bundle size: минимальный

## Важно
- Каждый демо-проект должен быть РАБОЧИМ (mock data OK, но UI полноценный)
- Ресёрч дизайна ПЕРЕД каждым проектом (web_search для вдохновения)
- Проекты НЕ крипто/Web3 — только практичные, понятные HR
- `npm run build` ВСЕГДА должен проходить
