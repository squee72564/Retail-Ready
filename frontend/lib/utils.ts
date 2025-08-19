import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Utility function to merge class names using clsx and tailwind-merge.
 * This is useful for conditionally applying Tailwind CSS classes.
 *
 * @param inputs - Class names to be merged.
 * @returns A single string of merged class names.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
