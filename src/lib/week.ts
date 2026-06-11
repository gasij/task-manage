import type { WeekDay } from "./types";

export const WEEK_DAYS: WeekDay[] = [0, 1, 2, 3, 4, 5, 6];

const DAY_SHORT = ["ПН", "ВТ", "СР", "ЧТ", "ПТ", "СБ", "ВС"];
const DAY_FULL = [
  "понедельник",
  "вторник",
  "среду",
  "четверг",
  "пятницу",
  "субботу",
  "воскресенье",
];

export function getTodayWeekDay(): WeekDay {
  const jsDay = new Date().getDay();
  return ((jsDay + 6) % 7) as WeekDay;
}

export function getWeekDates(base = new Date()): Date[] {
  const today = getTodayWeekDay();
  const monday = new Date(base);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(base.getDate() - today);

  return WEEK_DAYS.map((i) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    return date;
  });
}

export function getDayShort(day: WeekDay) {
  return DAY_SHORT[day];
}

export function getDayFull(day: WeekDay) {
  return DAY_FULL[day];
}

export function isToday(day: WeekDay) {
  return day === getTodayWeekDay();
}

export function formatSelectedDay(day: WeekDay, dates = getWeekDates()) {
  const date = dates[day];
  const monthFmt = new Intl.DateTimeFormat("ru", { month: "long" });
  return `${getDayShort(day)}, ${date.getDate()} ${monthFmt.format(date)}`;
}

export function formatWeekRange(dates = getWeekDates()) {
  const start = dates[0];
  const end = dates[6];
  const sameMonth = start.getMonth() === end.getMonth();
  const monthFmt = new Intl.DateTimeFormat("ru", { month: "long" });

  if (sameMonth) {
    return `${start.getDate()}–${end.getDate()} ${monthFmt.format(start)}`;
  }

  const startFmt = new Intl.DateTimeFormat("ru", {
    day: "numeric",
    month: "short",
  });
  const endFmt = new Intl.DateTimeFormat("ru", {
    day: "numeric",
    month: "short",
  });
  return `${startFmt.format(start)} – ${endFmt.format(end)}`;
}
