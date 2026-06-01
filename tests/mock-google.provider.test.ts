import { describe, expect, test } from "vitest";
import { MockGoogleProvider } from "../src/providers/mock-google.provider";
import type { DateRange } from "../src/models/event.model";
import { makeEvent } from "./_fixtures/events";

const RANGE_2024_MAY: DateRange = {
  start: new Date(2024, 4, 1),
  end: new Date(2024, 4, 31, 23, 59),
};

describe("MockGoogleProvider seeds", () => {
  test("ships synthetic google-sourced events", () => {
    const provider = new MockGoogleProvider();
    const all = provider.getAll();
    expect(all.length).toBeGreaterThan(0);
    expect(all.every((e) => e.source === "google")).toBe(true);
    expect(all.every((e) => Boolean(e.googleEventId))).toBe(true);
  });
});

describe("MockGoogleProvider.fetchEvents", () => {
  test("returns only events whose startAt is within range", async () => {
    const provider = new MockGoogleProvider([
      makeEvent({ id: "in", startAt: new Date(2024, 4, 10, 9) }),
      makeEvent({ id: "out", startAt: new Date(2024, 6, 10, 9) }),
    ]);

    const result = await provider.fetchEvents(RANGE_2024_MAY);

    expect(result.map((e) => e.id)).toEqual(["in"]);
  });
});

describe("MockGoogleProvider mutations", () => {
  test("createEvent appends a google event with an id", async () => {
    const provider = new MockGoogleProvider([]);
    const created = await provider.createEvent({
      title: "New",
      category: "personal",
      startAt: new Date(2024, 4, 10, 9),
      endAt: new Date(2024, 4, 10, 10),
    });

    expect(created.source).toBe("google");
    expect(created.googleEventId).toBeDefined();
    expect(provider.getAll()).toHaveLength(1);
  });

  test("updateEvent replaces fields and keeps the id", async () => {
    const provider = new MockGoogleProvider([
      makeEvent({ id: "e1", title: "Old", source: "google" }),
    ]);

    const updated = await provider.updateEvent("e1", { title: "New" });

    expect(updated.title).toBe("New");
    expect(updated.id).toBe("e1");
  });

  test("updateEvent throws for unknown id", async () => {
    const provider = new MockGoogleProvider([]);
    await expect(provider.updateEvent("nope", { title: "x" })).rejects.toThrow(
      /not found/,
    );
  });

  test("deleteEvent removes the event", async () => {
    const provider = new MockGoogleProvider([
      makeEvent({ id: "e1", source: "google" }),
    ]);

    await provider.deleteEvent("e1");

    expect(provider.getAll()).toHaveLength(0);
  });
});
