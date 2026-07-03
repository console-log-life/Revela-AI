import type { Metadata } from "next";
import { ReportsLoader } from "@/components/reports/reports-loader";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = {
  title: "Reports"
};

export default function ReportsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Reports"
        title="Candidate reports"
        description="Export-ready summaries that combine memory, scores, reflections, and readiness into recruiter-friendly briefs."
      />
      <ReportsLoader />
    </div>
  );
}
