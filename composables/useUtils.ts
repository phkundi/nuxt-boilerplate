export const useUtils = () => {
  // STRINGS
  function pluralize(
    count: number,
    word: string,
    includeNumber: boolean = true
  ): string {
    if (!includeNumber) {
      return `${word}${count === 1 ? "" : "s"}`;
    }
    return `${count} ${word}${count === 1 ? "" : "s"}`;
  }

  function truncate(text: string, length: number): string {
    if (text.length > length) {
      return text.substring(0, length) + "...";
    }
    return text;
  }

  function capitalize(word: string | null | undefined): string {
    if (!word) return word ?? "";
    return word[0].toUpperCase() + word.slice(1);
  }

  function ordinalSuffixOf(number: number): string {
    let remainder: number = number % 100;
    if (remainder >= 11 && remainder <= 13) {
      return number + "th";
    }
    switch (number % 10) {
      case 1:
        return number + "st";
      case 2:
        return number + "nd";
      case 3:
        return number + "rd";
      default:
        return number + "th";
    }
  }

  async function copyToClipboard(text: string): Promise<void> {
    await navigator.clipboard.writeText(text);
  }

  // NUMBERS
  function padNumber(num: number): string {
    return num.toString().padStart(2, "0");
  }

  // DATES
  function formatDate(timestamp: number | string | Date): string {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return new Date(timestamp).toLocaleDateString("en-US", options);
  }

  return {
    pluralize,
    capitalize,
    formatDate,
    ordinalSuffixOf,
    padNumber,
    copyToClipboard,
    truncate,
  };
};
