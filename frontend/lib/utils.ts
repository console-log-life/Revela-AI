import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: value < 1 ? 4 : 2
  }).format(value);
}

export function formatLatency(value: number) {
  return `${Math.round(value)}ms`;
}

export function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`;
}

export function formatRelativeTime(date: string) {
  const now = Date.now();
  const target = new Date(date).getTime();
  const diff = target - now;
  const absSeconds = Math.round(Math.abs(diff) / 1000);
  const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  if (absSeconds < 60) return formatter.format(Math.round(diff / 1000), "second");

  const absMinutes = Math.round(absSeconds / 60);
  if (absMinutes < 60) return formatter.format(Math.round(diff / 60000), "minute");

  const absHours = Math.round(absMinutes / 60);
  if (absHours < 24) return formatter.format(Math.round(diff / 3600000), "hour");

  const absDays = Math.round(absHours / 24);
  if (absDays < 30) return formatter.format(Math.round(diff / 86400000), "day");

  const absMonths = Math.round(absDays / 30);
  if (absMonths < 12) return formatter.format(Math.round(diff / 2592000000), "month");

  return formatter.format(Math.round(diff / 31536000000), "year");
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function sentenceCase(value: string) {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function dedupe(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}
