import dayjs, { type OpUnitType, type QUnitType } from "dayjs";
import duration from "dayjs/plugin/duration";

dayjs.extend(duration);

export function formatDate(date: number | string | Date, format = "YYYY/MM/DD") {
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
  unit: QUnitType | OpUnitType = "days",
) {
  return dayjs(end).diff(dayjs(start), unit);
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
  today.setHours(23);
  today.setMinutes(59);
  today.setSeconds(59);
  today.setMilliseconds(999);

  return today;
}
