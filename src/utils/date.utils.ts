/**
 * Pure, dependency-free date helpers.
 *
 * Week handling is Monday-first to match the frontend calendar.
 * All functions are pure: inputs are never mutated.
 */

import type { DateRange } from "../models/event.model";
import type { ViewMode } from "../models/view.model";

const DAYS_IN_WEEK = 7;
const MONTH_MATRIX_CELLS = 42; // 6 weeks * 7 days

export function startOfDay(date: Date): Date {
  const next = new Date(date.getTime());
  next.setHours(0, 0, 0, 0);
  return next;
}

export function endOfDay(date: Date): Date {
  const next = new Date(date.getTime());
  next.setHours(23, 59, 59, 999);
  return next;
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date.getTime());
  next.setDate(next.getDate() + days);
  return next;
}

export function addMonths(date: Date, months: number): Date {
  const next = new Date(date.getTime());
  next.setMonth(next.getMonth() + months);
  return next;
}

/** Monday-first start of the week, normalized to 00:00:00.000. */
export function startOfWeek(date: Date): Date {
  const day = startOfDay(date);
  const weekday = day.getDay(); // 0 = Sunday .. 6 = Saturday
  const diff = (weekday + 6) % 7; // days since Monday
  return addDays(day, -diff);
}

export function startOfMonth(date: Date): Date {
  const next = startOfDay(date);
  next.setDate(1);
  return next;
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function isSameMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

export function isWithinRange(date: Date, range: DateRange): boolean {
  const time = date.getTime();
  return time >= range.start.getTime() && time <= range.end.getTime();
}

/** Seven dates Monday..Sunday for the week containing `date`. */
export function weekDays(date: Date): Date[] {
  const start = startOfWeek(date);
  return Array.from({ length: DAYS_IN_WEEK }, (_, i) => addDays(start, i));
}

/**
 * 42 dates (6 weeks, Monday-first) covering the month containing `date`,
 * including leading/trailing days from adjacent months.
 */
export function monthMatrix(date: Date): Date[] {
  const gridStart = startOfWeek(startOfMonth(date));
  return Array.from({ length: MONTH_MATRIX_CELLS }, (_, i) =>
    addDays(gridStart, i),
  );
}

/** Inclusive date range covering the given view anchored on `date`. */
export function rangeForView(view: ViewMode, date: Date): DateRange {
  switch (view) {
    case "day":
      return { start: startOfDay(date), end: endOfDay(date) };
    case "week": {
      const days = weekDays(date);
      return {
        start: startOfDay(days[0]!),
        end: endOfDay(days[days.length - 1]!),
      };
    }
    case "month":
    case "kanban": {
      const grid = monthMatrix(date);
      return {
        start: startOfDay(grid[0]!),
        end: endOfDay(grid[grid.length - 1]!),
      };
    }
  }
}
