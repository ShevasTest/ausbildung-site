import Image from "next/image";
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
          ? "Datenpflege, Digitalisierung & Automatisierung"
          : "Data maintenance, digitalisation & automation",
      knowsAbout: [
        "Datenpflege",
        "Datenqualität",
        "Automatisierung",
        "Playwright",
        "Python",
        "Next.js",
        "TypeScript",
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
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: structuredData }} />
      <section id="hero" className="relative scroll-mt-32">
        <p className="hero-reveal dim-line" style={{ animationDelay: "0.04s" }}>
          <span className="status-dot" aria-hidden />
          <span>{t("Hero.kicker")}</span>
        </p>

        <div className="mt-6 grid gap-10 lg:grid-cols-[1.25fr_0.75fr] lg:items-start lg:gap-12">
          <div>
            <h1
              className="hero-reveal font-display text-[2.5rem] leading-[1.04] font-semibold tracking-tight text-balance sm:text-6xl lg:text-[4.4rem]"
              style={{ animationDelay: "0.1s" }}
            >
              <span>{t("Hero.titleLead")}</span>
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
              <span className="block">{t("Hero.titleEnd")}</span>
            </h1>

            <p
              className="hero-reveal mt-6 max-w-2xl text-base leading-relaxed text-muted sm:text-lg"
              style={{ animationDelay: "0.18s" }}
            >
              {t("Hero.subtitle")}
            </p>

            <div
              className="hero-reveal mt-8 flex flex-col gap-3 sm:flex-row"
              style={{ animationDelay: "0.26s" }}
            >
              <a
                href="#projects"
                className="inline-flex w-full items-center justify-center rounded-full bg-primary-solid px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:opacity-95 sm:w-auto"
              >
                {t("Hero.ctaProjects")}
              </a>
              <a
                href="#contact"
                className="inline-flex w-full items-center justify-center rounded-full border border-border bg-card px-6 py-3 text-sm font-semibold transition hover:-translate-y-0.5 hover:border-primary hover:text-primary sm:w-auto"
              >
                {t("Hero.ctaContact")}
              </a>
            </div>

            <ul
              className="hero-reveal mt-10 grid max-w-2xl gap-x-8 gap-y-3 sm:grid-cols-2"
              style={{ animationDelay: "0.34s" }}
            >
              {heroPoints.map((point) => (
                <li
                  key={point}
                  className="flex items-start gap-2.5 border-t border-border pt-3 text-sm leading-relaxed text-muted"
                >
                  <span aria-hidden className="mt-[0.5em] h-1.5 w-1.5 shrink-0 rounded-[2px] bg-primary" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>

          <aside
            className="hero-reveal relative overflow-hidden rounded-3xl border border-border bg-card"
            style={{ animationDelay: "0.18s" }}
          >
            <div aria-hidden className="blueprint-grid" style={{ maskImage: "none", WebkitMaskImage: "none", opacity: 0.5 }} />

            <div className="relative p-5 sm:p-6">
              <p className="font-mono text-[11px] font-semibold tracking-[0.16em] text-primary uppercase">
                {t("Hero.panelEyebrow")}
              </p>

              <div className="mt-4 flex items-center gap-4">
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-border bg-background">
                  <Image
                    src="/profile.jpg"
                    alt={t("About.profile.name")}
                    fill
                    className="scale-[1.04] object-cover object-[50%_18%]"
                    sizes="80px"
                    priority
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-lg font-semibold tracking-tight text-foreground">
                    {t("About.profile.name")}
                  </p>
                  <p className="mt-0.5 text-sm leading-snug text-muted">{t("Hero.badge")}</p>
                </div>
              </div>

              <p className="mt-4 text-sm leading-relaxed text-muted">{t("Hero.panelText")}</p>

              <dl className="mt-5 space-y-3 border-t border-border pt-4">
                {heroStats.map((stat) => (
                  <div key={stat.label}>
                    <dt className="font-mono text-[10px] font-medium tracking-[0.14em] text-muted uppercase">
                      {stat.label}
                    </dt>
                    <dd className="mt-0.5 text-sm font-semibold text-foreground">{stat.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
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
        eyebrow={t("Projects.eyebrow")}
        title={t("Projects.title")}
        intro={t("Projects.intro")}
        openProjectLabel={t("Projects.openProject")}
        projects={projects}
      />

      <SkillsSection
        eyebrow={t("Skills.eyebrow")}
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
