import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function StatCard({
  title,
  value,
  icon,
  delta,
  tone = "default"
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  delta?: string;
  tone?: "default" | "positive" | "negative";
}) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-3xl font-semibold tracking-tight">{value}</p>
            {delta ? (
              <p
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium",
                  tone === "positive" && "bg-emerald-500/10 text-emerald-400",
                  tone === "negative" && "bg-rose-500/10 text-rose-400",
                  tone === "default" && "bg-secondary text-muted-foreground"
                )}
              >
                {tone === "negative" ? <ArrowDownRight className="h-3 w-3" /> : <ArrowUpRight className="h-3 w-3" />}
                {delta}
              </p>
            ) : null}
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary text-primary">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
