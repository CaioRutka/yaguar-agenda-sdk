import { describe, expect, test } from "vitest";
import {
  buildDayView,
  buildKanban,
  buildMonthView,
  buildWeekView,
} from "../src/services/view.service";
import { makeEvent, makeTask } from "./_fixtures/events";

// Wednesday 2024-05-15
const ANCHOR = new Date(2024, 4, 15, 12, 0, 0);

describe("buildDayView", () => {
  test("includes only events on the given day", () => {
    const events = [
      makeEvent({ id: "today", startAt: new Date(2024, 4, 15, 9) }),
      makeEvent({ id: "tomorrow", startAt: new Date(2024, 4, 16, 9) }),
    ];
    const day = buildDayView(events, ANCHOR);
    expect(day.events.map((e) => e.id)).toEqual(["today"]);
  });
});

describe("buildWeekView", () => {
  test("groups events into their correct weekday columns", () => {
    const events = [
      makeEvent({ id: "mon", startAt: new Date(2024, 4, 13, 9) }),
      makeEvent({ id: "wed", startAt: new Date(2024, 4, 15, 9) }),
      makeEvent({ id: "sun", startAt: new Date(2024, 4, 19, 9) }),
    ];
    const week = buildWeekView(events, ANCHOR);
    expect(week.days).toHaveLength(7);
    expect(week.days[0]!.events.map((e) => e.id)).toEqual(["mon"]);
    expect(week.days[2]!.events.map((e) => e.id)).toEqual(["wed"]);
    expect(week.days[6]!.events.map((e) => e.id)).toEqual(["sun"]);
  });
});

describe("buildMonthView", () => {
  test("produces a 6x7 grid", () => {
    const view = buildMonthView([], ANCHOR);
    expect(view.weeks).toHaveLength(6);
    view.weeks.forEach((w) => expect(w).toHaveLength(7));
  });

  test("flags cells in and out of the anchor month", () => {
    const view = buildMonthView([], ANCHOR);
    const inMonth = view.weeks.flat().filter((c) => c.inMonth);
    expect(inMonth.every((c) => c.date.getMonth() === 4)).toBe(true);
    const outMonth = view.weeks.flat().filter((c) => !c.inMonth);
    expect(outMonth.every((c) => c.date.getMonth() !== 4)).toBe(true);
  });
});

describe("buildKanban", () => {
  test("groups tasks by status preserving STATUS_ORDER", () => {
    const tasks = [
      makeTask({ id: "a", status: "done" }),
      makeTask({ id: "b", status: "todo" }),
      makeTask({ id: "c", status: "in_progress" }),
      makeTask({ id: "d", status: "todo" }),
    ];
    const columns = buildKanban(tasks);
    expect(columns.map((c) => c.status)).toEqual([
      "todo",
      "in_progress",
      "done",
    ]);
    expect(columns[0]!.tasks.map((t) => t.id)).toEqual(["b", "d"]);
    expect(columns[1]!.tasks.map((t) => t.id)).toEqual(["c"]);
    expect(columns[2]!.tasks.map((t) => t.id)).toEqual(["a"]);
  });
});
