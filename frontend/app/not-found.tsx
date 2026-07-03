import Link from "next/link";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container flex min-h-screen flex-col items-center justify-center py-20 text-center">
      <div className="glass-panel noise-mask rounded-[32px] p-10 md:p-16">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary text-primary">
          <Compass className="h-8 w-8" />
        </div>
        <h1 className="mt-6 text-4xl font-semibold">Page not found</h1>
        <p className="mx-auto mt-3 max-w-lg text-balance text-muted-foreground">
          The route you tried to open doesn’t exist in this workspace.
        </p>
        <div className="mt-8 flex justify-center">
          <Button asChild>
            <Link href="/dashboard">Go to dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
