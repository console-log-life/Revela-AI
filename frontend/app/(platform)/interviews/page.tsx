import type { Metadata } from "next";
import { InterviewWorkspaceView } from "@/components/interview/interview-workspace";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = {
  title: "Interview Sessions"
};

export default function InterviewsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Interview Sessions"
        title="Adaptive interview workspace"
        description="Run the live AI interviewer, keep candidate context visible, and inspect evaluation output without leaving the flow."
      />
      <InterviewWorkspaceView />
    </div>
  );
}
