import type { ReactNode } from "react";

export default function Panel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <section className={`glass rounded-3xl p-5 sm:p-6 ${className}`}>{children}</section>;
}
