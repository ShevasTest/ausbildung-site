"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

export type SkillGroup = {
  name: string;
  description: string;
  level: number;
  levelLabel: string;
  items: string[];
};

type SkillsSectionProps = {
  title: string;
  intro: string;
  legend: string;
  groups: SkillGroup[];
};

type MeterStyle = CSSProperties & Record<"--skill-scale", string>;

const CARD_ACCENTS = [
  "from-primary/24 via-primary/10 to-transparent",
  "from-accent/24 via-primary/8 to-transparent",
  "from-primary/20 via-accent/12 to-transparent",
  "from-accent/18 via-primary/10 to-transparent",
] as const;

const CATEGORY_ICONS: ReactNode[] = [
  <svg key="frontend" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
    <path d="M4.75 6.75A2.75 2.75 0 0 1 7.5 4h9a2.75 2.75 0 0 1 2.75 2.75v10.5A2.75 2.75 0 0 1 16.5 20h-9a2.75 2.75 0 0 1-2.75-2.75z" />
    <path d="M8.25 9.5h7.5M8.25 12h7.5M8.25 14.5h4.5" strokeLinecap="round" />
  </svg>,
  <svg key="backend" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
    <rect x="4.75" y="5" width="14.5" height="4.5" rx="1.2" />
    <rect x="4.75" y="10.75" width="14.5" height="4.5" rx="1.2" />
    <rect x="4.75" y="16.5" width="14.5" height="2.5" rx="1.2" />
    <path d="M8 7.2h.01M8 13h.01M8 17.7h.01" strokeLinecap="round" />
  </svg>,
  <svg key="tools" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
    <path d="m9.75 4.75 1.5 1.5-4.5 4.5a2.25 2.25 0 0 0 3.18 3.18l4.5-4.5 1.5 1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="m14.25 8.25 3.5-3.5 1.5 1.5-3.5 3.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="m11.5 12.5 5.75 5.75a1.5 1.5 0 0 1-2.12 2.12l-5.75-5.75" strokeLinecap="round" strokeLinejoin="round" />
  </svg>,
  <svg key="soft" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
    <path d="M12 20.25s-6.75-3.7-6.75-9a4 4 0 0 1 7-2.62A4 4 0 0 1 19.25 11.25c0 5.3-7.25 9-7.25 9z" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M9.25 12.1c.7.95 1.3 1.42 2.1 2.05 1.25-1.2 2.05-2.1 3.5-4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>,
];

export function SkillsSection({ title, intro, legend, groups }: SkillsSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const handleMotionChange = () => {
      setPrefersReducedMotion(motionQuery.matches);
    };

    const attachMotionListener = () => {
      if (typeof motionQuery.addEventListener === "function") {
        motionQuery.addEventListener("change", handleMotionChange);
      } else {
        motionQuery.addListener(handleMotionChange);
      }
    };

    const detachMotionListener = () => {
      if (typeof motionQuery.removeEventListener === "function") {
        motionQuery.removeEventListener("change", handleMotionChange);
      } else {
        motionQuery.removeListener(handleMotionChange);
      }
    };

    handleMotionChange();
    attachMotionListener();

    if (motionQuery.matches) {
      setIsVisible(true);
      return () => {
        detachMotionListener();
      };
    }

    const node = sectionRef.current;
    if (!node) {
      return () => {
        detachMotionListener();
      };
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (!entry?.isIntersecting) {
          return;
        }

        setIsVisible(true);
        observer.unobserve(node);
      },
      {
        threshold: 0.22,
        rootMargin: "0px 0px -12% 0px",
      },
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
      detachMotionListener();
    };
  }, []);

  const shouldAnimateIn = isVisible || prefersReducedMotion;

  return (
    <section ref={sectionRef} id="skills" className="section-deferred scroll-mt-28 py-14 sm:py-20">
      <div className="max-w-3xl">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h2>
        <p className="mt-4 leading-relaxed text-muted">{intro}</p>
      </div>

      <p className="mt-4 text-xs font-medium tracking-wide text-muted uppercase">{legend}</p>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {groups.map((group, index) => {
          const safeLevel = Number.isFinite(group.level)
            ? Math.min(100, Math.max(0, group.level))
            : 0;
          const fillScale = safeLevel / 100;
          const cardVisibleClass = shouldAnimateIn ? "is-visible" : "";
          const items = Array.isArray(group.items) ? group.items : [];
          const meterStyle: MeterStyle = {
            transitionDelay: `${170 + index * 70}ms`,
            "--skill-scale": fillScale.toString(),
          };

          return (
            <article
              key={group.name}
              className={`skills-reveal-item group relative overflow-hidden rounded-3xl border border-border bg-card p-5 transition-[transform,border-color,background-color] duration-200 hover:-translate-y-0.5 hover:border-primary/35 sm:p-6 ${cardVisibleClass}`}
              style={{ transitionDelay: `${70 + index * 70}ms` }}
            >
              <div
                aria-hidden
                className={`skills-card-orb absolute -top-14 -right-12 h-40 w-40 rounded-full bg-gradient-to-br ${CARD_ACCENTS[index % CARD_ACCENTS.length]} transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1`}
              />

              <div className="relative flex h-full flex-col">
                <div className="flex items-start justify-between gap-3">
                  <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
                    <span className="h-5 w-5">{CATEGORY_ICONS[index % CATEGORY_ICONS.length]}</span>
                  </span>

                  <span className="inline-flex rounded-full border border-border bg-background/80 px-2.5 py-1 font-mono text-[11px] font-medium tracking-wide text-muted">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>

                <h3 className="mt-5 text-lg font-semibold tracking-tight text-foreground">{group.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{group.description}</p>

                <div className="mt-5">
                  <div className="flex items-end justify-between gap-3">
                    <p className="text-xs leading-relaxed text-muted">{group.levelLabel}</p>
                    <span className="font-mono text-xs font-semibold text-foreground">{safeLevel}%</span>
                  </div>

                  <div
                    role="progressbar"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={safeLevel}
                    aria-label={`${group.name}: ${safeLevel}%`}
                    className="skills-meter-track mt-2"
                  >
                    <span
                      className={`skills-meter-fill ${cardVisibleClass}`}
                      style={meterStyle}
                    />
                  </div>
                </div>

                <ul className="mt-5 flex flex-wrap gap-2">
                  {items.map((item) => (
                    <li key={`${group.name}-${item}`}>
                      <span className="skills-chip inline-flex rounded-full border border-border bg-background/75 px-2.5 py-1 text-xs font-medium text-muted">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
