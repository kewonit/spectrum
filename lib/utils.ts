import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines class names using clsx and tailwind-merge
 * This is used by shadcn/ui components and should be used
 * throughout the application for consistency
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Safe date formatter with fallback
 */
export function formatDate(dateString: string): string {
  try {
    return new Date(dateString).toLocaleDateString();
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Unknown date";
  }
}

/**
 * Safe access to nested properties
 */
export function safelyAccessObject<T>(obj: any, defaultValue: T): T {
  try {
    if (obj === null || obj === undefined) {
      return defaultValue;
    }
    return obj as T;
  } catch (error) {
    console.error("Error accessing object:", error);
    return defaultValue;
  }
}
