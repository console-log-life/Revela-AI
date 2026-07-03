import Link from "next/link";
import { Logo } from "@/components/logo";

export function MarketingFooter() {
  return (
    <footer className="border-t border-border/60">
      <div className="container flex flex-col gap-8 py-10 md:flex-row md:items-center md:justify-between">
        <Logo />
        <div className="flex flex-wrap gap-5 text-sm text-muted-foreground">
          <Link href="/dashboard">Workspace</Link>
          <Link href="/analytics">Analytics</Link>
          <Link href="/interviews">Interview demo</Link>
          <Link href="/settings">Settings</Link>
        </div>
      </div>
    </footer>
  );
}
