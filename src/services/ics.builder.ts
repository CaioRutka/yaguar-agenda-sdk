/**
 * Hand-built iCalendar (RFC 5545) generator — pure, zero-dependency, isomorphic.
 *
 * Produces a `METHOD:REQUEST` VEVENT so email clients (Gmail/Outlook) render the
 * attachment as a meeting invitation with Accept/Decline and add it to the
 * recipient's calendar. No `ics` npm package — the SDK stays dependency-free.
 */
import type { CalendarEvent } from "../models/event.model";
import type { EmailAddress } from "../providers/email-provider.interface";

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

/** Date → iCalendar UTC stamp `YYYYMMDDTHHMMSSZ`. */
export function toIcsDate(d: Date): string {
  return (
    `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}` +
    `T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`
  );
}

/** Escape a TEXT value per RFC 5545 (backslash first). */
function escapeText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

/** Quote a parameter value (CN) and strip any embedded double quotes. */
function quoteParam(value: string): string {
  return `"${value.replace(/"/g, "")}"`;
}

/** Fold a content line to <=75 chars with CRLF + single-space continuation. */
function fold(line: string): string {
  if (line.length <= 75) return line;
  const parts: string[] = [];
  let rest = line.slice(75);
  parts.push(line.slice(0, 75));
  while (rest.length > 0) {
    parts.push(` ${rest.slice(0, 74)}`);
    rest = rest.slice(74);
  }
  return parts.join("\r\n");
}

function mailto(addr: EmailAddress, params: string): string {
  const cn = addr.name ? `;CN=${quoteParam(addr.name)}` : "";
  return `${params}${cn}:mailto:${addr.email}`;
}

/**
 * Build an `.ics` invitation (METHOD:REQUEST) for `event`, organized by
 * `organizer`. `now` is injectable for deterministic tests (DTSTAMP).
 */
export function buildEventIcs(
  event: CalendarEvent,
  organizer: EmailAddress,
  now: Date = new Date(),
): string {
  const descriptionParts: string[] = [];
  if (event.description) descriptionParts.push(event.description);
  if (event.meetingLink) descriptionParts.push(`Entrar na sala: ${event.meetingLink}`);
  const description = descriptionParts.join("\n");
  const location = event.meetingLink ?? event.location ?? "";

  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Yaguar//Agenda//PT-BR",
    "CALSCALE:GREGORIAN",
    "METHOD:REQUEST",
    "BEGIN:VEVENT",
    `UID:${event.id}@yaguar.agenda`,
    `DTSTAMP:${toIcsDate(now)}`,
    `DTSTART:${toIcsDate(event.startAt)}`,
    `DTEND:${toIcsDate(event.endAt)}`,
    "SEQUENCE:0",
    "STATUS:CONFIRMED",
    "TRANSP:OPAQUE",
    `SUMMARY:${escapeText(event.title)}`,
  ];

  if (description) lines.push(`DESCRIPTION:${escapeText(description)}`);
  if (location) lines.push(`LOCATION:${escapeText(location)}`);
  if (event.meetingLink) lines.push(`URL:${event.meetingLink}`);

  lines.push(`ORGANIZER${mailto(organizer, "")}`);
  for (const a of event.attendees ?? []) {
    lines.push(
      mailto(
        { email: a.email, name: a.name },
        "ATTENDEE;ROLE=REQ-PARTICIPANT;PARTSTAT=NEEDS-ACTION;RSVP=TRUE",
      ),
    );
  }

  lines.push("END:VEVENT", "END:VCALENDAR");

  return lines.map(fold).join("\r\n");
}
