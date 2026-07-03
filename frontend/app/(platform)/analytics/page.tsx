import type { Metadata } from "next";
import { AnalyticsLoader } from "@/components/analytics/analytics-loader";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = {
  title: "Analytics"
};

export default function AnalyticsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Analytics"
        title="Runtime intelligence analytics"
        description="Track routing decisions, latency, spend, candidate scoring, and system health over time."
      />
      <AnalyticsLoader />
    </div>
  );
}
