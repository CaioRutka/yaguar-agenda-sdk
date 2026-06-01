import { describe, expect, test } from "vitest";
import { AgendaEngine } from "../src/core/agenda";
import { DeterministicMeetProvider } from "../src/services/meeting.service";
import type { WeekView } from "../src/models/view.model";

const BASE_INPUT = {
  title: "Sync meeting",
  category: "professional" as const,
  startAt: new Date(2024, 4, 15, 9),
  endAt: new Date(2024, 4, 15, 10),
};

function seqIdGen(): () => string {
  let counter = 0;
  return () => `id-${(counter += 1)}`;
}

describe("AgendaEngine.createEvent", () => {
  test("generates an id and marks the event as local", () => {
    const engine = new AgendaEngine({ idGen: seqIdGen() });
    const event = engine.createEvent(BASE_INPUT);
    expect(event.id).toBe("id-1");
    expect(event.source).toBe("local");
    expect(engine.getEvents()).toHaveLength(1);
  });

  test("attaches a meeting link when online and a provider is present", () => {
    const engine = new AgendaEngine({
      idGen: seqIdGen(),
      meetProvider: new DeterministicMeetProvider("https://yaguarmeet.famlly.com.br"),
    });
    const event = engine.createEvent({ ...BASE_INPUT, online: true });
    expect(event.meetingLink).toBe("https://yaguarmeet.famlly.com.br/agenda-id-1");
  });

  test("does not attach a link when offline even with a provider", () => {
    const engine = new AgendaEngine({
      idGen: seqIdGen(),
      meetProvider: new DeterministicMeetProvider("https://yaguarmeet.famlly.com.br"),
    });
    const event = engine.createEvent({ ...BASE_INPUT, online: false });
    expect(event.meetingLink).toBeUndefined();
  });

  test("does not attach a link when online but no provider", () => {
    const engine = new AgendaEngine({ idGen: seqIdGen() });
    const event = engine.createEvent({ ...BASE_INPUT, online: true });
    expect(event.meetingLink).toBeUndefined();
  });
});

describe("AgendaEngine event lifecycle", () => {
  test("updateEvent changes fields and deleteEvent removes it", () => {
    const engine = new AgendaEngine({ idGen: seqIdGen() });
    const created = engine.createEvent(BASE_INPUT);

    const updated = engine.updateEvent(created.id, { title: "Renamed" });
    expect(updated?.title).toBe("Renamed");

    engine.deleteEvent(created.id);
    expect(engine.getEvents()).toHaveLength(0);
  });
});

describe("AgendaEngine task lifecycle", () => {
  test("createTask applies defaults", () => {
    const engine = new AgendaEngine({ idGen: seqIdGen() });
    const task = engine.createTask({ title: "Write docs" });
    expect(task.status).toBe("todo");
    expect(task.priority).toBe("medium");
  });

  test("updateTask, moveTask and deleteTask work end to end", () => {
    const engine = new AgendaEngine({ idGen: seqIdGen() });
    const task = engine.createTask({ title: "Write docs" });

    expect(engine.updateTask(task.id, { priority: "high" })?.priority).toBe(
      "high",
    );
    expect(engine.moveTask(task.id, "done")?.status).toBe("done");

    engine.deleteTask(task.id);
    expect(engine.getTasks()).toHaveLength(0);
  });
});

describe("AgendaEngine queries", () => {
  test("getFiltered filters by category", () => {
    const engine = new AgendaEngine({ idGen: seqIdGen() });
    engine.createEvent({ ...BASE_INPUT, category: "personal" });
    engine.createEvent({ ...BASE_INPUT, category: "professional" });

    expect(engine.getFiltered("personal")).toHaveLength(1);
    expect(engine.getFiltered("all")).toHaveLength(2);
  });

  test("getView('week') returns 7 day columns containing the event", () => {
    const engine = new AgendaEngine({ idGen: seqIdGen() });
    engine.createEvent(BASE_INPUT);

    const week = engine.getView("week", new Date(2024, 4, 15)) as WeekView;
    expect(week.days).toHaveLength(7);
    const all = week.days.flatMap((d) => d.events);
    expect(all).toHaveLength(1);
  });

  test("getCounts reflects current events and tasks", () => {
    const engine = new AgendaEngine({ idGen: seqIdGen() });
    engine.createEvent({ ...BASE_INPUT, category: "personal" });
    engine.createTask({ title: "t" });

    expect(engine.getCounts()).toEqual({
      all: 1,
      personal: 1,
      professional: 0,
      tasks: 1,
    });
  });
});

describe("AgendaEngine immutability", () => {
  test("snapshots from getEvents are not affected by later mutations", () => {
    const engine = new AgendaEngine({ idGen: seqIdGen() });
    engine.createEvent(BASE_INPUT);
    const snapshot = engine.getEvents();

    engine.createEvent(BASE_INPUT);

    expect(snapshot).toHaveLength(1);
    expect(engine.getEvents()).toHaveLength(2);
  });

  test("does not mutate the events array passed to the constructor", () => {
    const seed = [
      {
        id: "seed",
        title: "Seed",
        category: "personal" as const,
        startAt: new Date(2024, 4, 15, 9),
        endAt: new Date(2024, 4, 15, 10),
        source: "local" as const,
      },
    ];
    const engine = new AgendaEngine({ events: seed, idGen: seqIdGen() });
    engine.createEvent(BASE_INPUT);

    expect(seed).toHaveLength(1);
  });
});
