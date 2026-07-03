import Link from "next/link";
import { BrainCircuit } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({
  className,
  href = "/"
}: {
  className?: string;
  href?: string;
}) {
  return (
    <Link href={href} className={cn("inline-flex items-center gap-3", className)}>
      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#38bdf8,#1d4ed8_48%,#f472b6)] shadow-glow">
        <BrainCircuit className="h-5 w-5 text-white" />
      </span>
      <span>
        <span className="block text-sm font-medium uppercase tracking-[0.24em] text-muted-foreground">
          Adaptive Hiring
        </span>
        <span className="block text-xl font-semibold tracking-tight">Revela AI</span>
      </span>
    </Link>
  );
}
