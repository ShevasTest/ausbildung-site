import Image from "next/image";
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
      sameAs: [siteConfig.githubUrl, siteConfig.linkedInUrl],
      jobTitle: isDe
        ? "Test Automation Engineer · Playwright & Automatisierung"
        : "Test Automation Engineer · Playwright & Automation",
      knowsAbout: [
        "Web test automation",
        "Playwright",
        "Browser automation",
        "API testing",
        "CI/CD",
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
              ? "Offen für QA- & Testautomatisierungs-Stellen · Raum München"
              : "Open to QA & test automation roles · Munich area"}
          </p>
          <h1 className="hero-name">Oleksandr Shevchenko</h1>
          <p className="hero-role">
            {isDe
              ? "Test Automation Engineer — Playwright & TypeScript"
              : "Test Automation Engineer — Playwright & TypeScript"}
          </p>
          <p className="hero-specialty">
            {isDe
              ? "E2E-Testing · Browser-Automatisierung · CI/CD"
              : "E2E testing · Browser automation · CI/CD"}
          </p>
          <p className="hero-lead">
            {isDe
              ? "Seit rund vier Jahren baue ich täglich Browser-Automatisierung mit Playwright — in einem Maßstab, in dem ein instabiles Skript direkt Geld kostet. Dieses Zuverlässigkeitsdenken bringe ich jetzt in die professionelle Web-Testautomatisierung: Meine öffentliche E2E-Suite testet genau diese Website in der CI."
              : "For around four years, I have built browser automation with Playwright every day — at a scale where an unstable script directly costs money. Now I bring that reliability mindset into professional web test automation: my public e2e suite tests this very website in CI."}
          </p>

          <div className="hero-actions">
            <a href="#projects" className="button button-primary">
              {isDe ? "Projekte ansehen" : "View projects"}
            </a>
            <a href="#resume" className="button button-secondary">
              {isDe ? "Lebenslauf" : "Resume"}
            </a>
          </div>
        </div>

        <div className="hero-portrait-wrap hero-enter hero-enter-late">
          <div className="hero-portrait-accent" aria-hidden />
          <Image
            src="/profile-hero.png"
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
              ? "Vier öffentlich zugängliche Demos aus mehr als 20 eigenen Projekten — und eine öffentliche Playwright-Testsuite auf GitHub, die genau diese Website mit über 45 automatisierten Checks in der CI prüft, auf Desktop und Mobile. Jede Demo kann direkt im Browser ausprobiert werden."
              : "Four public demos selected from more than 20 personal projects — plus a public Playwright test suite on GitHub that runs 45+ automated checks against this very website in CI, on desktop and mobile. Every demo can be tried directly in the browser."}
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

        <article className="featured-project" data-reveal>
          <Link
            href={`/projects/${featuredProject.slug}`}
            className="featured-project-visual"
            aria-label={`${featuredProject.title} – ${isDe ? "Projekt ansehen" : "View project"}`}
            prefetch={false}
          >
            <Image
              src="/projects/ki-bewerbungshelfer.png"
              alt={`${featuredProject.title} – ${isDe ? "Projektansicht" : "project preview"}`}
              fill
              className="project-screenshot"
              sizes="(max-width: 900px) 100vw, 64vw"
            />
          </Link>
          <div className="featured-project-copy">
            <p className="project-index">01 / 04</p>
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
              ? "Vier Jahre tägliche Automatisierungspraxis — mehr als 20 Projekte, über 100 Skripte und seit 2026 eine öffentliche E2E-Suite in der CI. Mit einem ehrlichen Blick auf Stärken und Wissensgrenzen."
              : "Four years of daily automation practice — more than 20 projects, over 100 scripts and, since 2026, a public e2e suite in CI. With an honest view of strengths and knowledge boundaries."}
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
            ? "Ich bin offen für QA- und Testautomatisierungs-Stellen, Probearbeit oder ein erstes technisches Kennenlerngespräch."
            : "I am open to QA and test automation roles, trial work or an initial technical conversation."}
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
