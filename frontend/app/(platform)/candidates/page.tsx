import type { Metadata } from "next";
import { CandidatesLoader } from "@/components/candidates/candidates-loader";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = {
  title: "Candidate Profiles"
};

export default function CandidatesPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Candidates"
        title="Candidate profiles"
        description="Persistent memory, prior reflections, and longitudinal score signals across every interview round."
      />
      <CandidatesLoader />
    </div>
  );
}
