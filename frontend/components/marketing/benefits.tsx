import { ArrowUpRight, Sparkles, TimerReset, WalletCards } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const items = [
  {
    title: "63% cost reduction against static premium baselines",
    description: "Route simple moments cheaply and reserve expensive reasoning for the real signal checkpoints.",
    icon: WalletCards
  },
  {
    title: "Contextual follow-up rounds",
    description: "Candidates are evaluated longitudinally, not reset to zero every time they return.",
    icon: TimerReset
  },
  {
    title: "Decision-ready recruiter signal",
    description: "Surface trends, weaknesses, strengths, and recommendations with boardroom-friendly clarity.",
    icon: ArrowUpRight
  }
];

export function BenefitsSection() {
  return (
    <section className="container py-24">
      <Card className="overflow-hidden rounded-[32px]">
        <CardContent className="grid gap-8 p-8 md:p-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-fuchsia-500/20 bg-fuchsia-500/10 px-4 py-2 text-sm text-fuchsia-400">
              <Sparkles className="h-4 w-4" />
              Business impact
            </div>
            <h2 className="mt-5 text-4xl font-semibold tracking-tight">The product experience is designed around hiring leverage</h2>
            <p className="mt-4 max-w-xl text-muted-foreground">
              Better interviews, more durable memory, lower spend, and cleaner decision support. Every surface in the app
              pushes toward those outcomes.
            </p>
          </div>
          <div className="grid gap-4">
            {items.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="rounded-3xl border border-border/60 bg-background/60 p-5">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary text-primary">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-lg font-medium">{item.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
