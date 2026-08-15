import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Returns the priority band label for a given score (0–100). */
export function getPriorityBand(score: number): "critical" | "high" | "medium" | "low" {
  if (score >= 70) return "critical";
  if (score >= 40) return "high";
  if (score >= 20) return "medium";
  return "low";
}

/** Returns Tailwind class names for a priority badge. */
export function priorityBadgeClass(score: number): string {
  const band = getPriorityBand(score);
  return {
    critical: "priority-badge-critical",
    high:     "priority-badge-high",
    medium:   "priority-badge-medium",
    low:      "priority-badge-low",
  }[band];
}

/** Returns Tailwind class name for a status chip. */
export function statusChipClass(
  status: "open" | "in_progress" | "resolved" | "closed"
): string {
  return `status-chip-${status}`;
}

/** Formats a UTC date string to a readable date. */
export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

/** Returns relative time string (e.g. "2 days ago"). */
export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins  = Math.floor(diff / 60_000);
  const hours = Math.floor(mins / 60);
  const days  = Math.floor(hours / 24);
  if (days  > 0)  return `${days}d ago`;
  if (hours > 0)  return `${hours}h ago`;
  if (mins  > 0)  return `${mins}m ago`;
  return "just now";
}
