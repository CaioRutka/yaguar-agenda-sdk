import type { CalendarEvent } from "../../src/models/event.model";
import type { Task } from "../../src/models/task.model";

export function makeEvent(over: Partial<CalendarEvent> = {}): CalendarEvent {
  return {
    id: "e1",
    title: "Sample Event",
    category: "professional",
    startAt: new Date(2024, 4, 15, 9, 0, 0),
    endAt: new Date(2024, 4, 15, 10, 0, 0),
    source: "local",
    ...over,
  };
}

export function makeTask(over: Partial<Task> = {}): Task {
  return {
    id: "t1",
    title: "Sample Task",
    status: "todo",
    priority: "medium",
    ...over,
  };
}
