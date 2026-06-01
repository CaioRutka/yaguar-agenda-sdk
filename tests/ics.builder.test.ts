import { describe, expect, test } from "vitest";
import type { CalendarEvent } from "../src/models/event.model";
import { buildEventIcs, toIcsDate } from "../src/services/ics.builder";

const organizer = { email: "meet@yaguar.app", name: "Yaguar Meet" };

const event: CalendarEvent = {
  id: "evt-1",
  title: "Reunião; com, vírgula",
  description: "Linha1\nLinha2",
  category: "professional",
  startAt: new Date("2026-06-01T12:00:00.000Z"),
  endAt: new Date("2026-06-01T13:00:00.000Z"),
  meetingLink: "https://yaguarmeet.famlly.com.br/abc",
  attendees: [
    { name: "Ana Lima", email: "ana@x.com" },
    { name: "Beto", email: "beto@x.com" },
  ],
  source: "local",
};

describe("buildEventIcs", () => {
  test("toIcsDate formats a UTC zulu stamp", () => {
    expect(toIcsDate(new Date("2026-06-01T12:00:00Z"))).toBe("20260601T120000Z");
  });

  test("produces a METHOD:REQUEST VEVENT with the required fields", () => {
    const ics = buildEventIcs(event, organizer, new Date("2026-05-31T00:00:00Z"));
    // Unfold (RFC 5545 line folding) before asserting on full content lines.
    const flat = ics.replace(/\r\n /g, "");
    expect(flat).toContain("BEGIN:VCALENDAR");
    expect(flat).toContain("METHOD:REQUEST");
    expect(flat).toContain("UID:evt-1@yaguar.agenda");
    expect(flat).toContain("DTSTAMP:20260531T000000Z");
    expect(flat).toContain("DTSTART:20260601T120000Z");
    expect(flat).toContain("DTEND:20260601T130000Z");
    expect(flat).toContain('ORGANIZER;CN="Yaguar Meet":mailto:meet@yaguar.app');
    expect(flat).toContain(
      'ATTENDEE;ROLE=REQ-PARTICIPANT;PARTSTAT=NEEDS-ACTION;RSVP=TRUE;CN="Ana Lima":mailto:ana@x.com',
    );
    expect(flat).toContain("END:VEVENT");
    expect(flat).toContain("END:VCALENDAR");
    expect(ics).toContain("\r\n");
  });

  test("escapes TEXT special characters", () => {
    const ics = buildEventIcs(event, organizer);
    expect(ics).toContain("SUMMARY:Reunião\\; com\\, vírgula");
    expect(ics).toContain("Linha1\\nLinha2");
  });

  test("uses the meeting link as LOCATION and URL", () => {
    const ics = buildEventIcs(event, organizer);
    expect(ics).toContain("URL:https://yaguarmeet.famlly.com.br/abc");
    expect(ics).toContain("LOCATION:https://yaguarmeet.famlly.com.br/abc");
  });

  test("folds long content lines to <= 75 characters", () => {
    const ics = buildEventIcs({ ...event, title: "A".repeat(120) }, organizer);
    for (const line of ics.split("\r\n")) {
      expect(line.length).toBeLessThanOrEqual(75);
    }
  });
});
