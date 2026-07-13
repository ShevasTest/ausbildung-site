type SectionHeaderProps = {
  eyebrow?: string;
  title: string;
  intro?: string;
};

export function SectionHeader({ eyebrow, title, intro }: SectionHeaderProps) {
  return (
    <div className="reveal max-w-3xl">
      {eyebrow ? (
        <p className="dim-line">
          <span className="dim-line-rule" aria-hidden />
          <span>{eyebrow}</span>
        </p>
      ) : null}
      <h2 className="font-display mt-3 text-[1.7rem] leading-tight font-semibold tracking-tight text-balance sm:text-4xl">
        {title}
      </h2>
      {intro ? (
        <p className="mt-4 text-[0.98rem] leading-relaxed text-muted sm:text-base">{intro}</p>
      ) : null}
    </div>
  );
}
