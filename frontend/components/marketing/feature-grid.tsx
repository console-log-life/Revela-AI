import { Brain, Gauge, LineChart, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { marketingFeatures } from "@/lib/constants";

const icons = [Brain, ShieldCheck, Gauge, LineChart];

export function FeatureGrid() {
  return (
    <section className="container py-24">
      <div className="max-w-2xl">
        <p className="text-xs font-medium uppercase tracking-[0.24em] text-sky-400">Platform capabilities</p>
        <h2 className="mt-4 text-4xl font-semibold tracking-tight">Everything the hiring loop needs in one adaptive surface</h2>
      </div>
      <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {marketingFeatures.map((feature, index) => {
          const Icon = icons[index];
          return (
            <Card key={feature.title} className="h-full">
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary text-primary">
                  <Icon className="h-6 w-6" />
                </div>
                <CardTitle className="mt-4">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-7 text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
