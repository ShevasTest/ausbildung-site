import { SectionHeader } from "@/components/section-header";

export type AboutHighlight = {
  label: string;
  value: string;
};

type AboutSectionProps = {
  eyebrow: string;
  title: string;
  lead: string;
  paragraphs: string[];
  highlights: AboutHighlight[];
  motivationTitle: string;
  motivationPoints: string[];
  profileBadge: string;
  profileName: string;
  profileRole: string;
  profileCaption: string;
  profileFacts: string[];
};

function splitFact(fact: string): { label: string; value: string } | null {
  const separator = fact.indexOf(":");
  if (separator === -1) {
    return null;
  }

  return {
    label: fact.slice(0, separator).trim(),
    value: fact.slice(separator + 1).trim(),
  };
}

export function AboutSection({
  eyebrow,
  title,
  lead,
  paragraphs,
  highlights,
  motivationTitle,
  motivationPoints,
  profileBadge,
  profileName,
  profileRole,
  profileCaption,
  profileFacts,
}: AboutSectionProps) {
  return (
    <section id="about" className="section-deferred scroll-mt-28 py-14 sm:py-24">
      <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-start lg:gap-12">
        <div>
          <SectionHeader eyebrow={eyebrow} title={title} />

          <p className="mt-6 max-w-3xl font-display text-xl leading-snug font-medium tracking-tight text-foreground sm:text-2xl">
            {lead}
          </p>

          <div className="mt-6 max-w-3xl space-y-4">
            {paragraphs.map((paragraph, index) => (
              <p
                key={`${index}-${paragraph.slice(0, 24)}`}
                className="text-[0.98rem] leading-relaxed text-muted sm:text-base"
              >
                {paragraph}
              </p>
            ))}
          </div>

          <dl className="mt-10 grid gap-x-8 gap-y-4 sm:grid-cols-2">
            {highlights.map((highlight, index) => (
              <div key={`${highlight.label}-${index}`} className="border-t border-border pt-4">
                <dt className="font-mono text-[11px] font-semibold tracking-[0.14em] text-primary uppercase">
                  {highlight.label}
                </dt>
                <dd className="mt-2 text-sm leading-relaxed text-foreground">{highlight.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="space-y-4 lg:sticky lg:top-24">
          <article className="rounded-3xl border border-border bg-card p-5 sm:p-7">
            <p className="dim-line">
              <span className="dim-line-rule" aria-hidden />
              <span>{profileBadge}</span>
            </p>

            <p className="mt-4 text-lg font-semibold tracking-tight text-foreground">{profileName}</p>
            <p className="mt-0.5 text-sm leading-relaxed text-muted">{profileRole}</p>

            <dl className="mt-5 space-y-3 border-t border-border pt-5">
              {profileFacts.map((fact) => {
                const parts = splitFact(fact);

                if (!parts) {
                  return (
                    <div key={fact} className="text-sm leading-relaxed text-muted">
                      {fact}
                    </div>
                  );
                }

                return (
                  <div key={fact} className="spec-row text-sm">
                    <dt className="shrink-0 font-mono text-[11px] font-medium tracking-[0.08em] text-muted uppercase">
                      {parts.label}
                    </dt>
                    <span className="spec-dots" aria-hidden />
                    <dd className="max-w-[60%] text-right leading-snug font-medium text-foreground">
                      {parts.value}
                    </dd>
                  </div>
                );
              })}
            </dl>

            <p className="mt-5 border-t border-border pt-5 text-sm leading-relaxed text-muted">
              {profileCaption}
            </p>
          </article>

          <article className="about-motivation-card rounded-3xl border border-primary/20 bg-primary/5 p-5 sm:p-7">
            <h3 className="about-motivation-title text-base font-semibold tracking-tight text-balance text-foreground sm:text-lg">
              {motivationTitle}
            </h3>

            <ul className="about-motivation-list mt-4 space-y-3">
              {motivationPoints.map((point) => (
                <li
                  key={point}
                  className="about-motivation-item flex items-start gap-2.5 text-sm leading-relaxed text-muted"
                >
                  <span
                    aria-hidden
                    className="about-motivation-icon mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary"
                  >
                    →
                  </span>
                  <span className="about-motivation-text">{point}</span>
                </li>
              ))}
            </ul>
          </article>
        </div>
      </div>
    </section>
  );
}
