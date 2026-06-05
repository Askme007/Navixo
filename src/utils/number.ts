/**
 * Safely converts a value to a number, returning 0 for null/undefined/NaN
 * Used for displaying metrics that might not have data yet
 */
export const safeNumber = (n: number | null | undefined): number => {
  if (n === null || n === undefined || Number.isNaN(n)) return 0;
  return n;
};

/**
 * Formats a number as a percentage
 */
export const toPercent = (n: number | null | undefined): string => {
  return `${safeNumber(n)}%`;
};

/**
 * Formats time in hours with one decimal place
 */
export const formatHours = (n: number | null | undefined): string => {
  const value = safeNumber(n);
  return value === 0 ? '0.0' : value.toFixed(1);
};
