"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/error-state";

export default function GlobalError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground">
        <div className="container flex min-h-screen items-center justify-center py-16">
          <ErrorState
            title="The workspace hit an unexpected error"
            description={error.message}
            onRetry={reset}
          />
        </div>
      </body>
    </html>
  );
}
