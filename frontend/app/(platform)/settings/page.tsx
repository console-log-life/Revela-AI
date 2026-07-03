import type { Metadata } from "next";
import { SettingsLoader } from "@/components/settings/settings-loader";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = {
  title: "Settings"
};

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Settings"
        title="Workspace settings"
        description="Configure operator identity, API connectivity, memory controls, model routing, and notification preferences."
      />
      <SettingsLoader />
    </div>
  );
}
