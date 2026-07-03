"use client";

import { AlertTriangle, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ApiError } from "@/services/api/client";

function formatErrorMessage(error: unknown) {
  if (!error) {
    return "The backend did not return data for this view.";
  }

  if (error instanceof ApiError) {
    return `Backend ${error.status}: ${error.message}`;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  try {
    return JSON.stringify(error);
  } catch {
    return "An unexpected error occurred.";
  }
}

export function ErrorState({
  title = "Request failed",
  description = "The backend did not return data for this view.",
  error,
  onRetry
}: {
  title?: string;
  description?: string;
  error?: unknown;
  onRetry?: () => void;
}) {
  const message = error ? formatErrorMessage(error) : description;

  return (
    <Card className="border-rose-500/20">
      <CardContent className="flex min-h-[220px] flex-col items-center justify-center gap-4 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-400">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-semibold">{title}</h3>
          <p className="max-w-md text-sm text-muted-foreground">{message}</p>
        </div>
        {onRetry ? (
          <Button variant="outline" onClick={onRetry}>
            <RefreshCcw className="h-4 w-4" />
            Retry
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
