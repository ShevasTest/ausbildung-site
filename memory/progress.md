# Progress — Ausbildung Portfolio

## 2026-02-09
### Phase 1 (все задачи)
- Создан проект Next.js 15 App Router + TypeScript + Tailwind v4
- Установлены: framer-motion, next-intl, @next/bundle-analyzer
- Дизайн-система: primary #3B82F6, accent #10B981, dark/light theme
- Fonts: Inter + JetBrains Mono
- i18n: DE (default) + EN, messages/*.json, middleware
- Layout: sticky header, DE/EN + dark/light переключатели, footer
- Страницы: главная с секциями-заглушками, /projects/[slug]
- SEO: metadata, OG, sitemap
- Build: 0 ошибок

### Phase 2 — 2.1 Hero секция
- Полностью переработан Hero на главной: сильный above-the-fold, animated headline, gradient акценты, CTA и proof-панель для HR.
- Добавлена ротация ключевых формулировок в заголовке (только transform), staged reveal элементов (только opacity + transform), без blur-анимаций.
- Переписаны тексты Hero в `messages/de.json` и `messages/en.json` по фреймингу немецкого рынка: Eigeninitiative, praktische Projekte, Ausbildungsziel 2026.
- Добавлен блок ценности с конкретикой: 5 демо-проектов, Lighthouse/WCAG-цели, стиль работы.
- Обновлены глобальные стили (`globals.css`): keyframes для hero-reveal, hero-word-cycle, hero-orb-float + `prefers-reduced-motion` fallback.

#### Дизайн-ресёрч (перед реализацией)
- https://brittanychiang.com/ — text-first Hero, чёткий personal value proposition, аккуратная иерархия.
- https://www.nazmul.uk/ (dev.nazmul.co) + Awwwards карточка — сильный headline + секция доказательств/достижений рядом с CTA.
- Awwwards/Dribbble подборки по hero/portfolio — паттерн: минимализм, контрастный gradient-акцент на ключевых словах, быстрые микро-анимации.

- Build: `npm run build` ✅

### Phase 2 — 2.2 Über mich секция
- Создана новая секция `About` как отдельный компонент `src/components/about-section.tsx` с продуманной двухколоночной композицией: слева профиль-карточка с photo-placeholder, справа история, proof-блоки и мотивация.
- Добавлен фрейминг под немецкий рынок: акцент на Eigeninitiative, структуру обучения, product mindset и готовность к Ausbildung 2026.
- Полностью обновлён контент в `messages/de.json` и `messages/en.json`: профессиональные тексты, 4 highlight-карточки, мотивационные тезисы и профильные факты.
- Реализованы scroll-анимации через `IntersectionObserver` в `RevealBlock` (только `opacity + transform`, без blur), плюс `prefers-reduced-motion` fallback.
- Расширены стили в `src/app/globals.css`: `about-reveal-item`, `about-profile-orb`, анимационные переходы с быстрым easing без тяжёлых эффектов.

#### Дизайн-ресёрч (перед реализацией)
- https://www.awwwards.com/websites/portfolio/ — ориентир по минималистичной структуре portfolio-блоков и читаемой иерархии.
- https://dribbble.com/search/portfolio-about-me-section — паттерн карточного представления About Me: фото/аватар + короткий narrative + факты.
- https://www.siteground.com/academy/web-developer-portfolio/ — практический референс: concise About секция, явный CTA, сильный акцент на структуре проектов и ясной подаче.
- https://www.awwwards.com/awwwards/collections/storytelling/ — направление для storytelling-подачи без перегруза анимациями.

- Build: `npm run build` ✅

### Phase 2 — 2.3 Projekte секция
- Сделан новый компонент `src/components/projects-section.tsx` с bento-раскладкой на 5 карточек (12-колоночный responsive grid): на мобиле одна колонка, на планшете/десктопе асимметричная композиция как в современных portfolio кейсах.
- Для каждого проекта добавлены: иконка (уникальные SVG по slug), название, описание, теги, ссылка на `/projects/[slug]`.
- Реализованы hover-микроанимации только на `transform` и `opacity`: лёгкий подъём карточки, смещение стрелки CTA, движение декоративного gradient-orb без blur.
- Интеграция выполнена через `src/app/[locale]/page.tsx`: старая простая секция проектов заменена на `ProjectsSection`, типы вынесены централизованно.
- Добавлен fallback для тегов: если в переводах нет `tags`, компонент берёт данные из `stack` (разделение по `·`), чтобы избежать поломок контента.

#### Дизайн-ресёрч (перед реализацией)
- https://www.awwwards.com/inspiration/givingli-interactive-bento-grid-givingli — референс интерактивной bento-сетки с акцентом на модульность карточек.
- https://www.awwwards.com/inspiration/features-section-bento-grid-artone-studio — паттерн section-level bento с контрастными карточками и чистой иерархией.
- https://dribbble.com/tags/project-cards + https://dribbble.com/search/developer-portfolio — визуальные паттерны карточек проектов: крупный title, короткий summary, теги-чипы, явный CTA.
- https://blog.uxfol.io/ux-portfolio-examples/ — подтверждение подхода «проекты в центре внимания» и акцент на читаемость для рекрутера.

- Build: `npm run build` ✅

### Phase 2 — 2.4 Kenntnisse секция
- Реализован новый компонент `src/components/skills-section.tsx`: интерактивный responsive grid навыков с 4 категориями **Frontend / Backend / Tools / Soft Skills**.
- Для каждой категории добавлены: краткое value-описание, чипы технологий/навыков, индикатор уровня (progress bar) и визуальная иконка категории.
- Scroll-анимации сделаны через `IntersectionObserver`: появление карточек и заполнение прогресс-баров происходят только на `opacity + transform` (без `blur`).
- Добавлены состояния `prefers-reduced-motion`: секция остаётся доступной без лишней анимации и без потери контента.
- Главная страница обновлена: в `src/app/[locale]/page.tsx` простая секция навыков заменена на компонент `SkillsSection`.
- Полностью обновлён контент навыков в `messages/de.json` и `messages/en.json`: тексты под немецкий рынок Ausbildung, более HR-понятные формулировки и акцент на практическую готовность.
- Расширены стили в `src/app/globals.css`: `skills-reveal-item`, `skills-meter-track`, `skills-meter-fill`, `skills-chip` + reduced-motion fallback.

#### Дизайн-ресёрч (перед реализацией)
- https://www.awwwards.com/inspiration/skills-section-portfolio-website-for-frontend-developer-full-stack-and-software-engineer-dev-nazmul-co — паттерн «skills как сильный визуальный блок», где технологии читаются за 3–5 секунд.
- https://dribbble.com/search/skills-section + https://dribbble.com/tags/progress-bar-ui — ориентир по подаче навыков через chips + compact progress визуализацию без перегруза.
- https://www.siteground.com/academy/web-developer-portfolio/ — подтверждение практики: skills-блок должен быть лаконичным, сканируемым и рекрутеро-ориентированным.

- Build: `npm run build` ✅

### Phase 2 — 2.5 Lebenslauf секция
- Реализован новый компонент `src/components/resume-section.tsx`: вертикальный timeline с аккуратной линией прогресса, маркерами этапов и card-based блоками опыта.
- Добавлены scroll-анимации появления этапов через `IntersectionObserver` (только `opacity + transform`), плюс `prefers-reduced-motion` fallback для доступности.
- Главная страница обновлена: в `src/app/[locale]/page.tsx` старая базовая секция `Resume` заменена на новый компонент `ResumeSection`.
- Полностью переработан контент `Resume` в `messages/de.json` и `messages/en.json`: добавлены `eyebrow`, `intro`, более сильные формулировки под HR, фокус-лейблы и чипы компетенций.
- Расширены стили в `src/app/globals.css`: `resume-timeline-wrapper`, `resume-timeline-line`, `resume-item`, `resume-summary`, `resume-chip` + reduced-motion поддержка.

#### Дизайн-ресёрч (перед реализацией)
- https://www.awwwards.com/sites/material-design-resume-cv-portfolio — ориентир по структуре resume-first секции и читаемой визуальной иерархии.
- https://www.awwwards.com/sites/creative-developer-portfolio — референс по подаче личного пути через карточки этапов и минималистичные акценты.
- https://dribbble.com/tags/timeline-ui — паттерны для вертикальной timeline-композиции с маркерами.
- https://dribbble.com/search/portfolio-timeline — подходы к card-based таймлайну и чипам/меткам этапов.

- Build: `npm run build` ✅

### Phase 2 — 2.6 Kontakt секция
- Создан новый компонент `src/components/contact-section.tsx`: двухколоночная контактная секция с card-based direct links + полноценной формой (Name, E-Mail, Nachricht).
- Реализована клиентская валидация формы: обязательные поля, проверка e-mail формата, минимальная длина сообщения, inline ошибки на blur/submit, `aria-invalid` и `aria-describedby` для доступности.
- Добавлен UX-поток отправки без backend: после валидного submit формируется предзаполненный `mailto:`-черновик (subject + structured body), плюс success-state в интерфейсе.
- Интеграция в главную страницу через `ContactSection` в `src/app/[locale]/page.tsx`; старая простая секция Contact удалена.
- Полностью обновлён контент контакта в `messages/de.json` и `messages/en.json` под немецкий HR-контекст: Ausbildung 2026, Praktikum/Probearbeit, быстрая обратная связь.
- Расширены стили в `src/app/globals.css`: `contact-reveal-item`, `contact-link-card`, `contact-field`, `contact-submit`, `contact-status` + reduced-motion fallback.

#### Дизайн-ресёрч (перед реализацией)
- https://www.awwwards.com/websites/contact-page/ + https://www.awwwards.com/awwwards/collections/contact-pages/ — паттерн: контакт-блок как чёткий CTA с коротким копирайтом и быстрым доступом к каналам связи.
- https://dribbble.com/tags/contact_page + https://dribbble.com/tags/contact-form — визуальный паттерн: card-based ссылки, чистая форма с явными label и компактной иерархией.
- https://www.uxpin.com/studio/blog/accessible-form-validation-best-practices/ — best practices для формы: inline/on-blur валидация, связка ошибок с полями через ARIA, понятные actionable error messages.

- Build: `npm run build` ✅

### Phase 3 — 3.1 KI-Bewerbungshelfer
- Полностью реализована рабочая demo-страница проекта `KI-Bewerbungshelfer` на роуте `/projects/ki-bewerbungshelfer` с production-ready UI под HR-аудит.
- Добавлен новый интерактивный компонент `src/components/ki-bewerbungshelfer-demo.tsx`:
  - поле ввода текста вакансии + быстрые пресеты,
  - выбор фокуса (`Frontend`, `Full-Stack`, `Teamfit`, `AI-Produktivität`) и тона письма,
  - выбор персональных сильных сторон,
  - mock AI-генерация Anschreiben со **streaming выводом** посимвольно,
  - кнопка копирования результата,
  - блок "Schnellanalyse" (компания, роль, keywords, аргументационный фокус).
- Реализован локальный анализ вакансии без API: извлечение компании, роли и ключевых требований из текста объявления + адаптация текста письма под выбранный режим.
- Обновлён `src/app/[locale]/projects/[slug]/page.tsx`:
  - условный рендер полноценного demo для `ki-bewerbungshelfer`,
  - улучшенная metadata на основе `Projects.items`,
  - fallback-шаблон для остальных проектов с реальными title/summary из переводов.
- Расширены глобальные стили `src/app/globals.css` для новых микро-интеракций (`ki-option-card`, `ki-stream-caret`, `ki-caret-blink`) с `prefers-reduced-motion` fallback.
- Анимации выполнены строго по правилам: только `transform` и `opacity`, без blur-фильтров.

#### Дизайн-ресёрч (перед реализацией)
- https://dribbble.com/shots/22593955-Writify-AI-Cover-Letter-Generator — референс для двухпанельной структуры "input → generated letter" и фокуса на прикладном сценарии Bewerbungsprozess.
- https://dribbble.com/tags/ai-writing-assistant — паттерны карточек действий, composable-controls и чистой типографики для AI-writing интерфейсов.
- https://www.awwwards.com/inspiration/grammarly-free-online-writing-assistant — ориентир на доверительный writing-tool UX с понятной иерархией и акцентом на читабельность результата.
- https://www.awwwards.com/inspiration/ui-kit-writesonic-ai-writing-tool — идея компактных control-панелей + status-индикаторов для генеративных сценариев.
- https://www.patterns.dev/react/ai-ui-patterns/ — best practices по потоковой выдаче, состояниям генерации и UX-поведению AI-интерфейса в React/Next.js.

- Build: `npm run build` ✅

### Phase 3 — 3.2 Mietpreise-Tracker
- Полностью реализована рабочая demo-страница проекта `Mietpreise-Tracker` на роуте `/projects/mietpreise-tracker` с акцентом на HR-понятный data-product UX.
- Добавлен новый компонент `src/components/mietpreise-tracker-demo.tsx`:
  - интерактивный список городов Германии с выбором, сортировкой (дорогие/доступные) и быстрым сравнением стоимости за м²,
  - визуальный тренд-чарт (2020–2025) для выбранного города + бенчмарк по среднему значению по всем городам,
  - ранжированный bar-рейтинг городов по уровню аренды с анимацией через `transform` (`scaleX`),
  - встроенный калькулятор доступности жилья: размер квартиры, бюджетное правило 30/35/40, 1 или 2 дохода, расчёт Netto/Brutto и рыночного давления.
- Данные проекта сделаны как **реалистичный mock** по 12 городам Германии (München, Frankfurt, Berlin, Hamburg и др.) с трендом по годам и медианным Netto для сравнения.
- Обновлён `src/app/[locale]/projects/[slug]/page.tsx`: добавлен условный рендер полноценного demo-компонента для slug `mietpreise-tracker`.
- Расширены стили `src/app/globals.css`: `rent-city-button`, `rent-pill`, `rent-bar-track`, `rent-bar-fill`, `rent-trend-point` + отдельный `prefers-reduced-motion` fallback.
- Все анимации в новой странице выполнены по правилам: только `opacity` и `transform`, без blur/filter.

#### Дизайн-ресёрч (перед реализацией)
- https://www.awwwards.com/websites/data-visualization/ — общий ориентир по визуальной иерархии data-heavy страниц: KPI сверху, графики в центре, детали ниже.
- https://www.awwwards.com/inspiration/dashboard-assetmetrix — паттерн «чистый analytics dashboard»: карточки-метрики + акцентный график без перегруза.
- https://dribbble.com/tags/rental-dashboard — референсы по rental SaaS-интерфейсам: city-list + chart + finance-summary в одном экране.
- https://dribbble.com/shots/17314583-Real-Estate-Property-Management-Dashboard — идея компактных сравнения-карточек и сканируемых value-блоков.
- https://www.pencilandpaper.io/articles/ux-pattern-analysis-data-dashboards — подтверждение UX-подхода: важные KPI первыми, затем тренд, затем drill-down.
- https://www.realogis.com/insights/rent-price-maps — практический паттерн для недвижимости: региональное сравнение + понятный доступ к средней аренде.

- Build: `npm run build` ✅

### Phase 3 — 3.3 SmartChat
- Полностью реализована рабочая demo-страница проекта `SmartChat` на роуте `/projects/smartchat` с UX-подачей уровня ChatGPT для HR-демонстрации.
- Добавлен новый компонент `src/components/smartchat-demo.tsx`:
  - multi-thread история чатов с быстрым созданием новых диалогов,
  - выбор модели на уровне текущего треда (`GPT-4o`, `Claude Sonnet`, `Llama 3.1`) с разными профилями ответов,
  - потоковая (streaming) выдача mock AI-ответов в реальном времени,
  - markdown rendering (заголовки, списки, цитаты, inline code, fenced code blocks),
  - встроенный code highlighting без тяжёлых библиотек,
  - quick prompts + удобный composer (Enter/Shift+Enter) и кнопка остановки стриминга.
- Реализована генерация реалистичных mock-ответов под тип запроса (код, архитектура, интервью/HR), чтобы демонстрация выглядела как живой продукт, а не статичная заглушка.
- Обновлён `src/app/[locale]/projects/[slug]/page.tsx`: добавлен полноценный рендер demo-компонента для slug `smartchat`.
- Расширены стили `src/app/globals.css` для SmartChat: `smartchat-*` классы для истории, сообщений, markdown, code-блоков, токенов подсветки, typing-индикатора и `prefers-reduced-motion` fallback.
- Все интеракции и микро-анимации выполнены по правилам производительности: только `transform` + `opacity`, без blur/filter.

#### Дизайн-ресёрч (перед реализацией)
- https://www.awwwards.com/inspiration/chat-ui — визуальные паттерны chat-интерфейсов и иерархии сообщений.
- https://dribbble.com/tags/chatgpt + https://dribbble.com/search/chatgpt-ui — референсы для modern AI-chat layout (sidebar history + message canvas + composer).
- https://www.patterns.dev/react/ai-ui-patterns/ — практики по streaming, обработке состояний и компонентной архитектуре AI-интерфейса.
- https://github.com/assistant-ui/assistant-ui — ориентир по production-фичам (auto-scroll, markdown, code highlighting, accessibility).

- Build: `npm run build` ✅

### Phase 3 — 3.4 DevDash
- Полностью реализована рабочая demo-страница проекта `DevDash` на роуте `/projects/devdash`: персональный дашборд разработчика с модульными виджетами и продуманным UX для HR-показа.
- Добавлен новый компонент `src/components/devdash-demo.tsx` с полноценной продуктовой логикой:
  - **Weather widget**: выбор города (Berlin/Hamburg/München), текущие метрики и 4-дневный прогноз,
  - **GitHub Heatmap widget**: вклад по дням, легенда интенсивности, суммарные метрики и streak,
  - **Pomodoro widget**: рабочий таймер (focus/break), пресеты длительности, прогресс-кольцо, счётчик завершённых сессий,
  - **Notes widget**: заметки с локальным сохранением, quick-templates и индикацией последнего сохранения,
  - **News widget**: фильтруемая лента tech-новостей по категориям (Frontend / AI / Career).
- Реализован **drag-and-drop layout** (HTML5 DnD) + mobile fallback через кнопки перемещения вверх/вниз на каждом виджете.
- Добавлена persistence-логика в `localStorage`: сохраняются порядок виджетов, заметки, выбранная focus-длительность и количество завершённых Pomodoro-сессий.
- Усилена PWA-готовность проекта:
  - добавлен `src/app/manifest.ts` (manifest.webmanifest),
  - добавлен `public/sw.js` (service worker с базовым offline cache),
  - добавлен `src/components/pwa-register.tsx` и регистрация SW в `src/app/layout.tsx`,
  - добавлен `public/icon.svg` для иконки приложения,
  - в DevDash реализован PWA status-card с install flow через `beforeinstallprompt`.
- Обновлён `src/app/[locale]/projects/[slug]/page.tsx`: добавлен условный рендер `DevDashDemo` для slug `devdash`.
- Расширены стили `src/app/globals.css`: `devdash-*` классы для drag states, forecast bars, heatmap cells, progress-ring, hover/motion поведения + `prefers-reduced-motion` fallback.
- Все анимации и интеракции соблюдают правило производительности: только `transform` + `opacity`, без blur/filter.

#### Дизайн-ресёрч (перед реализацией)
- https://www.awwwards.com/inspiration/dashboard-blanktm — референс модульной dashboard-композиции и card hierarchy.
- https://dribbble.com/search/drag-and-drop-dashboard — паттерны визуальной подачи drag-and-drop виджетов.
- https://dribbble.com/tags/dashboard_widget — варианты плотной, но читаемой структуры widget-card интерфейсов.
- https://dribbble.com/tags/pomodoro — референсы по компактному таймеру и статусной подаче focus-state.
- https://web.dev/articles/promote-install — best practices in-app PWA install CTA (ненавязчивость, контекстность, dismiss logic).
- https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/How_to/Trigger_install_prompt — технический flow `beforeinstallprompt` / `appinstalled`.
- https://www.eleken.co/blog-posts/drag-and-drop-ui — UX рекомендации по drag affordance, drop-zones и interaction states.
- https://raw.githubusercontent.com/ngduc/dashb/master/README.md — ориентир по набору practical widgets (weather, notes, news, productivity).

- Build: `npm run build` ✅

### Phase 4 — 4.1 Performance audit
- Проведён аудит production-сборки: `npm run build` + `ANALYZE=true npm run build` (сформированы отчёты `.next/analyze/client.html`, `.next/analyze/nodejs.html`, `.next/analyze/edge.html`).
- Переработан переход между страницами без тяжёлой runtime-анимации:
  - `src/app/[locale]/template.tsx` переведён с `framer-motion` на CSS-анимацию `page-enter` (только `opacity + transform`).
- Уменьшены лишние клиентские данные i18n:
  - в `src/app/[locale]/layout.tsx` удалена загрузка `getMessages`,
  - `NextIntlClientProvider` переведён на `messages={null}` (без отправки словарей на клиент, так как client-хуки переводов не используются).
- Снижен сетевой шум на главной:
  - в `src/components/projects-section.tsx` добавлен `prefetch={false}` для тяжёлых demo-роутов `/projects/*`.
- Оптимизирована PWA-регистрация под Core Web Vitals:
  - в `src/components/pwa-register.tsx` регистрация service worker отложена через `requestIdleCallback` (fallback через `setTimeout`).
- Улучшен initial render на главной:
  - добавлен utility-класс `.section-deferred` (`content-visibility: auto; contain-intrinsic-size`),
  - применён к секциям `about/projects/skills/resume/contact`.
- Убрана дорогостоящая графическая операция в sticky-header:
  - в `src/components/site-header.tsx` удалён `backdrop-blur`.
- В `src/app/[locale]/projects/[slug]/page.tsx` демо-компоненты вынесены в `dynamic()` с loading-skeleton для более управляемой загрузки UI.
- Контрольный snapshot сборки после оптимизаций:
  - `/[locale]` — 5.31 kB (First Load JS 113 kB),
  - `/[locale]/projects/[slug]` — 29.5 kB (First Load JS 138 kB),
  - shared First Load JS — 102 kB.

- Build: `npm run build` ✅

## 2026-02-10
### Phase 4 — 4.2 Accessibility audit
- Проведён целевой accessibility-аудит интерфейса под WCAG AA с фокусом на 4 направления: **keyboard navigation, screen reader semantics, contrast, focus states**.
- Усилен foundation-уровень доступности в `src/app/globals.css`:
  - добавлен универсальный `:focus-visible` для ссылок, кнопок, полей и tab-элементов,
  - добавлен `skip-link` (visible on focus) для быстрого перехода к основному контенту,
  - добавлен `prefers-reduced-motion` fallback для `scroll-behavior` (отключение smooth-scroll при reduce).
- В `src/app/[locale]/layout.tsx` добавлен skip-link и фокусируемый anchor-target `#main-content` для клавиатурной навигации.
- Улучшена семантика и SR-ориентиры в навигации:
  - `src/components/site-header.tsx` — `aria-label` для desktop/mobile navigation и home-link,
  - `src/components/site-footer.tsx` — `aria-label` для списка внешних профилей.
- Улучшена доступность языковых/тематических переключателей:
  - `src/components/locale-switcher.tsx` — `role="group"`, локализованные `aria-label`/`title`, сохранён `aria-pressed`,
  - `src/components/theme-toggle.tsx` — локализованные подписи DE/EN, `aria-pressed`, корректные tooltip labels.
- Подтянуты контраст и читаемость акцентных цветов без смены фирменного визуального направления:
  - в `globals.css` введены theme-aware переменные `--primary`, `--primary-solid`, `--accent`,
  - добавлен цвет `primary-solid` для solid CTA-кнопок (`bg-primary-solid`) с надёжным контрастом white text.
- Расширена SR/keyboard-доступность интерактивных demo-компонентов:
  - `mietpreise-tracker-demo.tsx` — `aria-pressed` для ключевых toggle-control (sort/city/household/budget), локализованный `aria-label` для SVG-графика,
  - `smartchat-demo.tsx` — `role="log"` + `aria-live` для message stream, `aria-pressed` на model/thread selectors,
  - `ki-bewerbungshelfer-demo.tsx` — `aria-pressed` для выбора strengths,
  - `devdash-demo.tsx` — `aria-pressed` для weather/pomodoro/news toggles.
- В `src/app/layout.tsx` улучшен runtime-lang signal: язык документа выставляется по URL-сегменту (`/de` | `/en`) в раннем inline-script (помогает screen reader режимам).

#### Дизайн-ресёрч
- Для задачи 4.2 дополнительный visual-дизайн ресёрч не выполнялся: это технический accessibility-аудит существующего UI, а не разработка новой секции/проекта.

- Build: `npm run build` ✅

### Phase 4 — 4.3 SEO + OG images
- Выполнен полноценный SEO-проход по App Router структуре: добавлен общий SEO-helper `src/lib/seo.ts` (base URL, locale-path helpers, Open Graph locale map, safe JSON-LD сериализация).
- Усилен базовый metadata foundation в `src/app/layout.tsx`:
  - расширены `title/description`, keywords, authors/creator/publisher,
  - добавлены `robots` + `googleBot` directives,
  - добавлены fallback Open Graph/Twitter параметры с `summary_large_image`.
- Локализован metadata для главной в `src/app/[locale]/layout.tsx`:
  - корректные canonical + hreflang (`de`/`en`),
  - locale-aware Open Graph/Twitter title/description,
  - locale-aware OG image path (`/opengraph-image` и `/en/opengraph-image`).
- Обновлён metadata для каждой проектной страницы в `src/app/[locale]/projects/[slug]/page.tsx`:
  - индивидуальные title/description,
  - canonical + hreflang для каждого slug,
  - отдельные Open Graph/Twitter карточки с project-specific OG image.
- Добавлены Open Graph image routes:
  - `src/app/[locale]/opengraph-image.tsx` — брендовая OG-карточка портфолио,
  - `src/app/[locale]/projects/[slug]/opengraph-image.tsx` — OG-карточки для каждого проекта (DE/EN copy).
- Добавлены structured data (JSON-LD):
  - на главной (`src/app/[locale]/page.tsx`): `WebSite` + `Person` + `ItemList` проектов,
  - на проектных страницах (`src/app/[locale]/projects/[slug]/page.tsx`): `SoftwareApplication/CreativeWork` + `BreadcrumbList`.
- Добавлен `robots.txt` через `src/app/robots.ts` (allow all + sitemap link + host).
- Проверен production build: `npm run build` ✅

#### Дизайн-ресёрч
- Для задачи 4.3 отдельный visual-дизайн ресёрч не выполнялся: это инфраструктурная SEO/metadata задача, а не новая UI-секция или демо-проект.

- Build: `npm run build` ✅

### Phase 4 — 4.4 Final responsive check (iPhone SE / iPhone 14 / iPad / Desktop)
- Выполнен целевой responsive-pass по ключевым интерактивным страницам и демо-роутам с фокусом на узкие экраны и tablet-layout.
- Внесены адаптации в `src/components/ki-bewerbungshelfer-demo.tsx`:
  - основной layout для input/output переведён на `md` breakpoint,
  - уменьшена минимальная высота output-панели на mobile (`min-h-[300px]`, `sm:min-h-[360px]`),
  - добавлены `break-words` для длинных анализируемых значений (company/role) и stream-output.
- Внесены адаптации в `src/components/mietpreise-tracker-demo.tsx`:
  - основной двухколоночный layout переведён на `md` breakpoint,
  - sort-toggle в блоке городов сделан `w-full` на mobile c `flex-1` кнопками,
  - в рейтинге добавлен `flex-wrap` для правого блока (badge + price), чтобы исключить переполнение.
- Внесены адаптации в `src/components/smartchat-demo.tsx`:
  - layout sidebar/chat переведён на `md`/`lg` responsive-grid,
  - высота message log адаптирована под mobile (`h-[360px]`, `sm:h-[460px]`),
  - send-кнопка сделана full-width на mobile,
  - добавлены `min-w-0`/`break-words` для стабильного поведения контента в узких колонках.
- Внесены адаптации в `src/components/devdash-demo.tsx`:
  - верхний control-grid переведён на `md:grid-cols-3`,
  - 4-day forecast перестроен под mobile (`grid-cols-2`, `sm:grid-cols-4`),
  - улучшено поведение длинных template-chip кнопок (`max-w-full`, `whitespace-normal`, `text-left`),
  - добавлены `min-w-0` и `break-words` для более безопасного рендера widget-card контента.
- В `src/components/site-header.tsx` добавлена mobile-защита для шапки: `truncate`/`max-w` для brand + `shrink-0` для control-группы.
- В `src/app/globals.css` усилено поведение Markdown-текста в SmartChat: `overflow-wrap: anywhere` для paragraph/quote.
- Попытка автоматического screenshot-прохода через Playwright зафиксирована как blocked: в runtime отсутствуют системные browser-библиотеки (`libglib-2.0.so.0` и др.), поэтому PNG-скриншоты сгенерировать не удалось в рамках текущего окружения.
- Проверки качества:
  - Build: `npm run build` ✅
  - Lint: `npm run lint` ✅
