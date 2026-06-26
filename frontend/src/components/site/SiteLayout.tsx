import type { ReactNode } from "react";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";

export function SiteLayout({
  children,
  transparentHeader = false,
}: {
  children: ReactNode;
  /** When true, no top padding so the hero can sit under the fixed header. */
  transparentHeader?: boolean;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className={transparentHeader ? "flex-1" : "flex-1 pt-20"}>{children}</main>
      <SiteFooter />
    </div>
  );
}
