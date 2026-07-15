import { SectionHeader } from "@/components/section-header";

export type ResumeTimelineEntry = {
  period: string;
  title: string;
  text: string;
  focus?: string;
  chips?: string[];
};

type ResumeSectionProps = {
  eyebrow: string;
  title: string;
  intro: string;
  timeline: ResumeTimelineEntry[];
  closingTitle: string;
  closingText: string;
  closingBadges: string[];
};

export function ResumeSection({
  eyebrow,
  title,
  intro,
  timeline,
  closingTitle,
  closingText,
  closingBadges,
}: ResumeSectionProps) {
  return (
    <section id="resume" className="section-deferred scroll-mt-28 py-12 sm:py-20">
      <SectionHeader eyebrow={eyebrow} title={title} intro={intro} />

      <div className="resume-timeline-wrapper mt-8 sm:mt-10">
        <div aria-hidden className="resume-timeline-line" />

        <ol className="space-y-4 sm:space-y-5">
          {timeline.map((entry) => {
            const chips = Array.isArray(entry.chips) ? entry.chips : [];

            return (
              <li key={`${entry.period}-${entry.title}`} className="resume-item pl-5 sm:pl-7">
                <span aria-hidden className="resume-item-marker">
                  <span className="resume-item-marker-core" />
                </span>

                <article className="group rounded-3xl border border-border bg-card p-4 transition-[transform,border-color] duration-200 hover:-translate-y-0.5 hover:border-primary/35 sm:p-6">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <p className="font-mono text-[11px] font-semibold tracking-[0.1em] text-accent uppercase">
                      {entry.period}
                    </p>

                    {entry.focus ? (
                      <span className="inline-flex rounded-full border border-border bg-background/80 px-2.5 py-1 text-[11px] font-medium text-muted">
                        {entry.focus}
                      </span>
                    ) : null}
                  </div>

                  <h3 className="mt-3 text-base leading-tight font-semibold tracking-tight text-balance text-foreground sm:text-lg">
                    {entry.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{entry.text}</p>

                  {chips.length > 0 ? (
                    <ul className="mt-4 flex flex-wrap gap-2">
                      {chips.map((chip) => (
                        <li key={`${entry.title}-${chip}`}>
                          <span className="resume-chip inline-flex rounded-full border border-border bg-background/75 px-2.5 py-1 text-xs font-medium text-muted">
                            {chip}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </article>
              </li>
            );
          })}
        </ol>
      </div>

      <article className="mt-6 rounded-3xl border border-border bg-card p-4 sm:mt-7 sm:p-6">
        <h3 className="text-base font-semibold tracking-tight text-foreground">{closingTitle}</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted">{closingText}</p>

        {closingBadges.length > 0 ? (
          <ul className="mt-4 flex flex-wrap gap-2">
            {closingBadges.map((badge) => (
              <li key={badge}>
                <span className="resume-chip inline-flex rounded-full border border-primary/25 bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                  {badge}
                </span>
              </li>
            ))}
          </ul>
        ) : null}
      </article>
    </section>
  );
}
