import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/logo";

export function AuthShell({
  title,
  description,
  children
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-12">
      <div className="absolute left-4 top-4 md:left-8 md:top-8">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>
      </div>
      <div className="grid w-full max-w-6xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div className="hidden lg:block">
          <Logo />
          <h1 className="mt-10 max-w-lg text-5xl font-semibold tracking-tight">
            Build a hiring loop that remembers, adapts, and explains itself.
          </h1>
          <p className="mt-4 max-w-xl text-muted-foreground">
            Use the workspace to run adaptive interviews, inspect runtime reasoning, and keep candidate memory persistent
            across sessions.
          </p>
        </div>
        <div className="glass-panel noise-mask rounded-[32px] p-8 md:p-10">
          <div className="mb-8">
            <Logo className="lg:hidden" />
            <h2 className="mt-6 text-3xl font-semibold tracking-tight">{title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{description}</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
