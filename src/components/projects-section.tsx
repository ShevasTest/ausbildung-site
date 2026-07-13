import type { ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import { SectionHeader } from "@/components/section-header";

export type ProjectItem = {
  slug: string;
  title: string;
  summary: string;
  tags?: string[];
  stack?: string;
};

type ProjectsSectionProps = {
  eyebrow?: string;
  title: string;
  intro: string;
  openProjectLabel: string;
  projects: ProjectItem[];
};

type ProjectVisual = {
  layout: string;
  preview: ReactNode;
};

function ChatPreview() {
  return (
    <div className="flex h-full flex-col justify-center gap-2 px-5">
      <div className="h-2.5 w-3/5 rounded-full bg-primary/25" />
      <div className="h-2.5 w-2/5 rounded-full bg-primary/25" />
      <div className="ml-auto h-2.5 w-1/2 rounded-full bg-primary/60" />
      <div className="mt-2 flex items-center gap-2">
        <div className="h-6 flex-1 rounded-lg border border-border bg-card/80" />
        <div className="h-6 w-6 rounded-lg bg-primary/70" />
      </div>
    </div>
  );
}

function BarsPreview() {
  return (
    <div className="flex h-full items-end justify-center gap-2.5 px-6 pb-4">
      {[0.45, 0.7, 0.55, 0.9, 0.62, 0.78].map((height, index) => (
        <div
          key={index}
          className={`w-4 rounded-t ${index === 3 ? "bg-accent/80" : "bg-primary/45"}`}
          style={{ height: `${height * 100}%` }}
        />
      ))}
    </div>
  );
}

function DocumentPreview() {
  return (
    <div className="flex h-full items-center justify-center gap-4 px-5">
      <div className="flex h-4/5 w-1/3 flex-col gap-1.5 rounded-lg border border-border bg-card/80 p-2.5">
        <div className="h-1.5 w-full rounded-full bg-muted/30" />
        <div className="h-1.5 w-4/5 rounded-full bg-muted/30" />
        <div className="h-1.5 w-full rounded-full bg-muted/30" />
        <div className="h-1.5 w-3/5 rounded-full bg-muted/30" />
      </div>
      <div className="text-primary" aria-hidden>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-5 w-5">
          <path d="M4 12h14M13 6.5 18.5 12 13 17.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <div className="flex h-4/5 w-1/3 flex-col gap-1.5 rounded-lg border border-primary/30 bg-primary/10 p-2.5">
        <div className="h-1.5 w-full rounded-full bg-primary/45" />
        <div className="h-1.5 w-5/6 rounded-full bg-primary/45" />
        <div className="h-1.5 w-full rounded-full bg-primary/45" />
        <div className="h-1.5 w-2/3 rounded-full bg-primary/45" />
      </div>
    </div>
  );
}

function WidgetsPreview() {
  return (
    <div className="grid h-full grid-cols-3 gap-2 px-6 py-4">
      <div className="rounded-lg border border-border bg-card/80 p-2">
        <div className="h-1.5 w-3/4 rounded-full bg-muted/35" />
        <div className="mt-1.5 h-3 w-1/2 rounded bg-primary/45" />
      </div>
      <div className="rounded-lg border border-border bg-card/80 p-2">
        <div className="mx-auto mt-0.5 h-6 w-6 rounded-full border-2 border-primary/50" />
      </div>
      <div className="rounded-lg border border-border bg-card/80 p-2">
        <div className="flex h-full items-end gap-1">
          <div className="h-2/5 w-2 rounded-t bg-primary/40" />
          <div className="h-3/5 w-2 rounded-t bg-primary/55" />
          <div className="h-4/5 w-2 rounded-t bg-accent/70" />
        </div>
      </div>
      <div className="col-span-3 flex items-center gap-1.5 rounded-lg border border-border bg-card/80 px-2.5">
        {Array.from({ length: 14 }).map((_, index) => (
          <span
            key={index}
            className={`h-2 w-2 rounded-[3px] ${
              [2, 5, 6, 9, 12].includes(index)
                ? "bg-primary/70"
                : [3, 10].includes(index)
                  ? "bg-primary/35"
                  : "bg-muted/20"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

function BrowserPreview() {
  return (
    <div className="flex h-full items-center justify-center px-6">
      <div className="h-4/5 w-full max-w-sm overflow-hidden rounded-lg border border-border bg-card/80">
        <div className="flex items-center gap-1 border-b border-border px-2.5 py-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-muted/40" />
          <span className="h-1.5 w-1.5 rounded-full bg-muted/40" />
          <span className="h-1.5 w-1.5 rounded-full bg-accent/70" />
          <span className="ml-2 h-1.5 flex-1 rounded-full bg-muted/20" />
        </div>
        <div className="flex gap-2 p-2.5">
          <div className="flex-1 space-y-1.5">
            <div className="h-2 w-4/5 rounded-full bg-primary/50" />
            <div className="h-1.5 w-full rounded-full bg-muted/25" />
            <div className="h-1.5 w-3/4 rounded-full bg-muted/25" />
          </div>
          <div className="h-10 w-14 rounded border border-primary/25 bg-primary/10" />
        </div>
      </div>
    </div>
  );
}

const DEFAULT_VISUAL: ProjectVisual = {
  layout: "md:col-span-6",
  preview: <BrowserPreview />,
};

const PROJECT_VISUALS: Record<string, ProjectVisual> = {
  "ki-bewerbungshelfer": {
    layout: "md:col-span-7",
    preview: <DocumentPreview />,
  },
  "mietpreise-tracker": {
    layout: "md:col-span-5",
    preview: <BarsPreview />,
  },
  smartchat: {
    layout: "md:col-span-5",
    preview: <ChatPreview />,
  },
  devdash: {
    layout: "md:col-span-7",
    preview: <WidgetsPreview />,
  },
  portfolio: {
    layout: "md:col-span-12",
    preview: <BrowserPreview />,
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

export function ProjectsSection({
  eyebrow,
  title,
  intro,
  openProjectLabel,
  projects,
}: ProjectsSectionProps) {
  return (
    <section id="projects" className="section-deferred scroll-mt-28 py-12 sm:py-20">
      <SectionHeader eyebrow={eyebrow} title={title} intro={intro} />

      <div className="mt-8 grid gap-4 md:grid-cols-12">
        {projects.map((project, index) => {
          const visual = PROJECT_VISUALS[project.slug] ?? DEFAULT_VISUAL;
          const tags = resolveTags(project);

          return (
            <article
              key={project.slug}
              className={`tick-card reveal group relative flex flex-col rounded-3xl border border-border bg-card transition-[transform,border-color,background-color] duration-200 hover:-translate-y-0.5 hover:border-primary/40 ${visual.layout}`}
            >
              <div className="relative m-2 h-36 overflow-hidden rounded-2xl border border-border/70 bg-background/60 sm:m-2.5">
                <div aria-hidden className="blueprint-grid" style={{ maskImage: "none" }} />
                <div className="relative h-full transition-transform duration-300 group-hover:scale-[1.02]">
                  {visual.preview}
                </div>
              </div>

              <div className="flex flex-1 flex-col p-4 pt-2 sm:p-6 sm:pt-3">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-lg leading-tight font-semibold tracking-tight text-balance text-foreground sm:text-xl">
                    <Link
                      href={`/projects/${project.slug}`}
                      prefetch={false}
                      className="after:absolute after:inset-0 after:rounded-3xl focus-visible:outline-none"
                    >
                      {project.title}
                    </Link>
                  </h3>

                  <span className="inline-flex shrink-0 rounded-full border border-border bg-background/75 px-2.5 py-1 font-mono text-[11px] font-medium tracking-wide text-muted">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>

                <p className="mt-3 text-sm leading-relaxed text-muted">{project.summary}</p>

                {tags.length > 0 ? (
                  <ul className="mt-5 flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <li
                        key={`${project.slug}-${tag}`}
                        className="rounded-full border border-border bg-background/80 px-2.5 py-1 font-mono text-[11px] font-medium text-muted"
                      >
                        {tag}
                      </li>
                    ))}
                  </ul>
                ) : null}

                <p
                  aria-hidden
                  className="mt-auto inline-flex items-center gap-2 pt-5 text-sm font-semibold text-primary transition group-hover:translate-x-1"
                >
                  <span>{openProjectLabel}</span>
                  <span>→</span>
                </p>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
