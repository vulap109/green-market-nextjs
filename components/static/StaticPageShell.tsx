import Link from "next/link";
import type { ReactNode } from "react";

type BreadcrumbItem = {
  href?: string;
  label: string;
};

type StaticPageShellProps = Readonly<{
  breadcrumbs: BreadcrumbItem[];
  children: ReactNode;
  maxWidth?: "4xl" | "7xl";
}>;

type StaticContentCardProps = Readonly<{
  children: ReactNode;
  className?: string;
}>;

type PageTitleBlockProps = Readonly<{
  description?: string;
  title: string;
}>;

type PolicySectionProps = Readonly<{
  children: ReactNode;
  title: string;
}>;

type BulletListProps = Readonly<{
  className?: string;
  items: ReactNode[];
}>;

type ContactItem = {
  href?: string;
  label: string;
  value: string;
};

type ContactSupportCardProps = Readonly<{
  items: ContactItem[];
}>;

type NoticeBoxProps = Readonly<{
  children: ReactNode;
  title?: string;
  tone?: "green" | "orange" | "yellow";
}>;

type StepItem = {
  description: ReactNode;
  title: string;
};

type NumberedStepsProps = Readonly<{
  steps: StepItem[];
}>;

const maxWidthClassNames = {
  "4xl": "max-w-4xl",
  "7xl": "max-w-7xl"
} as const;

const noticeToneClassNames = {
  green: "border-green-200 bg-[#f0fdf4] text-gray-700",
  orange: "border-orange-200 bg-orange-50 text-orange-900",
  yellow: "border-yellow-200 bg-yellow-50 text-yellow-900"
} as const;

function joinClassNames(...classNames: Array<string | undefined>): string {
  return classNames.filter(Boolean).join(" ");
}

export default function StaticPageShell({
  breadcrumbs,
  children,
  maxWidth = "4xl"
}: StaticPageShellProps) {
  return (
    <>
      <div className="border-b border-gray-200 bg-gray-100 py-3">
        <div className="mx-auto max-w-7xl px-4 text-xs text-gray-500">
          {breadcrumbs.map((item, index) => (
            <span key={`${item.label}-${index}`}>
              {index > 0 ? <span className="mx-2">/</span> : null}
              {item.href ? (
                <Link href={item.href} className="transition hover:text-primary">
                  {item.label}
                </Link>
              ) : (
                <span className="font-medium text-gray-800">{item.label}</span>
              )}
            </span>
          ))}
        </div>
      </div>

      <main className={joinClassNames("mx-auto w-full px-4 py-10", maxWidthClassNames[maxWidth])}>
        {children}
      </main>
    </>
  );
}

export function StaticContentCard({ children, className }: StaticContentCardProps) {
  return (
    <div className={joinClassNames("rounded-2xl border border-gray-100 bg-white p-8 shadow-sm md:p-12", className)}>
      {children}
    </div>
  );
}

export function PageTitleBlock({ description, title }: PageTitleBlockProps) {
  return (
    <header className="mb-8 text-center">
      <h1 className="text-2xl font-bold uppercase tracking-tight text-gray-900 md:text-3xl">{title}</h1>
      {description ? <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-gray-500">{description}</p> : null}
    </header>
  );
}

export function PolicySection({ children, title }: PolicySectionProps) {
  return (
    <section>
      <h2 className="mb-3 mt-8 border-b border-gray-100 pb-2 text-lg font-bold text-gray-800">{title}</h2>
      <div className="space-y-3 text-sm leading-relaxed text-gray-600">{children}</div>
    </section>
  );
}

export function BulletList({ className, items }: BulletListProps) {
  return (
    <ul className={joinClassNames("list-disc space-y-1.5 pl-5 marker:text-primary", className)}>
      {items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  );
}

export function ContactSupportCard({ items }: ContactSupportCardProps) {
  return (
    <div className="mt-4 grid gap-3 rounded-xl border border-gray-100 bg-white p-5 shadow-sm md:w-max">
      {items.map((item) => (
        <div key={item.label} className="flex items-start gap-4">
          <div className="min-w-0">
            <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400">
              {item.label}
            </span>
            {item.href ? (
              <a
                href={item.href}
                target={item.href.startsWith("http") ? "_blank" : undefined}
                rel={item.href.startsWith("http") ? "noreferrer" : undefined}
                className="text-sm font-bold text-gray-800 transition hover:text-primary"
              >
                {item.value}
              </a>
            ) : (
              <strong className="text-sm text-gray-800">{item.value}</strong>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export function NoticeBox({ children, title, tone = "green" }: NoticeBoxProps) {
  return (
    <div className={joinClassNames("rounded-xl border p-5 shadow-sm", noticeToneClassNames[tone])}>
      {title ? <p className="mb-2 font-bold">{title}</p> : null}
      <div className="space-y-2 text-sm leading-relaxed">{children}</div>
    </div>
  );
}

export function NumberedSteps({ steps }: NumberedStepsProps) {
  return (
    <div className="space-y-4">
      {steps.map((step, index) => (
        <div key={step.title} className="flex items-start gap-4">
          <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-green-100 font-bold text-primary">
            {index + 1}
          </div>
          <div className="space-y-1 text-sm leading-relaxed text-gray-600">
            <h3 className="font-bold text-gray-800">{step.title}</h3>
            <div>{step.description}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
