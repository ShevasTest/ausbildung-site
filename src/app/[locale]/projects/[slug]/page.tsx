import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import {
  absoluteUrl,
  localeToLanguageTag,
  localeToOpenGraphLocale,
  localizedPath,
  normalizeLocale,
  siteConfig,
  toJsonLd,
} from "@/lib/seo";

const projectSlugs = [
  "ki-bewerbungshelfer",
  "mietpreise-tracker",
  "smartchat",
  "devdash",
  "portfolio",
] as const;

type ProjectPageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

type ProjectTranslationItem = {
  slug: string;
  title: string;
  summary: string;
  stack?: string;
};

type DemoProps = {
  locale: string;
};

function ProjectDemoLoading() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <section className="overflow-hidden rounded-3xl border border-border bg-card p-6 sm:p-8">
        <div className="h-3 w-28 animate-pulse rounded-full bg-border/80" />
        <div className="mt-5 h-9 w-2/3 animate-pulse rounded-xl bg-border/80" />
        <div className="mt-3 h-4 w-full animate-pulse rounded-md bg-border/70" />
        <div className="mt-2 h-4 w-11/12 animate-pulse rounded-md bg-border/70" />
        <div className="mt-7 h-64 animate-pulse rounded-2xl border border-border bg-background/70" />
      </section>
    </main>
  );
}

const KIBewerbungshelferDemo = dynamic<DemoProps>(
  () => import("@/components/ki-bewerbungshelfer-demo").then((module) => module.KIBewerbungshelferDemo),
  {
    loading: ProjectDemoLoading,
  },
);

const MietpreiseTrackerDemo = dynamic<DemoProps>(
  () => import("@/components/mietpreise-tracker-demo").then((module) => module.MietpreiseTrackerDemo),
  {
    loading: ProjectDemoLoading,
  },
);

const SmartChatDemo = dynamic<DemoProps>(
  () => import("@/components/smartchat-demo").then((module) => module.SmartChatDemo),
  {
    loading: ProjectDemoLoading,
  },
);

const DevDashDemo = dynamic<DemoProps>(
  () => import("@/components/devdash-demo").then((module) => module.DevDashDemo),
  {
    loading: ProjectDemoLoading,
  },
);

function formatSlugTitle(slug: string) {
  return slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function generateStaticParams() {
  return projectSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: ProjectPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const safeLocale = normalizeLocale(locale);
  const t = await getTranslations({ locale: safeLocale });
  const metaT = await getTranslations({ locale: safeLocale, namespace: "Meta" });

  const projects = t.raw("Projects.items") as ProjectTranslationItem[];
  const project = projects.find((item) => item.slug === slug);

  const title = project?.title ?? metaT("projectTitle", { slug });
  const description = project?.summary ?? metaT("projectDescription");
  const canonicalPath = localizedPath(safeLocale, `/projects/${slug}`);
  const imagePath = localizedPath(safeLocale, `/projects/${slug}/opengraph-image`);

  return {
    title,
    description,
    alternates: {
      canonical: canonicalPath,
      languages: {
        de: `/projects/${slug}`,
        en: `/en/projects/${slug}`,
      },
    },
    openGraph: {
      type: "article",
      siteName: siteConfig.siteName,
      title,
      description,
      locale: localeToOpenGraphLocale(safeLocale),
      url: canonicalPath,
      images: [
        {
          url: imagePath,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imagePath],
    },
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { locale, slug } = await params;
  const safeLocale = normalizeLocale(locale);

  if (!projectSlugs.includes(slug as (typeof projectSlugs)[number])) {
    notFound();
  }

  const t = await getTranslations({ locale: safeLocale });
  const projects = t.raw("Projects.items") as ProjectTranslationItem[];
  const project = projects.find((item) => item.slug === slug);

  const title = project?.title ?? formatSlugTitle(slug);
  const summary = project?.summary ?? "";
  const stackKeywords = project?.stack
    ?.split("·")
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);

  const homeUrl = absoluteUrl(localizedPath(safeLocale, "/"));
  const projectsUrl = `${homeUrl}#projects`;
  const projectUrl = absoluteUrl(localizedPath(safeLocale, `/projects/${slug}`));

  const projectStructuredData = {
    "@context": "https://schema.org",
    "@type": slug === "portfolio" ? "CreativeWork" : "SoftwareApplication",
    name: title,
    description: summary,
    url: projectUrl,
    inLanguage: localeToLanguageTag(safeLocale),
    author: {
      "@type": "Person",
      name: siteConfig.authorName,
      url: homeUrl,
    },
    isPartOf: {
      "@type": "WebSite",
      name: siteConfig.siteName,
      url: homeUrl,
    },
    ...(stackKeywords && stackKeywords.length > 0 ? { keywords: stackKeywords } : {}),
    ...(slug !== "portfolio"
      ? {
          applicationCategory: "DeveloperApplication",
          operatingSystem: "Web",
        }
      : {}),
  };

  const breadcrumbStructuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: safeLocale === "de" ? "Startseite" : "Home",
        item: homeUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: safeLocale === "de" ? "Projekte" : "Projects",
        item: projectsUrl,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: title,
        item: projectUrl,
      },
    ],
  };

  const structuredData = toJsonLd([projectStructuredData, breadcrumbStructuredData]);

  if (slug === "ki-bewerbungshelfer") {
    return (
      <>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: structuredData }} />
        <KIBewerbungshelferDemo locale={safeLocale} />
      </>
    );
  }

  if (slug === "mietpreise-tracker") {
    return (
      <>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: structuredData }} />
        <MietpreiseTrackerDemo locale={safeLocale} />
      </>
    );
  }

  if (slug === "smartchat") {
    return (
      <>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: structuredData }} />
        <SmartChatDemo locale={safeLocale} />
      </>
    );
  }

  if (slug === "devdash") {
    return (
      <>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: structuredData }} />
        <DevDashDemo locale={safeLocale} />
      </>
    );
  }

  const projectPageT = await getTranslations({ locale: safeLocale, namespace: "ProjectPage" });
  const fallbackSummary = project?.summary ?? projectPageT("description");

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: structuredData }} />
      <main className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="rounded-3xl border border-border bg-card p-6 sm:p-10">
          <span className="inline-flex rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
            {projectPageT("badge")}
          </span>

          <h1 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>

          <p className="mt-4 max-w-2xl leading-relaxed text-muted">{fallbackSummary}</p>

          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
            {projectPageT("description")}
          </p>

          <Link
            href="/#projects"
            className="mt-8 inline-flex rounded-full border border-border px-4 py-2 text-sm font-semibold transition hover:border-primary hover:text-primary"
          >
            ← {projectPageT("back")}
          </Link>
        </div>
      </main>
    </>
  );
}
