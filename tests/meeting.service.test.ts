import { describe, expect, test } from "vitest";
import {
  DeterministicMeetProvider,
  MeetingService,
} from "../src/services/meeting.service";
import { makeEvent } from "./_fixtures/events";

describe("DeterministicMeetProvider", () => {
  test("builds a stable link from baseUrl and event id", () => {
    const provider = new DeterministicMeetProvider("https://yaguarmeet.famlly.com.br");
    expect(provider.getMeetingLink({ id: "abc" })).toBe(
      "https://yaguarmeet.famlly.com.br/agenda-abc",
    );
  });
});

describe("MeetingService.attachLink", () => {
  test("sets meetingLink without mutating the input event", () => {
    const provider = new DeterministicMeetProvider("https://yaguarmeet.famlly.com.br");
    const service = new MeetingService(provider);
    const event = makeEvent({ id: "xyz" });

    const linked = service.attachLink(event);

    expect(linked.meetingLink).toBe("https://yaguarmeet.famlly.com.br/agenda-xyz");
    expect(event.meetingLink).toBeUndefined();
    expect(linked).not.toBe(event);
  });
});
