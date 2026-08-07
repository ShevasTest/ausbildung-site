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
        ? "IT-Support & Anwenderbetreuung"
        : "IT Support & End-User Services",
      knowsAbout: [
        "IT support",
        "Windows client administration",
        "Hardware and device deployment",
        "Networking fundamentals",
        "Technical documentation",
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
              ? "Offen für IT-Support und Anwenderbetreuung · Großraum München · vor Ort"
              : "Open to IT support and end-user roles · Munich area · on site"}
          </p>
          <h1 className="hero-name">Oleksandr Shevchenko</h1>
          <p className="hero-role">
            {isDe
              ? "IT-Support · Windows & Microsoft 365 · Geräte und Netzwerk"
              : "IT support · Windows & Microsoft 365 · devices and networking"}
          </p>
          <p className="hero-specialty">
            {isDe
              ? "Arbeitsplätze einrichten · Fehler eingrenzen · Anwender betreuen"
              : "Setting up workplaces · isolating faults · supporting users"}
          </p>
          <p className="hero-lead">
            {isDe
              ? "Als Assistent des Systemadministrators habe ich ein komplettes Büro technisch in Betrieb genommen: Arbeitsplätze, Server, Switches, Netzwerkverkabelung, USV-Anlagen und Drucker. Windows habe ich auf sämtlichen Rechnern installiert und eingerichtet und die fertigen Arbeitsplätze übergeben. Seitdem baue und betreibe ich täglich eigene technische Projekte — die Fehlersuche ist dabei zur Routine geworden: eingrenzen, Ursache finden, Lösung dokumentieren, Betrieb wiederherstellen. Mit Microsoft Entra ID auf Administrationsebene habe ich bisher wenig gearbeitet; darauf bereite ich mich gerade gezielt vor."
              : "As a system administrator's assistant I brought a complete office online: workstations, servers, switches, network cabling, UPS units and printers. I installed and configured Windows on every machine and handed over ready-to-work setups. Since then I have built and operated my own technical projects daily — troubleshooting has become routine: isolate, find the cause, document the fix, restore service. I have not worked much with Microsoft Entra ID at administration level; that is what I am deliberately preparing for right now."}
          </p>

          <div className="hero-actions">
            <NextLink href="#featured-project" className="button button-primary">
              {isDe ? "Projekte ansehen" : "View projects"}
            </NextLink>
            <NextLink href="#resume" className="button button-secondary">
              {isDe ? "Werdegang" : "Background"}
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
          <p className="portfolio-eyebrow">{isDe ? "Eigene Werkzeuge" : "My own tools"}</p>
          <h2>{isDe ? "Selbst gebaut. Selbst am Laufen gehalten." : "Built by me. Kept running by me."}</h2>
          <p>
            {isDe
              ? "Diese Projekte sind kein Support-Nachweis — sie zeigen etwas anderes: dass ich technische Systeme selbst aufsetze, betreibe und wieder zum Laufen bringe, wenn sie kaputtgehen. Genau das unterscheidet guten Support vom reinen Abarbeiten von Tickets. Jede Demo kann direkt im Browser ausprobiert werden."
              : "These projects are not proof of support experience — they show something else: that I set up, operate and repair technical systems myself when they break. That is what separates good support from merely working through tickets. Every demo can be tried directly in the browser."}
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
            <p className="project-index">01 / {String(projects.length).padStart(2, "0")}</p>
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
            <p className="portfolio-eyebrow">{isDe ? "Werdegang" : "Background"}</p>
            <h2>{isDe ? "Vom Büro-Aufbau zur täglichen Technikpraxis." : "From building an office to daily technical practice."}</h2>
            <p>
              {isDe
              ? "Ein praktischer Einstieg in die Büro-IT, ein anerkannter Abschluss und drei Jahre tägliche technische Praxis — mit einem ehrlichen Blick auf Stärken und Wissensgrenzen."
              : "A hands-on entry into office IT, a recognised degree and three years of daily technical practice — with an honest view of strengths and knowledge boundaries."}
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
                ? "Ich nehme Technik ab. Und erkläre sie ohne Fachbegriffe."
                : "I take the technology off your hands. And explain it without jargon."}
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
            ? "Ich bin offen für Rollen im IT-Support und in der Anwenderbetreuung — vor Ort im Großraum München."
            : "I am open to IT support and end-user roles — on site in the Munich area."}
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
