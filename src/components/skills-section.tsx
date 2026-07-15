import { SectionHeader } from "@/components/section-header";

export type SkillGroup = {
  name: string;
  description: string;
  level: number;
  levelLabel: string;
  items: string[];
};

type SkillsSectionProps = {
  eyebrow?: string;
  title: string;
  intro: string;
  legend: string;
  groups: SkillGroup[];
};

const LED_SEGMENTS = 12;

export function SkillsSection({ eyebrow, title, intro, legend, groups }: SkillsSectionProps) {
  return (
    <section id="skills" className="section-deferred scroll-mt-28 py-14 sm:py-24">
      <SectionHeader eyebrow={eyebrow} title={title} intro={intro} />

      <p className="mt-4 max-w-3xl font-mono text-[11px] leading-relaxed font-medium tracking-[0.12em] text-muted uppercase">
        {legend}
      </p>

      <div className="mt-10 overflow-hidden rounded-3xl border border-border bg-card">
        {groups.map((group, index) => {
          const safeLevel = Number.isFinite(group.level)
            ? Math.min(100, Math.max(0, group.level))
            : 0;
          const items = Array.isArray(group.items) ? group.items : [];
          const litSegments = Math.round((safeLevel / 100) * LED_SEGMENTS);

          return (
            <article
              key={group.name}
              className={`grid gap-5 p-5 transition-colors hover:bg-background/50 sm:p-7 lg:grid-cols-[auto_1fr_1fr] lg:gap-10 ${
                index > 0 ? "border-t border-border" : ""
              }`}
            >
              <span
                aria-hidden
                className="font-display hidden text-2xl leading-none font-semibold text-border lg:block lg:w-12"
              >
                {String(index + 1).padStart(2, "0")}
              </span>

              <div>
                <h3 className="text-lg leading-tight font-semibold tracking-tight text-balance text-foreground sm:text-xl">
                  {group.name}
                </h3>
                <p className="mt-2 max-w-md text-sm leading-relaxed text-muted">{group.description}</p>

                <div className="mt-4 max-w-md">
                  <div
                    role="progressbar"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={safeLevel}
                    aria-label={`${group.name}: ${safeLevel}%`}
                    className="led-meter"
                  >
                    {Array.from({ length: LED_SEGMENTS }).map((_, segment) => (
                      <span
                        key={segment}
                        className={`led-seg ${
                          segment < litSegments
                            ? segment === litSegments - 1
                              ? "is-on is-edge"
                              : "is-on"
                            : ""
                        }`}
                      />
                    ))}
                  </div>
                  <div className="mt-2 flex items-baseline justify-between gap-3">
                    <p className="text-xs leading-relaxed text-muted">{group.levelLabel}</p>
                    <span className="font-mono text-xs font-semibold text-foreground">{safeLevel}%</span>
                  </div>
                </div>
              </div>

              <ul className="flex flex-wrap content-start gap-2 lg:justify-end">
                {items.map((item) => (
                  <li key={`${group.name}-${item}`}>
                    <span className="skills-chip inline-flex rounded-full border border-border bg-background/75 px-2.5 py-1 text-xs font-medium text-muted">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </article>
          );
        })}
      </div>
    </section>
  );
}
