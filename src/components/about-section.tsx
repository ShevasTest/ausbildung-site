"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type ReactNode } from "react";

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
  profileInitials: string;
  profilePlaceholder: string;
  profileCaption: string;
  profileFacts: string[];
};

type RevealBlockProps = {
  children: ReactNode;
  className?: string;
  delayMs?: number;
};

function RevealBlock({ children, className = "", delayMs = 0 }: RevealBlockProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (motionQuery.matches) {
      setIsReducedMotion(true);
      setIsVisible(true);
      return;
    }

    const node = ref.current;
    if (!node) {
      return;
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
        threshold: 0.2,
        rootMargin: "0px 0px -10% 0px",
      },
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, []);

  const visibilityClass = isVisible || isReducedMotion ? "is-visible" : "";

  return (
    <div
      ref={ref}
      className={`about-reveal-item ${visibilityClass} ${className}`.trim()}
      style={{ transitionDelay: `${delayMs}ms` }}
    >
      {children}
    </div>
  );
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
  profileInitials,
  profilePlaceholder,
  profileCaption,
  profileFacts,
}: AboutSectionProps) {
  return (
    <section id="about" className="section-deferred scroll-mt-28 py-14 sm:py-20">
      <div className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-start">
        <RevealBlock className="lg:sticky lg:top-24" delayMs={20}>
          <article className="relative overflow-hidden rounded-3xl border border-border bg-card p-6 sm:p-8">
            <div aria-hidden className="about-profile-orb" />

            <p className="relative text-xs font-semibold tracking-[0.16em] text-primary uppercase">
              {profileBadge}
            </p>

            <div className="relative mt-5 flex items-center gap-4">
              <div className="relative h-28 w-24 shrink-0 overflow-hidden rounded-2xl border border-primary/30">
                <Image
                  src="/profile.jpg"
                  alt={profileName}
                  fill
                  className="object-cover object-top"
                  sizes="96px"
                  priority
                />
              </div>

              <div className="min-w-0">
                <p className="text-lg font-semibold tracking-tight text-foreground">{profileName}</p>
                <p className="text-sm leading-relaxed text-muted">{profileRole}</p>
              </div>
            </div>

            <p className="relative mt-5 text-sm leading-relaxed text-muted">{profileCaption}</p>

            <ul className="relative mt-6 space-y-2">
              {profileFacts.map((fact) => (
                <li key={fact} className="flex items-start gap-2.5 text-sm text-muted">
                  <span
                    aria-hidden
                    className="mt-1 inline-flex h-2.5 w-2.5 shrink-0 rounded-full bg-accent/70"
                  />
                  <span>{fact}</span>
                </li>
              ))}
            </ul>
          </article>
        </RevealBlock>

        <div className="space-y-5">
          <RevealBlock delayMs={60}>
            <p className="text-xs font-semibold tracking-[0.16em] text-accent uppercase">{eyebrow}</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h2>
            <p className="mt-4 max-w-3xl text-lg leading-relaxed text-primary">{lead}</p>
          </RevealBlock>

          <div className="space-y-4">
            {paragraphs.map((paragraph, index) => (
              <RevealBlock key={`${index}-${paragraph.slice(0, 24)}`} delayMs={110 + index * 70}>
                <p className="max-w-3xl leading-relaxed text-muted">{paragraph}</p>
              </RevealBlock>
            ))}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {highlights.map((highlight, index) => (
              <RevealBlock key={`${highlight.label}-${index}`} delayMs={260 + index * 60}>
                <article className="rounded-2xl border border-border bg-card/85 p-4 transition hover:-translate-y-0.5 hover:border-primary/35">
                  <p className="text-xs font-semibold tracking-wide text-accent uppercase">
                    {highlight.label}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-foreground">{highlight.value}</p>
                </article>
              </RevealBlock>
            ))}
          </div>

          <RevealBlock delayMs={360}>
            <article className="rounded-2xl border border-border bg-card p-5 sm:p-6">
              <h3 className="text-base font-semibold tracking-tight text-foreground">{motivationTitle}</h3>

              <ul className="mt-4 space-y-3">
                {motivationPoints.map((point) => (
                  <li key={point} className="flex items-start gap-2.5 text-sm leading-relaxed text-muted">
                    <span
                      aria-hidden
                      className="mt-1 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary"
                    >
                      →
                    </span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </article>
          </RevealBlock>
        </div>
      </div>
    </section>
  );
}
