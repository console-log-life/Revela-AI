import type { Metadata } from "next";
import { CandidateProfileLoader } from "@/components/candidates/candidate-profile-loader";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = {
  title: "Candidate Detail"
};

export default async function CandidateDetailPage({
  params
}: {
  params: Promise<{ candidateId: string }>;
}) {
  const { candidateId } = await params;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Candidate Profile"
        title="Candidate detail"
        description="Review longitudinal performance, reflections, strengths, weaknesses, and readiness before the next interview."
      />
      <CandidateProfileLoader candidateId={candidateId} />
    </div>
  );
}
