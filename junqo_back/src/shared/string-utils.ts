/**
 * Truncates a string to a maximum length, appending an ellipsis if truncated.
 *
 * @param str - The string to truncate
 * @param maxLength - The maximum length of the resulting string (including ellipsis)
 * @param suffix - The suffix to append when truncating (default: '...')
 * @returns The truncated string, or the original if within maxLength
 */
export function truncateString(
  str: string,
  maxLength: number,
  suffix: string = '...',
): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - suffix.length) + suffix;
}
