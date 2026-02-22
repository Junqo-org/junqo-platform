/**
 * Truncates a string to a maximum length, appending a suffix if truncated.
 *
 * @param str - The string to truncate
 * @param maxLength - The maximum length of the resulting string (including suffix)
 * @param suffix - The suffix to append when truncating (default: '...')
 * @returns The truncated string, or the original if within maxLength
 * @throws Error if maxLength is less than or equal to suffix length
 */
export function truncateString(
  str: string,
  maxLength: number,
  suffix: string = '...',
): string {
  if (maxLength <= 0) {
    return '';
  }
  if (maxLength <= suffix.length) {
    return str.length <= maxLength ? str : suffix.slice(0, maxLength);
  }
  if (str.length <= maxLength) {
    return str;
  }
  return str.slice(0, maxLength - suffix.length) + suffix;
}
