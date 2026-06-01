/**
 * Meeting-link generation.
 *
 * `DeterministicMeetProvider` builds a stable Yaguar Meet URL from an event id.
 * `MeetingService` attaches that link to an event without mutating the input.
 */

import type { CalendarEvent } from "../models/event.model";
import type { MeetProvider } from "../providers/meet-provider.interface";

export class DeterministicMeetProvider implements MeetProvider {
  constructor(private readonly baseUrl: string) {}

  getMeetingLink(event: { id: string }): string {
    return `${this.baseUrl}/agenda-${event.id}`;
  }
}

export class MeetingService {
  constructor(private readonly provider: MeetProvider) {}

  attachLink(event: CalendarEvent): CalendarEvent {
    return { ...event, meetingLink: this.provider.getMeetingLink(event) };
  }
}
