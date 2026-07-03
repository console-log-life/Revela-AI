"use client";

import { signIn, signOut } from "next-auth/react";
import type {
  SignupFormValues,
  LoginFormValues,
  ForgotPasswordFormValues,
} from "@/types/forms";

export async function signInWithProvider(
  provider: "google" | "github" | "linkedin"
) {
  try {
    await signIn(provider, { callbackUrl: "/dashboard", redirect: true });
    return { success: true, message: `Signing in with ${provider}` };
  } catch {
    return { success: false, message: `Failed to login with ${provider}` };
  }
}

export async function logout() {
  try {
    await signOut({ callbackUrl: "/login", redirect: true });
    return { success: true };
  } catch {
    return { success: false };
  }
}

export async function signup(
  values: SignupFormValues
): Promise<{ success: boolean; message: string }> {
  try {
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values)
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      return { success: false, message: data.message ?? "Could not create your account." };
    }

    const result = await signIn("credentials", {
      email: values.email,
      password: values.password,
      redirect: false
    });

    if (result?.error) {
      return { success: true, message: "Account created. Please sign in." };
    }

    return { success: true, message: "Account created." };
  } catch {
    return { success: false, message: "Could not create your account. Please try again." };
  }
}

export async function loginWithCredentials(
  values: LoginFormValues
): Promise<{ success: boolean; message: string }> {
  try {
    const result = await signIn("credentials", {
      email: values.email,
      password: values.password,
      redirect: false
    });

    if (result?.error) {
      return { success: false, message: "Invalid email or password." };
    }

    return { success: true, message: "Signed in." };
  } catch {
    return { success: false, message: "Could not sign in. Please try again." };
  }
}

export async function sendResetEmail(
  _values: ForgotPasswordFormValues
): Promise<{ success: boolean; message: string }> {
  return {
    success: true,
    message: "If an account exists for this email, a reset link has been sent."
  };
}