import type { Metadata } from "next";
import { MemoryWorkspaceView } from "@/components/memory/memory-workspace";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = {
  title: "Memory"
};

export default function MemoryPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Memory"
        title="Persistent candidate memory"
        description="Inspect stored interactions, retained weaknesses, confirmed strengths, and session reflections."
      />
      <MemoryWorkspaceView />
    </div>
  );
}
