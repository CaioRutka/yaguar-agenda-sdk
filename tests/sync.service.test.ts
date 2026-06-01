import { describe, expect, test } from "vitest";
import { SyncService } from "../src/services/sync.service";
import { MockGoogleProvider } from "../src/providers/mock-google.provider";
import type { CalendarEvent, DateRange } from "../src/models/event.model";
import { makeEvent } from "./_fixtures/events";

const WIDE_RANGE: DateRange = {
  start: new Date(2000, 0, 1),
  end: new Date(2100, 0, 1),
};

function providerWith(events: CalendarEvent[]): MockGoogleProvider {
  return new MockGoogleProvider(events);
}

describe("SyncService pull", () => {
  test("merges remote events into the local list", async () => {
    const remote = makeEvent({
      id: "r1",
      source: "google",
      googleEventId: "g_r1",
    });
    const service = new SyncService(providerWith([remote]));

    const { events, result } = await service.sync([], WIDE_RANGE, "pull");

    expect(result.pulled).toBe(1);
    expect(events.map((e) => e.id)).toContain("r1");
  });

  test("counts a conflict and lets remote win when keys collide", async () => {
    const local = makeEvent({
      id: "shared",
      title: "Local Title",
      googleEventId: "g_shared",
    });
    const remote = makeEvent({
      id: "shared",
      title: "Remote Title",
      source: "google",
      googleEventId: "g_shared",
    });
    const service = new SyncService(providerWith([remote]));

    const { events, result } = await service.sync([local], WIDE_RANGE, "pull");

    expect(result.conflicts).toBe(1);
    const merged = events.find((e) => e.googleEventId === "g_shared");
    expect(merged?.title).toBe("Remote Title");
    expect(events).toHaveLength(1);
  });
});

describe("SyncService push", () => {
  test("counts local events without googleEventId as pushed", async () => {
    const local = [
      makeEvent({ id: "a" }), // no googleEventId
      makeEvent({ id: "b", googleEventId: "g_b" }),
    ];
    const service = new SyncService(providerWith([]));

    const { result } = await service.sync(local, WIDE_RANGE, "push");

    expect(result.pushed).toBe(1);
    expect(result.pulled).toBe(0);
  });
});

describe("SyncService bidirectional", () => {
  test("pulls and pushes in one pass", async () => {
    const local = [makeEvent({ id: "local-only" })];
    const remote = makeEvent({
      id: "remote-only",
      source: "google",
      googleEventId: "g_remote",
    });
    const service = new SyncService(providerWith([remote]));

    const { events, result } = await service.sync(
      local,
      WIDE_RANGE,
      "bidirectional",
    );

    expect(result.pulled).toBe(1);
    expect(result.pushed).toBe(1);
    expect(events.map((e) => e.id).sort()).toEqual([
      "local-only",
      "remote-only",
    ]);
  });
});

describe("SyncService immutability", () => {
  test("does not mutate the local events array", async () => {
    const local = [makeEvent({ id: "x" })];
    const snapshot = [...local];
    const service = new SyncService(providerWith([]));

    await service.sync(local, WIDE_RANGE, "pull");

    expect(local).toEqual(snapshot);
  });
});
