import dayjs, { type OpUnitType, type QUnitType } from "dayjs";
import duration from "dayjs/plugin/duration";

dayjs.extend(duration);

export function formatDate(date: number | string | Date, format = "YYYY-MM-DD") {
  return dayjs(date).format(format);
}

export function getAge(birthdate: number | Date | string) {
  let dateSerial =
    typeof birthdate === "number" ? birthdate : new Date(birthdate).getTime();

  if (isNaN(dateSerial)) return 0;

  const msInADay = 60 * 60 * 24 * 1000;

  return Math.floor((new Date().getTime() - dateSerial) / (msInADay * 365.25));
}

export function getDuration(
  start: Date,
  end: Date,
  unit: QUnitType | OpUnitType = "days"
) {
  return dayjs(end).diff(dayjs(start), unit);
}

/**
 *
 * @param dateString The input string containing date/time
 * @param dateStringFormat The input string format (NOT the desired output format, it outputs a `Date` type)
 * @param strict If true the function will return `null` if the input string ({@link dateString}) shape didn't match {@link dateStringFormat}
 */
export function parseDate(
  dateString: string,
  dateStringFormat = "MM/DD/YYYY",
  strict = true
) {
  const date = dayjs(dateString, dateStringFormat, strict);

  if (date.isValid()) {
    return date.toDate();
  }
  return null;
}

export function setToEndOfDay(date: Date) {
  date.setHours(23);
  date.setMinutes(59);
  date.setSeconds(59);
  date.setMilliseconds(999);

  return date;
}

export function setToStartOfDay(date: Date) {
  date.setHours(0);
  date.setMinutes(0);
  date.setSeconds(0);
  date.setMilliseconds(0);

  return date;
}

export function getTermed(number: number, term: string, termPlural: string) {
  return `${number < 3 ? "" : number + " "}${
    number === 1
      ? term + " واحد"
      : number === 2
        ? term + "ان"
        : number < 11
          ? termPlural
          : term + "ا"
  }`;
}

export function getToday() {
  const today = new Date();

  return today;
}

const monthsArabicNames = [
  "يناير",
  "فبراير",
  "مارس",
  "إبريل",
  "مايو",
  "يونيو",
  "يوليو",
  "أغسطس",
  "سبتمبر",
  "أكتوبر",
  "نوفمبر",
  "ديسمبر",
];
export function getMonthArabicName(monthIndex: number) {
  return monthsArabicNames.at(monthIndex % 12);
}
