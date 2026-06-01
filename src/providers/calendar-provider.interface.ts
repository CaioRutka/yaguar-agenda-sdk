/**
 * Calendar provider contract.
 *
 * Implementations bridge the SDK to an external calendar source (Google,
 * Outlook, a mock, etc). The SDK depends only on this abstraction.
 */

import type {
  CalendarEvent,
  CreateEventInput,
  DateRange,
  UpdateEventInput,
} from "../models/event.model";

export type SyncDirection = "push" | "pull" | "bidirectional";

export interface SyncResult {
  pulled: number;
  pushed: number;
  conflicts: number;
}

export interface CalendarProvider {
  fetchEvents(range: DateRange): Promise<CalendarEvent[]>;
  createEvent(input: CreateEventInput): Promise<CalendarEvent>;
  updateEvent(id: string, data: UpdateEventInput): Promise<CalendarEvent>;
  deleteEvent(id: string): Promise<void>;
}
