"use client";

import * as React from "react";
import { Github, Linkedin, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signInWithProvider } from "@/services/api/auth";

const availableProviders = {
  github: Boolean(process.env.NEXT_PUBLIC_GITHUB_ID),
  linkedin: Boolean(process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID),
  google: Boolean(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID)
};

export function SocialLoginRow() {
  const [loadingProvider, setLoadingProvider] = React.useState<string | null>(null);

  const handleProvider = async (provider: "google" | "github" | "linkedin") => {
    setLoadingProvider(provider);
    await signInWithProvider(provider);
  };

  const buttons = [
    {
      provider: "github" as const,
      icon: <Github className="h-4 w-4" />,
      label: "GitHub"
    },
    {
      provider: "linkedin" as const,
      icon: <Linkedin className="h-4 w-4" />,
      label: "LinkedIn"
    },
    {
      provider: "google" as const,
      icon: <Mail className="h-4 w-4" />,
      label: "Google"
    }
  ].filter((item) => availableProviders[item.provider]);

  if (buttons.length === 0) {
    return null;
  }

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {buttons.map(({ provider, icon, label }) => (
        <Button
          key={provider}
          variant="outline"
          type="button"
          onClick={() => handleProvider(provider)}
          disabled={loadingProvider !== null}
        >
          {icon}
          {loadingProvider === provider ? "Opening..." : label}
        </Button>
      ))}
    </div>
  );
}
