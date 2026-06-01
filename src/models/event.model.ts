/**
 * Calendar event domain types.
 *
 * These types MUST stay compatible with the frontend's current types in
 * `agenda/frontend/src/lib/types.ts`.
 */

export type EventCategory = "personal" | "professional";

export type EventSource = "local" | "google";

export interface Attendee {
  name: string;
  email: string;
  responseStatus?: "accepted" | "declined" | "tentative" | "needs_action";
}

export interface RecurringRule {
  freq: "daily" | "weekly" | "monthly";
  interval: number;
  until?: Date;
  count?: number;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  category: EventCategory;
  startAt: Date;
  endAt: Date;
  location?: string;
  meetingLink?: string;
  /**
   * Meet identity of the event owner. When the event is online this is sent as
   * the Meet room's `createdBy`, so the meeting (history + post-call AI rubric)
   * is tracked under this user.
   */
  ownerId?: string;
  attendees?: Attendee[];
  recurrence?: RecurringRule;
  source: EventSource;
  googleEventId?: string;
  metadata?: Record<string, unknown>;
}

export interface CreateEventInput {
  title: string;
  category: EventCategory;
  startAt: Date;
  endAt: Date;
  description?: string;
  location?: string;
  attendees?: Attendee[];
  /** When true, the engine attaches a meetingLink via the configured MeetProvider. */
  online?: boolean;
  /** Meet identity of the host (room `createdBy`); see CalendarEvent.ownerId. */
  ownerId?: string;
  recurrence?: RecurringRule;
}

export type UpdateEventInput = Partial<Omit<CalendarEvent, "id" | "source">>;

export interface DateRange {
  start: Date;
  end: Date;
}
