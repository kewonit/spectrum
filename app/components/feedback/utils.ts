/**
 * Safe utility for combining class names
 */
export function combineClasses(...classes: string[]): string {
  return classes.filter(Boolean).join(' ');
}
