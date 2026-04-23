export const MOOD_LABELS = ["", "heavy", "low", "off", "even", "light", "warm", "bright"];

const DAY_NAMES_SHORT = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
const MONTH_NAMES_SHORT = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
const DAY_NAMES_LONG = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTH_NAMES_LONG = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

/** Format ISO date for inbox row: "mon · apr 22" */
export function formatShortDate(date: string): string {
  const d = new Date(date);
  if (isNaN(d.getTime())) return "unknown";
  return `${DAY_NAMES_SHORT[d.getDay()]} · ${MONTH_NAMES_SHORT[d.getMonth()]} ${d.getDate()}`;
}

/** Format ISO date for detail view eyebrow: "Monday, April 22" */
export function formatLongDate(date: string): string {
  const d = new Date(date);
  if (isNaN(d.getTime())) return "unknown date";
  return `${DAY_NAMES_LONG[d.getDay()]}, ${MONTH_NAMES_LONG[d.getMonth()]} ${d.getDate()}`;
}

/** Format ISO date for detail day header: "Monday" */
export function formatDayName(date: string): string {
  const d = new Date(date);
  if (isNaN(d.getTime())) return "unknown";
  return DAY_NAMES_LONG[d.getDay()];
}
