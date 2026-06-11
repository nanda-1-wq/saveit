import type { ReactNode } from "react";

const CORNER = "pointer-events-none absolute h-3.5 w-3.5 border-signal";

export default function Panel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`relative border border-line bg-char/80 p-5 sm:p-6 ${className}`}>
      <span aria-hidden className={`${CORNER} -left-px -top-px border-l-2 border-t-2`} />
      <span aria-hidden className={`${CORNER} -right-px -top-px border-r-2 border-t-2`} />
      <span aria-hidden className={`${CORNER} -bottom-px -left-px border-b-2 border-l-2`} />
      <span aria-hidden className={`${CORNER} -bottom-px -right-px border-b-2 border-r-2`} />
      {children}
    </section>
  );
}
