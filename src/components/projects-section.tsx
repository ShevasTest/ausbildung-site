import type { ReactNode } from "react";
import { Link } from "@/i18n/navigation";

export type ProjectItem = {
  slug: string;
  title: string;
  summary: string;
  tags?: string[];
  stack?: string;
};

type ProjectsSectionProps = {
  title: string;
  intro: string;
  openProjectLabel: string;
  projects: ProjectItem[];
};

type ProjectVisual = {
  layout: string;
  orbClassName: string;
  icon: ReactNode;
};

const DEFAULT_VISUAL: ProjectVisual = {
  layout: "md:col-span-6",
  orbClassName: "from-primary/24 via-primary/10 to-transparent",
  icon: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
      <path d="M4.75 6.75A2.75 2.75 0 0 1 7.5 4h9a2.75 2.75 0 0 1 2.75 2.75v10.5A2.75 2.75 0 0 1 16.5 20h-9a2.75 2.75 0 0 1-2.75-2.75z" />
      <path d="M8.25 9.5h7.5M8.25 12h7.5M8.25 14.5h4.25" strokeLinecap="round" />
    </svg>
  ),
};

const PROJECT_VISUALS: Record<string, ProjectVisual> = {
  "ki-bewerbungshelfer": {
    layout: "md:col-span-7",
    orbClassName: "from-primary/26 via-accent/12 to-transparent",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
        <path d="M7.5 3.75h7.2l4.55 4.5v11A2.75 2.75 0 0 1 16.5 22h-9A2.75 2.75 0 0 1 4.75 19.25V6.5A2.75 2.75 0 0 1 7.5 3.75z" />
        <path d="M14.75 3.75v3.5a1 1 0 0 0 1 1H19" />
        <path d="M8.75 13h6.5M8.75 16h4.25" strokeLinecap="round" />
        <path d="m8 9.4.6 1.2 1.3.2-.95.93.22 1.32L8 12.46l-1.17.59.22-1.32-.95-.93 1.31-.2Z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  "mietpreise-tracker": {
    layout: "md:col-span-5",
    orbClassName: "from-accent/24 via-primary/10 to-transparent",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
        <path d="M4.75 19.25h14.5M7.5 16.75v-5.5M12 16.75V8.25M16.5 16.75v-3.5" strokeLinecap="round" />
        <path d="M5.75 9.75 9.6 6.9a1.1 1.1 0 0 1 1.2-.12l2.4 1.3a1.1 1.1 0 0 0 1.18-.08l3.87-2.95" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  smartchat: {
    layout: "md:col-span-5",
    orbClassName: "from-primary/24 via-accent/8 to-transparent",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
        <path d="M4.75 7.75A2.75 2.75 0 0 1 7.5 5h9A2.75 2.75 0 0 1 19.25 7.75v5.5A2.75 2.75 0 0 1 16.5 16h-6.6l-3.65 2.9v-2.9A2.75 2.75 0 0 1 4.75 13.25z" strokeLinejoin="round" />
        <path d="M8.25 9.5h7.5M8.25 12h5" strokeLinecap="round" />
      </svg>
    ),
  },
  devdash: {
    layout: "md:col-span-7",
    orbClassName: "from-accent/22 via-primary/8 to-transparent",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
        <rect x="4.75" y="4.75" width="6.75" height="6.75" rx="1.4" />
        <rect x="12.5" y="4.75" width="6.75" height="4.5" rx="1.4" />
        <rect x="12.5" y="10.25" width="6.75" height="8.5" rx="1.4" />
        <rect x="4.75" y="12.5" width="6.75" height="6.25" rx="1.4" />
      </svg>
    ),
  },
  portfolio: {
    layout: "md:col-span-12",
    orbClassName: "from-primary/28 via-accent/10 to-transparent",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
        <path d="M3.75 8.25A2.75 2.75 0 0 1 6.5 5.5h3.65a2 2 0 0 1 1.3.48l1.02.87a2 2 0 0 0 1.3.48h3.73a2.75 2.75 0 0 1 2.75 2.75v7.17A2.75 2.75 0 0 1 17.5 20h-11A2.75 2.75 0 0 1 3.75 17.25z" />
        <path d="M8.25 12h7.5M8.25 14.8h4.75" strokeLinecap="round" />
      </svg>
    ),
  },
};

function resolveTags(project: ProjectItem) {
  if (project.tags && project.tags.length > 0) {
    return project.tags;
  }

  if (!project.stack) {
    return [];
  }

  return project.stack
    .split("·")
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0);
}

export function ProjectsSection({ title, intro, openProjectLabel, projects }: ProjectsSectionProps) {
  return (
    <section id="projects" className="section-deferred scroll-mt-28 py-14 sm:py-20">
      <div className="max-w-3xl">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h2>
        <p className="mt-4 leading-relaxed text-muted">{intro}</p>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-12">
        {projects.map((project, index) => {
          const visual = PROJECT_VISUALS[project.slug] ?? DEFAULT_VISUAL;
          const tags = resolveTags(project);

          return (
            <article
              key={project.slug}
              className={`group relative overflow-hidden rounded-3xl border border-border bg-card p-5 transition-[transform,border-color,background-color] duration-200 hover:-translate-y-0.5 hover:border-primary/40 sm:p-6 ${visual.layout}`}
            >
              <div
                aria-hidden
                className={`pointer-events-none absolute -top-16 -right-14 h-44 w-44 rounded-full bg-gradient-to-br ${visual.orbClassName} transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1`}
              />

              <div className="relative flex h-full flex-col">
                <div className="flex items-start justify-between gap-4">
                  <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
                    <span className="h-5 w-5">{visual.icon}</span>
                  </span>

                  <span className="inline-flex rounded-full border border-border bg-background/75 px-2.5 py-1 font-mono text-[11px] font-medium tracking-wide text-muted">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>

                <h3 className="mt-5 text-lg font-semibold tracking-tight text-foreground sm:text-xl">
                  {project.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">{project.summary}</p>

                {tags.length > 0 ? (
                  <ul className="mt-5 flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <li
                        key={`${project.slug}-${tag}`}
                        className="rounded-full border border-border bg-background/80 px-2.5 py-1 text-xs font-medium text-muted"
                      >
                        {tag}
                      </li>
                    ))}
                  </ul>
                ) : null}

                <Link
                  href={`/projects/${project.slug}`}
                  prefetch={false}
                  className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary transition group-hover:translate-x-1"
                >
                  <span>{openProjectLabel}</span>
                  <span aria-hidden>→</span>
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
