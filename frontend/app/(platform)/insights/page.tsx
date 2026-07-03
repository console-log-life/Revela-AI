import type { Metadata } from "next";
import { InsightsLoader } from "@/components/insights/insights-loader";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = {
  title: "AI Insights"
};

export default function InsightsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="AI Insights"
        title="AI-generated hiring insights"
        description="Summaries and recommendations derived from candidate memory, runtime analytics, and interview behavior."
      />
      <InsightsLoader />
    </div>
  );
}
