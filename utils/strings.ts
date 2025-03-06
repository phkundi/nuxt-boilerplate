export function pluralize(
  count: number,
  word: string,
  includeNumber = true
): string {
  if (!includeNumber) {
    return `${word}${count === 1 ? "" : "s"}`;
  }
  return `${count} ${word}${count === 1 ? "" : "s"}`;
}

export function truncate(text: string, length: number): string {
  if (text.length > length) {
    return text.substring(0, length) + "...";
  }
  return text;
}

export function capitalize(
  word: string | null | undefined
): string | null | undefined {
  if (!word) return word;
  return word[0].toUpperCase() + word.slice(1);
}

export function copyToClipboard(text: string): void {
  navigator.clipboard.writeText(text);
}
