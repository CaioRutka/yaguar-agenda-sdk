/**
 * In-memory mock of a Google Calendar provider.
 *
 * Holds synthetic events only. All mutations replace the internal store
 * immutably; no external network or production data is involved.
 */

import type {
  CalendarEvent,
  CreateEventInput,
  DateRange,
  UpdateEventInput,
} from "../models/event.model";
import type { CalendarProvider } from "./calendar-provider.interface";
import { isWithinRange } from "../utils/date.utils";
import { generateId } from "../utils/id.utils";

function seedEvents(): CalendarEvent[] {
  const now = new Date();
  const at = (dayOffset: number, hour: number): Date => {
    const d = new Date(now.getTime());
    d.setDate(d.getDate() + dayOffset);
    d.setHours(hour, 0, 0, 0);
    return d;
  };

  return [
    {
      id: "gcal-standup",
      title: "Daily Standup",
      category: "professional",
      startAt: at(0, 9),
      endAt: at(0, 9),
      source: "google",
      googleEventId: "g_standup_001",
    },
    {
      id: "gcal-dentist",
      title: "Dentist Appointment",
      category: "personal",
      startAt: at(2, 14),
      endAt: at(2, 15),
      location: "Downtown Clinic",
      source: "google",
      googleEventId: "g_dentist_002",
    },
    {
      id: "gcal-review",
      title: "Quarterly Review",
      category: "professional",
      startAt: at(5, 16),
      endAt: at(5, 17),
      source: "google",
      googleEventId: "g_review_003",
    },
  ];
}

export class MockGoogleProvider implements CalendarProvider {
  private store: CalendarEvent[];

  constructor(initial?: CalendarEvent[]) {
    this.store = initial ? [...initial] : seedEvents();
  }

  /** Snapshot of the current synthetic store. */
  getAll(): CalendarEvent[] {
    return [...this.store];
  }

  async fetchEvents(range: DateRange): Promise<CalendarEvent[]> {
    return this.store.filter((event) => isWithinRange(event.startAt, range));
  }

  async createEvent(input: CreateEventInput): Promise<CalendarEvent> {
    const googleEventId = generateId("g");
    const created: CalendarEvent = {
      id: generateId("gcal"),
      title: input.title,
      description: input.description,
      category: input.category,
      startAt: input.startAt,
      endAt: input.endAt,
      location: input.location,
      attendees: input.attendees,
      recurrence: input.recurrence,
      source: "google",
      googleEventId,
    };
    this.store = [...this.store, created];
    return created;
  }

  async updateEvent(id: string, data: UpdateEventInput): Promise<CalendarEvent> {
    const existing = this.store.find((event) => event.id === id);
    if (!existing) {
      throw new Error(`MockGoogleProvider: event "${id}" not found`);
    }
    const updated: CalendarEvent = {
      ...existing,
      ...data,
      id,
      source: "google",
    };
    this.store = this.store.map((event) => (event.id === id ? updated : event));
    return updated;
  }

  async deleteEvent(id: string): Promise<void> {
    this.store = this.store.filter((event) => event.id !== id);
  }
}
