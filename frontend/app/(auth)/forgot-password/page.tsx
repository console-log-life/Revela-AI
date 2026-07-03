"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { sendResetEmail } from "@/services/api/auth";
import type { ForgotPasswordFormValues } from "@/types/forms";
import { forgotPasswordSchema } from "@/lib/validation";

export default function ForgotPasswordPage() {
  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: ""
    }
  });

  const onSubmit = form.handleSubmit(async (values) => {
    const result = await sendResetEmail(values);
    toast.success(result.message);
  });

  return (
    <AuthShell title="Reset password" description="We’ll send a link so you can get back into the hiring workspace.">
      <form className="space-y-5" onSubmit={onSubmit}>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="ops@revela.ai" {...form.register("email")} />
          {form.formState.errors.email ? <p className="text-xs text-rose-400">{form.formState.errors.email.message}</p> : null}
        </div>
        <Button type="submit" size="lg" className="w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Sending..." : "Send reset link"}
        </Button>
        <p className="text-sm text-muted-foreground">
          Remembered it?{" "}
          <Link href="/login" className="text-sky-400">
            Return to login
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
