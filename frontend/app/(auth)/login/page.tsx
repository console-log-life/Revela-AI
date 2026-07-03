"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { AuthShell } from "@/components/auth/auth-shell";
import { SocialLoginRow } from "@/components/auth/social-login-row";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginWithCredentials } from "@/services/api/auth";
import type { LoginFormValues } from "@/types/forms";
import { loginSchema } from "@/lib/validation";

export default function LoginPage() {
  const router = useRouter();
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" }
  });

  const onSubmit = form.handleSubmit(async (values) => {
    const result = await loginWithCredentials(values);
    if (!result.success) {
      toast.error(result.message);
      return;
    }
    toast.success(result.message);
    router.push("/dashboard");
  });

  return (
    <AuthShell title="Welcome back" description="Enter the workspace to review candidates, run interviews, and inspect model behavior.">
      <form className="space-y-5" onSubmit={onSubmit}>
        <SocialLoginRow />
        <div className="relative text-center text-sm text-muted-foreground">
          <span className="bg-card px-4">or sign in with email</span>
          <div className="-mt-3 border-t border-border/60" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="team@company.com" {...form.register("email")} />
          {form.formState.errors.email ? <p className="text-xs text-rose-400">{form.formState.errors.email.message}</p> : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" placeholder="Your password" {...form.register("password")} />
          {form.formState.errors.password ? <p className="text-xs text-rose-400">{form.formState.errors.password.message}</p> : null}
        </div>
        <Button type="submit" size="lg" className="w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Signing in..." : "Sign in"}
        </Button>
        <p className="text-sm text-muted-foreground">
          Need access?{" "}
          <Link href="/signup" className="text-sky-400">Request an invite</Link>
        </p>
      </form>
    </AuthShell>
  );
}