import { cn } from "@/lib/utils";

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-shimmer rounded-xl bg-[linear-gradient(110deg,rgba(148,163,184,0.12),rgba(148,163,184,0.2),rgba(148,163,184,0.12))] bg-[length:200%_100%]",
        className
      )}
      {...props}
    />
  );
}
