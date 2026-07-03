import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { DashboardLoader } from "@/components/dashboard/dashboard-loader";

export const metadata: Metadata = {
  title: "Dashboard"
};

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Overview"
        title="Dashboard"
        description="Team activity, model usage, and candidate signals at a glance."
      />

      <DashboardLoader />
    </div>
  );
}