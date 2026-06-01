import { describe, expect, test } from "vitest";
import { countItems, filterEvents } from "../src/services/filter.service";
import { makeEvent, makeTask } from "./_fixtures/events";

const events = [
  makeEvent({ id: "p1", category: "personal" }),
  makeEvent({ id: "pro1", category: "professional" }),
  makeEvent({ id: "pro2", category: "professional" }),
];

describe("filterEvents", () => {
  test("returns only personal events for the personal filter", () => {
    const result = filterEvents(events, "personal");
    expect(result.map((e) => e.id)).toEqual(["p1"]);
  });

  test("returns only professional events for the professional filter", () => {
    const result = filterEvents(events, "professional");
    expect(result.map((e) => e.id)).toEqual(["pro1", "pro2"]);
  });

  test("returns all events for all and tasks filters", () => {
    expect(filterEvents(events, "all")).toHaveLength(3);
    expect(filterEvents(events, "tasks")).toHaveLength(3);
  });

  test("does not mutate the input array", () => {
    const input = [...events];
    filterEvents(input, "personal");
    expect(input).toHaveLength(3);
  });
});

describe("countItems", () => {
  test("counts events by category and total tasks", () => {
    const tasks = [makeTask({ id: "t1" }), makeTask({ id: "t2" })];
    const counts = countItems(events, tasks);
    expect(counts).toEqual({
      all: 3,
      personal: 1,
      professional: 2,
      tasks: 2,
    });
  });
});
