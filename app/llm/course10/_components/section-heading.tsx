export default function SectionHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-8">
      <div>
        {eyebrow ? (
          <p className="text-[10px] font-medium tracking-[0.22em] uppercase text-[#75695b] mb-2">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="display text-3xl md:text-4xl text-[#2a2723] leading-tight">
          {title}
        </h2>
        {description ? (
          <p className="text-sm text-[#6b6358] mt-2 max-w-prose">{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
