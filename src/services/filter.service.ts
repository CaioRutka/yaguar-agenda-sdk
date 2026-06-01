/**
 * Pure filtering and counting helpers for events and tasks.
 */

import type { CalendarEvent } from "../models/event.model";
import type { Task } from "../models/task.model";
import type { FilterCounts, FilterType } from "../models/view.model";

export function filterEvents(
  events: readonly CalendarEvent[],
  filter: FilterType,
): CalendarEvent[] {
  switch (filter) {
    case "personal":
      return events.filter((event) => event.category === "personal");
    case "professional":
      return events.filter((event) => event.category === "professional");
    case "all":
    case "tasks":
      return [...events];
  }
}

export function countItems(
  events: readonly CalendarEvent[],
  tasks: readonly Task[],
): FilterCounts {
  return {
    all: events.length,
    personal: events.filter((event) => event.category === "personal").length,
    professional: events.filter((event) => event.category === "professional")
      .length,
    tasks: tasks.length,
  };
}
