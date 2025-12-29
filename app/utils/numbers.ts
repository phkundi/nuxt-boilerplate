export function ordinalSuffixOf(number: number): string {
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

export function padNumber(num: number): string {
  return num.toString().padStart(2, "0");
}
