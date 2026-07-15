type SectionHeaderProps = {
  eyebrow?: string;
  title: string;
  intro?: string;
};

export function SectionHeader({ eyebrow, title, intro }: SectionHeaderProps) {
  return (
    <div className="max-w-3xl">
      {eyebrow ? (
        <p className="dim-line">
          <span className="dim-line-rule" aria-hidden />
          <span>{eyebrow}</span>
        </p>
      ) : null}
      <h2 className="font-display mt-4 text-3xl leading-[1.05] font-semibold tracking-tight text-balance sm:text-5xl">
        {title}
      </h2>
      {intro ? (
        <p className="mt-5 max-w-2xl text-[0.98rem] leading-relaxed text-muted sm:text-base">{intro}</p>
      ) : null}
    </div>
  );
}
