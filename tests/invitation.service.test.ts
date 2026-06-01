import { describe, expect, test } from "vitest";
import type { CalendarEvent } from "../src/models/event.model";
import type {
  EmailMessage,
  EmailProvider,
} from "../src/providers/email-provider.interface";
import { InvitationService } from "../src/services/invitation.service";

const from = { email: "meet@yaguar.app", name: "Yaguar Meet" };

const event: CalendarEvent = {
  id: "e1",
  title: "Daily",
  category: "professional",
  startAt: new Date("2026-06-01T12:00:00Z"),
  endAt: new Date("2026-06-01T12:30:00Z"),
  meetingLink: "https://yaguarmeet.famlly.com.br/abc",
  attendees: [
    { name: "Ana", email: "ana@x.com" },
    { name: "Beto", email: "beto@x.com" },
  ],
  source: "local",
};

function capturing() {
  const sent: EmailMessage[] = [];
  const provider: EmailProvider = {
    async sendEmail(m) {
      sent.push(m);
    },
  };
  return { provider, sent };
}

describe("InvitationService", () => {
  test("sends one email per attendee, each with the ICS attachment + meeting link", async () => {
    const { provider, sent } = capturing();
    const result = await new InvitationService(provider, { from }).sendInvites(event);

    expect(result).toEqual({ sent: 2, failed: 0 });
    expect(sent).toHaveLength(2);
    expect(sent[0].to).toEqual([{ email: "ana@x.com", name: "Ana" }]);
    expect(sent[1].to).toEqual([{ email: "beto@x.com", name: "Beto" }]);
    expect(sent[0].subject).toBe("Convite: Daily");
    expect(sent[0].from).toEqual(from);
    expect(sent[0].attachments?.[0].filename).toBe("convite.ics");
    expect(sent[0].attachments?.[0].contentType).toContain("text/calendar");
    expect(sent[0].attachments?.[0].content).toContain("METHOD:REQUEST");
    expect(sent[0].html).toContain("yaguarmeet.famlly.com.br/abc");
    expect(sent[0].text).toContain("Daily");
  });

  test("no attendees → sends nothing", async () => {
    const { provider, sent } = capturing();
    const result = await new InvitationService(provider, { from }).sendInvites({
      ...event,
      attendees: [],
    });
    expect(result).toEqual({ sent: 0, failed: 0 });
    expect(sent).toHaveLength(0);
  });

  test("best-effort: one provider failure is counted, the rest still send", async () => {
    let n = 0;
    const provider: EmailProvider = {
      async sendEmail() {
        n += 1;
        if (n === 1) throw new Error("transient");
      },
    };
    const result = await new InvitationService(provider, { from }).sendInvites(event);
    expect(result).toEqual({ sent: 1, failed: 1 });
  });
});
