import { describe, expect, test } from "vitest";
import {
  addDays,
  addMonths,
  endOfDay,
  isSameDay,
  isSameMonth,
  isWithinRange,
  monthMatrix,
  rangeForView,
  startOfDay,
  startOfMonth,
  startOfWeek,
  weekDays,
} from "../src/utils/date.utils";

// Wednesday, 2024-05-15 12:30
const WEDNESDAY = new Date(2024, 4, 15, 12, 30, 0, 0);
const MS_PER_DAY = 24 * 60 * 60 * 1000;

describe("startOfDay / endOfDay", () => {
  test("normalizes to start and end of the day", () => {
    expect(startOfDay(WEDNESDAY).getHours()).toBe(0);
    expect(startOfDay(WEDNESDAY).getMinutes()).toBe(0);
    expect(endOfDay(WEDNESDAY).getHours()).toBe(23);
    expect(endOfDay(WEDNESDAY).getMilliseconds()).toBe(999);
  });

  test("does not mutate the input", () => {
    const input = new Date(WEDNESDAY.getTime());
    startOfDay(input);
    expect(input.getHours()).toBe(12);
  });
});

describe("addDays / addMonths", () => {
  test("adds and subtracts days", () => {
    expect(addDays(WEDNESDAY, 1).getDate()).toBe(16);
    expect(addDays(WEDNESDAY, -1).getDate()).toBe(14);
  });

  test("adds months", () => {
    expect(addMonths(WEDNESDAY, 1).getMonth()).toBe(5);
  });
});

describe("startOfWeek", () => {
  test("returns the Monday of the week", () => {
    const monday = startOfWeek(WEDNESDAY);
    expect(monday.getDay()).toBe(1); // Monday
    expect(monday.getDate()).toBe(13);
    expect(monday.getHours()).toBe(0);
  });

  test("treats Sunday as the last day of the previous Monday-week", () => {
    const sunday = new Date(2024, 4, 19, 10, 0, 0); // Sunday 2024-05-19
    const monday = startOfWeek(sunday);
    expect(monday.getDate()).toBe(13);
  });
});

describe("startOfMonth", () => {
  test("returns first day of the month at midnight", () => {
    const first = startOfMonth(WEDNESDAY);
    expect(first.getDate()).toBe(1);
    expect(first.getMonth()).toBe(4);
    expect(first.getHours()).toBe(0);
  });
});

describe("weekDays", () => {
  test("returns 7 dates Monday..Sunday", () => {
    const days = weekDays(WEDNESDAY);
    expect(days).toHaveLength(7);
    expect(days[0]!.getDay()).toBe(1); // Monday
    expect(days[6]!.getDay()).toBe(0); // Sunday
  });

  test("is strictly increasing by one day", () => {
    const days = weekDays(WEDNESDAY);
    for (let i = 1; i < days.length; i += 1) {
      expect(days[i]!.getTime() - days[i - 1]!.getTime()).toBe(MS_PER_DAY);
    }
  });
});

describe("monthMatrix", () => {
  test("returns 42 dates (6 weeks)", () => {
    expect(monthMatrix(WEDNESDAY)).toHaveLength(42);
  });

  test("starts on a Monday", () => {
    expect(monthMatrix(WEDNESDAY)[0]!.getDay()).toBe(1);
  });

  test("contains the first day of the month", () => {
    const grid = monthMatrix(WEDNESDAY);
    const hasFirst = grid.some((d) => d.getDate() === 1 && d.getMonth() === 4);
    expect(hasFirst).toBe(true);
  });
});

describe("rangeForView", () => {
  test("day spans a single day", () => {
    const range = rangeForView("day", WEDNESDAY);
    expect(isSameDay(range.start, WEDNESDAY)).toBe(true);
    expect(isSameDay(range.end, WEDNESDAY)).toBe(true);
    expect(range.start.getHours()).toBe(0);
    expect(range.end.getHours()).toBe(23);
  });

  test("week spans Monday to Sunday", () => {
    const range = rangeForView("week", WEDNESDAY);
    expect(range.start.getDay()).toBe(1);
    expect(range.end.getDay()).toBe(0);
  });

  test("month and kanban span the 6-week grid", () => {
    const month = rangeForView("month", WEDNESDAY);
    const kanban = rangeForView("kanban", WEDNESDAY);
    expect(month.start.getDay()).toBe(1);
    expect(month.start.getTime()).toBe(kanban.start.getTime());
    expect(month.end.getTime()).toBe(kanban.end.getTime());
  });
});

describe("isWithinRange", () => {
  test("includes the boundaries", () => {
    const range = { start: startOfDay(WEDNESDAY), end: endOfDay(WEDNESDAY) };
    expect(isWithinRange(range.start, range)).toBe(true);
    expect(isWithinRange(range.end, range)).toBe(true);
  });

  test("excludes dates outside the range", () => {
    const range = { start: startOfDay(WEDNESDAY), end: endOfDay(WEDNESDAY) };
    expect(isWithinRange(addDays(WEDNESDAY, 1), range)).toBe(false);
    expect(isWithinRange(addDays(WEDNESDAY, -1), range)).toBe(false);
  });
});

describe("isSameDay / isSameMonth", () => {
  test("isSameDay ignores time", () => {
    expect(isSameDay(WEDNESDAY, new Date(2024, 4, 15, 23, 59))).toBe(true);
    expect(isSameDay(WEDNESDAY, addDays(WEDNESDAY, 1))).toBe(false);
  });

  test("isSameMonth ignores day", () => {
    expect(isSameMonth(WEDNESDAY, new Date(2024, 4, 1))).toBe(true);
    expect(isSameMonth(WEDNESDAY, new Date(2024, 5, 15))).toBe(false);
  });
});
