import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

export const signupSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8)
});

export const forgotPasswordSchema = z.object({
  email: z.string().email()
});

export const startSessionSchema = z.object({
  candidateId: z.string().min(2),
  candidateName: z.string().min(2),
  role: z.string().min(2)
});

export const responseSchema = z.object({
  candidateId: z.string().min(2),
  answer: z.string().min(10)
});
