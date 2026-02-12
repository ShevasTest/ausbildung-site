"use client";

import { useEffect, useRef, useState } from "react";

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
        threshold: 0.18,
        rootMargin: "0px 0px -10% 0px",
      },
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
      detachMotionListener();
    };
  }, []);

  const shouldReveal = isVisible || prefersReducedMotion;

  return (
    <section ref={sectionRef} id="resume" className="section-deferred scroll-mt-28 py-12 sm:py-20">
      <div className="max-w-3xl">
        <p className="text-xs font-semibold tracking-[0.16em] text-accent uppercase">{eyebrow}</p>
        <h2 className="mt-3 text-2xl leading-tight font-semibold tracking-tight text-balance sm:text-3xl">{title}</h2>
        <p className="mt-4 text-[0.98rem] leading-relaxed text-muted sm:text-base">{intro}</p>
      </div>

      <div className="resume-timeline-wrapper mt-8 sm:mt-10">
        <div aria-hidden className="resume-timeline-line" />

        <ol className="space-y-4 sm:space-y-5">
          {timeline.map((entry, index) => {
            const chips = Array.isArray(entry.chips) ? entry.chips : [];
            const visibilityClass = shouldReveal ? "is-visible" : "";

            return (
              <li
                key={`${entry.period}-${entry.title}`}
                className={`resume-item ${visibilityClass} pl-5 sm:pl-7`}
                style={{ transitionDelay: `${70 + index * 85}ms` }}
              >
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

      <article
        className={`resume-summary mt-6 rounded-3xl border border-border bg-card p-4 sm:mt-7 sm:p-6 ${shouldReveal ? "is-visible" : ""}`}
        style={{ transitionDelay: `${120 + timeline.length * 85}ms` }}
      >
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
