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
import { signup } from "@/services/api/auth";
import type { SignupFormValues } from "@/types/forms";
import { signupSchema } from "@/lib/validation";

export default function SignupPage() {
  const router = useRouter();
  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: "", email: "", password: "" }
  });

  const onSubmit = form.handleSubmit(async (values) => {
    const result = await signup(values);
    if (!result.success) {
      toast.error(result.message);
      return;
    }
    toast.success(result.message);
    router.push("/dashboard");
  });

  return (
    <AuthShell title="Create your workspace" description="Set up a premium AI interview command center in minutes.">
      <form className="space-y-5" onSubmit={onSubmit}>
        <SocialLoginRow />
        <div className="relative text-center text-sm text-muted-foreground">
          <span className="bg-card px-4">or create with email</span>
          <div className="-mt-3 border-t border-border/60" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="name">Full name</Label>
          <Input id="name" placeholder="Avery Quinn" {...form.register("name")} />
          {form.formState.errors.name ? <p className="text-xs text-rose-400">{form.formState.errors.name.message}</p> : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Work email</Label>
          <Input id="email" type="email" placeholder="team@company.com" {...form.register("email")} />
          {form.formState.errors.email ? <p className="text-xs text-rose-400">{form.formState.errors.email.message}</p> : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" placeholder="Create a secure password" {...form.register("password")} />
          {form.formState.errors.password ? <p className="text-xs text-rose-400">{form.formState.errors.password.message}</p> : null}
        </div>
        <Button type="submit" size="lg" className="w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Creating workspace..." : "Create account"}
        </Button>
        <p className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="text-sky-400">Sign in</Link>
        </p>
      </form>
    </AuthShell>
  );
}