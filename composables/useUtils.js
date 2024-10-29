export const useUtils = () => {
  // STRINGS
  function pluralize(count, word, includeNumber = true) {
    // Takes word and returns it with the correct pluralization
    if (!includeNumber) {
      return `${word}${count === 1 ? "" : "s"}`;
    }
    return `${count} ${word}${count === 1 ? "" : "s"}`;
  }

  function truncate(text, length) {
    // Truncates text to a given length and adds "..." if it is longer than the length
    if (text.length > length) {
      return text.substring(0, length) + "...";
    }
    return text;
  }

  function capitalize(word) {
    // Capitalizes the first letter of a word
    if (!word) return word;
    return word[0].toUpperCase() + word.slice(1);
  }

  function ordinalSuffixOf(number) {
    // Adds the correct ordinal suffix to a number
    let remainder = number % 100;
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

  function copyToClipboard(text) {
    // Copies text to the clipboard
    navigator.clipboard.writeText(text);
  }

  // NUMBERS
  function padNumber(num) {
    // Pads a number with leading zeros to ensure it is two digits
    return num.toString().padStart(2, "0");
  }

  // DATES
  function formatDate(timestamp) {
    // Formats a timestamp into a date string
    const options = { year: "numeric", month: "long", day: "numeric" };
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
