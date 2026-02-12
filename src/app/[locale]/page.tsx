import { getTranslations } from "next-intl/server";
import { AboutSection, type AboutHighlight } from "@/components/about-section";
import { ProjectsSection, type ProjectItem } from "@/components/projects-section";
import { SkillsSection, type SkillGroup } from "@/components/skills-section";
import { ResumeSection, type ResumeTimelineEntry } from "@/components/resume-section";
import {
  ContactSection,
  type ContactFormCopy,
  type ContactQuickLink,
  type ContactSubmitCopy,
  type ContactValidationCopy,
} from "@/components/contact-section";
import {
  absoluteUrl,
  localeToLanguageTag,
  localizedPath,
  normalizeLocale,
  siteConfig,
  toJsonLd,
} from "@/lib/seo";

type HeroStat = {
  label: string;
  value: string;
};

type HomePageProps = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale });

  const projects = t.raw("Projects.items") as ProjectItem[];
  const skillGroups = t.raw("Skills.groups") as SkillGroup[];
  const timeline = t.raw("Resume.timeline") as ResumeTimelineEntry[];
  const resumeClosingBadges = t.raw("Resume.closingBadges") as string[];
  const aboutParagraphs = t.raw("About.paragraphs") as string[];
  const aboutHighlights = t.raw("About.highlights") as AboutHighlight[];
  const aboutMotivationPoints = t.raw("About.motivationPoints") as string[];
  const aboutProfileFacts = t.raw("About.profile.facts") as string[];
  const heroWordsRaw = t.raw("Hero.rotatingWords") as string[];
  const heroWords =
    heroWordsRaw.length > 0
      ? heroWordsRaw
      : ["fast web apps", "accessible UI", "clean architecture", "real impact"];
  const heroPoints = t.raw("Hero.points") as string[];
  const heroStats = t.raw("Hero.stats") as HeroStat[];
  const contactQuickLinks = t.raw("Contact.quickLinks") as ContactQuickLink[];
  const contactAvailabilityBadges = t.raw("Contact.availability.badges") as string[];
  const contactFormCopy = t.raw("Contact.form") as ContactFormCopy;
  const contactSubmitCopy = t.raw("Contact.submit") as ContactSubmitCopy;
  const contactValidationCopy = t.raw("Contact.validation") as ContactValidationCopy;

  const safeLocale = normalizeLocale(locale);
  const homePath = localizedPath(safeLocale, "/");
  const homeUrl = absoluteUrl(homePath);

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
      jobTitle:
        safeLocale === "de"
          ? "Angehender Fachinformatiker für Anwendungsentwicklung"
          : "Aspiring Software Developer (Fachinformatiker AE)",
      knowsAbout: [
        "Next.js",
        "React",
        "TypeScript",
        "Frontend Performance",
        "Accessibility",
      ],
      address: {
        "@type": "PostalAddress",
        addressCountry: "DE",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: safeLocale === "de" ? "Projektübersicht" : "Project overview",
      itemListElement: projects.map((project, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: project.title,
        description: project.summary,
        url: absoluteUrl(localizedPath(safeLocale, `/projects/${project.slug}`)),
      })),
    },
  ]);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: structuredData }} />
      <section
        id="hero"
        className="hero-section relative scroll-mt-32 overflow-hidden rounded-3xl border border-border bg-card"
      >
        <div aria-hidden className="hero-orb hero-orb-primary" />
        <div aria-hidden className="hero-orb hero-orb-accent" />

        <div className="relative grid gap-10 p-6 sm:p-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div className="space-y-6">
            <span
              className="hero-reveal inline-flex rounded-full border border-primary/35 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary"
              style={{ animationDelay: "0.04s" }}
            >
              {t("Hero.badge")}
            </span>

            <p
              className="hero-reveal text-xs font-semibold tracking-[0.16em] text-accent uppercase"
              style={{ animationDelay: "0.1s" }}
            >
              {t("Hero.kicker")}
            </p>

            <h1
              className="hero-reveal text-3xl font-semibold tracking-tight text-balance sm:text-4xl lg:text-5xl"
              style={{ animationDelay: "0.16s" }}
            >
              <span>{t("Hero.titleLead")}</span>{" "}
              <span className="hero-word-window" aria-hidden>
                <span className="hero-word-track">
                  {heroWords.map((word) => (
                    <span key={word} className="hero-word">
                      {word}
                    </span>
                  ))}
                  <span className="hero-word">{heroWords[0]}</span>
                </span>
              </span>
              <span className="sr-only">{heroWords.join(", ")}</span>
              <span className="mt-2 block">{t("Hero.titleEnd")}</span>
            </h1>

            <p
              className="hero-reveal max-w-2xl text-base leading-relaxed text-muted sm:text-lg"
              style={{ animationDelay: "0.22s" }}
            >
              {t("Hero.subtitle")}
            </p>

            <ul
              className="hero-reveal grid max-w-2xl gap-2 sm:grid-cols-2"
              style={{ animationDelay: "0.28s" }}
            >
              {heroPoints.map((point) => (
                <li key={point} className="flex items-start gap-2.5 text-sm text-muted">
                  <span
                    aria-hidden
                    className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/15 text-xs font-bold text-accent"
                  >
                    ✓
                  </span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>

            <div
              className="hero-reveal flex flex-col gap-3 sm:flex-row"
              style={{ animationDelay: "0.34s" }}
            >
              <a
                href="#projects"
                className="inline-flex items-center justify-center rounded-full bg-primary-solid px-5 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:opacity-95"
              >
                {t("Hero.ctaProjects")}
              </a>
              <a
                href="#contact"
                className="inline-flex items-center justify-center rounded-full border border-border bg-card px-5 py-2.5 text-sm font-semibold transition hover:-translate-y-0.5 hover:border-primary hover:text-primary"
              >
                {t("Hero.ctaContact")}
              </a>
            </div>
          </div>

          <aside
            className="hero-reveal rounded-2xl border border-border bg-background/80 p-6 shadow-[0_14px_35px_rgba(10,10,15,0.16)]"
            style={{ animationDelay: "0.22s" }}
          >
            <p className="text-xs font-semibold tracking-[0.16em] text-primary uppercase">
              {t("Hero.panelEyebrow")}
            </p>
            <h2 className="mt-2 text-xl font-semibold tracking-tight text-balance sm:text-2xl">
              {t("Hero.panelTitle")}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">{t("Hero.panelText")}</p>

            <dl className="mt-6 grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              {heroStats.map((stat) => (
                <div key={stat.label} className="rounded-xl border border-border/90 bg-card/85 p-3">
                  <dt className="text-xs font-medium tracking-wide text-muted uppercase">
                    {stat.label}
                  </dt>
                  <dd className="mt-1 text-sm font-semibold text-foreground">{stat.value}</dd>
                </div>
              ))}
            </dl>
          </aside>
        </div>
      </section>

      <AboutSection
        eyebrow={t("About.eyebrow")}
        title={t("About.title")}
        lead={t("About.lead")}
        paragraphs={aboutParagraphs}
        highlights={aboutHighlights}
        motivationTitle={t("About.motivationTitle")}
        motivationPoints={aboutMotivationPoints}
        profileBadge={t("About.profile.badge")}
        profileName={t("About.profile.name")}
        profileRole={t("About.profile.role")}
        profileCaption={t("About.profile.caption")}
        profileFacts={aboutProfileFacts}
      />

      <ProjectsSection
        title={t("Projects.title")}
        intro={t("Projects.intro")}
        openProjectLabel={t("Projects.openProject")}
        projects={projects}
      />

      <SkillsSection
        title={t("Skills.title")}
        intro={t("Skills.intro")}
        legend={t("Skills.legend")}
        groups={skillGroups}
      />

      <ResumeSection
        eyebrow={t("Resume.eyebrow")}
        title={t("Resume.title")}
        intro={t("Resume.intro")}
        timeline={timeline}
        closingTitle={t("Resume.closingTitle")}
        closingText={t("Resume.closingText")}
        closingBadges={resumeClosingBadges}
      />

      <ContactSection
        eyebrow={t("Contact.eyebrow")}
        title={t("Contact.title")}
        intro={t("Contact.intro")}
        linksTitle={t("Contact.linksTitle")}
        linksIntro={t("Contact.linksIntro")}
        quickLinks={contactQuickLinks}
        availabilityTitle={t("Contact.availability.title")}
        availabilityText={t("Contact.availability.text")}
        availabilityBadges={contactAvailabilityBadges}
        formCopy={contactFormCopy}
        submitCopy={contactSubmitCopy}
        validationCopy={contactValidationCopy}
        mailSubject={t("Contact.mailSubject")}
        emailAddress={t("Contact.email")}
      />
    </main>
  );
}
