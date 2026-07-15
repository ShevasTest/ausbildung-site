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
        ? "Junior Developer · KI-Agenten & Automatisierung"
        : "Junior Developer · AI Agents & Automation",
      knowsAbout: [
        "AI-assisted software development",
        "AI agent orchestration",
        "Workflow automation",
        "API integration",
        "Frontend fundamentals",
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
            {isDe ? "Offen für Junior-Stellen · deutschlandweit" : "Open to junior roles · Germany-wide"}
          </p>
          <h1 className="hero-name">Oleksandr Shevchenko</h1>
          <p className="hero-role">
            {isDe
              ? "Junior Developer mit KI-gestütztem Workflow"
              : "Junior Developer with an AI-assisted workflow"}
          </p>
          <p className="hero-specialty">
            {isDe
              ? "KI-Agenten · Automatisierung · Webentwicklung"
              : "AI agents · Automation · Web development"}
          </p>
          <p className="hero-lead">
            {isDe
              ? "Seit rund vier Jahren setze ich täglich eigene Software-, Skript- und Automatisierungsprojekte mit KI um. Ich suche eine Junior- oder Entry-Level-Stelle, in der ich diese Umsetzungskraft in ein professionelles Team einbringe und meine technischen Grundlagen systematisch vertiefe."
              : "For around four years, I have built personal software, scripting and automation projects with AI every day. I am looking for a junior or entry-level role where I can bring this delivery ability into a professional team and deepen my technical foundations systematically."}
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
              ? "Vier öffentlich zugängliche Demos aus mehr als 20 eigenen Projekten. Keine Konzeptbilder: Jede Demo kann direkt im Browser ausprobiert werden."
              : "Four public demos selected from more than 20 personal projects. No concept-only visuals: every demo can be tried directly in the browser."}
          </p>
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
              ? "Vier Jahre tägliche Umsetzungspraxis — mit mehr als 20 Projekten, über 100 Skripten und einem ehrlichen Blick auf Stärken und Wissensgrenzen."
              : "Four years of daily delivery practice — with more than 20 projects, over 100 scripts and an honest view of strengths and knowledge boundaries."}
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
            ? "Ich bin offen für Junior- und Entry-Level-Stellen, Praktika, Probearbeit oder ein erstes technisches Kennenlerngespräch."
            : "I am open to junior and entry-level roles, internships, trial work or an initial technical conversation."}
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
