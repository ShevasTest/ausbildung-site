import Image from "next/image";
import NextLink from "next/link";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { RevealOnScroll } from "@/components/reveal-on-scroll";
import type { ProjectItem } from "@/components/projects-section";
import type { ResumeTimelineEntry } from "@/components/resume-section";
import type { SkillGroup } from "@/components/skills-section";
import {
  absoluteUrl,
  localeToLanguageTag,
  localizedPath,
  normalizeLocale,
  siteConfig,
  toJsonLd,
} from "@/lib/seo";

type HomePageProps = {
  params: Promise<{ locale: string }>;
};

type QuickLink = {
  label: string;
  value: string;
  href: string;
};

function projectTags(project: ProjectItem) {
  return (project.tags ?? project.stack?.split("·") ?? []).map((tag) => tag.trim()).filter(Boolean);
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  const safeLocale = normalizeLocale(locale);
  const isDe = safeLocale === "de";
  const projects = t.raw("Projects.items") as ProjectItem[];
  const timeline = t.raw("Resume.timeline") as ResumeTimelineEntry[];
  const skills = t.raw("Skills.groups") as SkillGroup[];
  const quickLinks = t.raw("Contact.quickLinks") as QuickLink[];
  const aboutParagraphs = t.raw("About.paragraphs") as string[];
  const featuredProject = projects[0];
  const homeUrl = absoluteUrl(localizedPath(safeLocale, "/"));

  const structuredData = toJsonLd([
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: siteConfig.siteName,
      url: homeUrl,
      inLanguage: localeToLanguageTag(safeLocale),
    },
    {
      "@context": "https://schema.org",
      "@type": "Person",
      name: siteConfig.authorName,
      url: homeUrl,
      email: `mailto:${siteConfig.email}`,
      sameAs: [siteConfig.githubUrl, siteConfig.linkedInUrl, "https://t.me/Shevas_o"],
      jobTitle: isDe
        ? "Daten- & KI-Engineering (KI-gestützt)"
        : "Data & AI Engineering (AI-assisted)",
      knowsAbout: [
        "Data engineering",
        "Data cleaning",
        "Retrieval-augmented generation",
        "AI agents",
        "Automation",
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: isDe ? "Projekte" : "Projects",
      itemListElement: projects.map((project, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: project.title,
        url: absoluteUrl(localizedPath(safeLocale, `/projects/${project.slug}`)),
      })),
    },
  ]);

  return (
    <main>
      <RevealOnScroll />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: structuredData }} />

      <section id="hero" className="portfolio-shell hero-section scroll-mt-24">
        <div className="hero-copy hero-enter">
          <p className="portfolio-eyebrow">
            {isDe
              ? "Offen für Junior-Rollen in Daten- und KI-Engineering · remote oder in Bayern"
              : "Open to junior roles in data and AI engineering · remote or in Bavaria"}
          </p>
          <h1 className="hero-name">Oleksandr Shevchenko</h1>
          <p className="hero-role">
            {isDe
              ? "Daten & Pipelines · KI-Agenten · KI-gestützt"
              : "Data & pipelines · AI agents · AI-assisted"}
          </p>
          <p className="hero-specialty">
            {isDe
              ? "Datenaufbereitung · RAG & Retrieval · Automatisierung · Python"
              : "Data preparation · RAG & retrieval · automation · Python"}
          </p>
          <p className="hero-lead">
            {isDe
              ? "Seit rund drei Jahren arbeite ich täglich mit Daten, die verschmutzt sind, sich ständig ändern und trotzdem verarbeitet werden müssen. Daraus ist eine Arbeitsweise geworden: messen, bevor ich etwas behaupte, und umbauen, wenn die Messung schlecht ausfällt. Mein Kernprojekt ist mono-api-agent — ein RAG-Agent über eine offizielle OpenAPI-Spezifikation, an einem Tag entstanden und an diesem Tag zweimal überarbeitet, weil die Messwerte es verlangten. Modelle in Produktion trainiert habe ich nicht — das ist der Bereich, in dem ich lernen will."
              : "For about three years I have worked daily with data that is dirty, constantly changing and still has to be processed. That turned into a working method: measure before claiming anything, and rebuild when the measurement comes back bad. My core project is mono-api-agent — a RAG agent over an official OpenAPI specification, built in one day and rewritten twice that same day because the numbers demanded it. I have not trained models in production — that is the area I want to learn."}
          </p>

          <div className="hero-actions">
            <NextLink href="#featured-project" className="button button-primary">
              {isDe ? "Projekte ansehen" : "View projects"}
            </NextLink>
            <NextLink href="#resume" className="button button-secondary">
              {isDe ? "Lebenslauf" : "Resume"}
            </NextLink>
          </div>
        </div>

        <div className="hero-portrait-wrap hero-enter hero-enter-late">
          <div className="hero-portrait-accent" aria-hidden />
          <Image
            src="/profile-hero.jpg"
            alt={isDe ? "Porträt von Oleksandr Shevchenko" : "Portrait of Oleksandr Shevchenko"}
            fill
            priority
            className="hero-portrait"
            sizes="(max-width: 767px) 92vw, 42vw"
          />
        </div>
      </section>

      <section id="projects" className="portfolio-shell portfolio-section render-deferred scroll-mt-24">
        <div className="section-intro" data-reveal>
          <p className="portfolio-eyebrow">{isDe ? "Ausgewählte Projekte" : "Selected projects"}</p>
          <h2>{isDe ? "Praktische Projekte. Klarer Fokus." : "Practical projects. Clear focus."}</h2>
          <p>
            {isDe
              ? "Das Kernprojekt: eine öffentliche Playwright-Testsuite, die genau diese Website in der CI prüft — 56 Checks auf Desktop und Mobile. Dazu vier Produkt-Demos aus mehr als 20 eigenen Projekten; jede Demo kann direkt im Browser ausprobiert werden."
              : "The flagship: a public Playwright test suite that checks this very website in CI — 56 checks across desktop and mobile. Alongside it, four product demos from more than 20 personal projects; every demo can be tried directly in the browser."}
          </p>
          <a
            href="https://github.com/ShevasTest/portfolio-e2e-tests"
            target="_blank"
            rel="noreferrer"
            className="text-link"
          >
            {isDe ? "Test-Suite auf GitHub ansehen" : "View the test suite on GitHub"}
          </a>
        </div>

        <article id="featured-project" className="featured-project scroll-mt-24" data-reveal>
          <Link
            href={`/projects/${featuredProject.slug}`}
            className="featured-project-visual"
            aria-label={`${featuredProject.title} – ${isDe ? "Projekt ansehen" : "View project"}`}
            prefetch={false}
          >
            <Image
              src={`/projects/${featuredProject.slug}.png`}
              alt={`${featuredProject.title} – ${isDe ? "Projektansicht" : "project preview"}`}
              fill
              className="project-screenshot"
              sizes="(max-width: 900px) 100vw, 64vw"
            />
          </Link>
          <div className="featured-project-copy">
            <p className="project-index">01 / 05</p>
            <h3>{featuredProject.title}</h3>
            <p>{featuredProject.summary}</p>
            <ul className="tag-list" aria-label={isDe ? "Technologien" : "Technologies"}>
              {projectTags(featuredProject).map((tag) => (
                <li key={tag}>{tag}</li>
              ))}
            </ul>
            <Link href={`/projects/${featuredProject.slug}`} className="text-link" prefetch={false}>
              {isDe ? "Projekt ansehen" : "View project"}
            </Link>
          </div>
        </article>

        <div className="project-list" data-reveal>
          {projects.slice(1).map((project, index) => (
            <Link
              key={project.slug}
              href={`/projects/${project.slug}`}
              prefetch={false}
              className="project-row"
            >
              <span className="project-row-index">0{index + 2}</span>
              <span className="project-row-title">{project.title}</span>
              <span className="project-row-summary">{project.summary}</span>
              <span className="project-row-action">{isDe ? "Ansehen" : "View"}</span>
            </Link>
          ))}
        </div>
      </section>

      <section id="resume" className="portfolio-section portfolio-section-muted render-deferred scroll-mt-24">
        <div className="portfolio-shell split-section">
          <div className="section-intro section-intro-sticky" data-reveal>
            <p className="portfolio-eyebrow">{isDe ? "Praxis & Entwicklung" : "Practice & growth"}</p>
            <h2>{isDe ? "Vom Selbststudium zu produktiven Systemen." : "From self-study to working systems."}</h2>
            <p>
              {isDe
              ? "Drei Jahre tägliche Automatisierungspraxis — mehr als 20 Projekte, über 100 Skripte und seit 2026 eine öffentliche E2E-Suite in der CI. Mit einem ehrlichen Blick auf Stärken und Wissensgrenzen."
              : "Three years of daily automation practice — more than 20 projects, over 100 scripts and, since 2026, a public e2e suite in CI. With an honest view of strengths and knowledge boundaries."}
            </p>
          </div>

          <ol className="timeline-clean" data-reveal>
            {timeline.map((entry) => (
              <li key={`${entry.period}-${entry.title}`}>
                <p className="timeline-period">{entry.period}</p>
                <h3>{entry.title}</h3>
                <p>{entry.text}</p>
                {entry.focus ? <span>{entry.focus}</span> : null}
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="about" className="portfolio-shell portfolio-section render-deferred scroll-mt-24">
        <div className="about-grid">
          <div className="section-intro" data-reveal>
            <p className="portfolio-eyebrow">{isDe ? "Über mich" : "About me"}</p>
            <h2>
              {isDe
                ? "Ich steuere KI. Ich übernehme Verantwortung für das Ergebnis."
                : "I orchestrate AI. I take responsibility for the result."}
            </h2>
          </div>
          <div className="about-copy" data-reveal>
            <p>{aboutParagraphs[0]}</p>
            <p>{aboutParagraphs[1]}</p>
            <p>{aboutParagraphs[2]}</p>
          </div>
        </div>

        <div id="skills" className="skills-grid" data-reveal>
          {skills.map((group) => (
            <article key={group.name}>
              <h3>{group.name}</h3>
              <p>{group.items.join(" · ")}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="contact" className="portfolio-shell contact-section scroll-mt-24" data-reveal>
        <p className="portfolio-eyebrow">{isDe ? "Kontakt" : "Contact"}</p>
        <h2>{isDe ? "Lernen wir uns kennen." : "Let’s get to know each other."}</h2>
        <p>
          {isDe
            ? "Ich bin offen für Junior-Rollen in Daten- und KI-Engineering oder ein erstes technisches Kennenlerngespräch."
            : "I am open to junior roles in data and AI engineering or an initial technical conversation."}
        </p>
        <a className="contact-email" href={`mailto:${siteConfig.email}`}>
          {siteConfig.email}
        </a>
        <div className="contact-links">
          {quickLinks
            .filter((link) => !link.href.startsWith("mailto:"))
            .map((link) => (
              <a key={link.label} href={link.href} target="_blank" rel="noreferrer">
                {link.label}
              </a>
            ))}
        </div>
      </section>
    </main>
  );
}
