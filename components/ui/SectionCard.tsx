import type { ReactNode } from "react";

type SectionCardProps = Readonly<{
  children: ReactNode;
  eyebrow: string;
  title: string;
}>;

export default function SectionCard({ children, eyebrow, title }: SectionCardProps) {
  return (
    <section className="rounded-[28px] border border-line bg-surface p-6 shadow-[0_18px_60px_rgba(24,49,38,0.08)] backdrop-blur">
      <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-brand/70">{eyebrow}</p>
      <h2 className="mt-3 font-display text-2xl text-foreground">{title}</h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}
