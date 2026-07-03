import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CtaSection() {
  return (
    <section className="container py-24">
      <div className="glass-panel noise-mask rounded-[32px] px-8 py-14 text-center md:px-14">
        <p className="text-xs font-medium uppercase tracking-[0.24em] text-sky-400">Ready to ship</p>
        <h2 className="mx-auto mt-4 max-w-4xl text-balance text-4xl font-semibold tracking-tight md:text-5xl">
          Bring candidate memory, runtime intelligence, and recruiter analytics into one interview platform.
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-balance text-muted-foreground">
          Open the workspace, start an interview, and explore the full adaptive hiring system.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Button asChild size="lg">
            <Link href="/dashboard">
              Open dashboard
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/signup">Create workspace</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
