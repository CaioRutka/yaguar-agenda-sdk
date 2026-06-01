/**
 * Pure, immutable array operations over CalendarEvent collections.
 * Every function returns a new array/object; inputs are never mutated.
 */

import type { CalendarEvent, UpdateEventInput } from "../models/event.model";

export function addEvent(
  events: readonly CalendarEvent[],
  event: CalendarEvent,
): CalendarEvent[] {
  return [...events, event];
}

export function updateEvent(
  events: readonly CalendarEvent[],
  id: string,
  data: UpdateEventInput,
): CalendarEvent[] {
  return events.map((event) =>
    event.id === id ? { ...event, ...data, id } : event,
  );
}

export function removeEvent(
  events: readonly CalendarEvent[],
  id: string,
): CalendarEvent[] {
  return events.filter((event) => event.id !== id);
}

export function findEvent(
  events: readonly CalendarEvent[],
  id: string,
): CalendarEvent | undefined {
  return events.find((event) => event.id === id);
}
