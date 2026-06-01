/**
 * Meeting-invitation logic — pure, provider-agnostic.
 *
 * Builds the per-attendee email (subject + HTML + text) and a single ICS
 * (`METHOD:REQUEST`) and sends each through an injected `EmailProvider`. Swapping
 * the email service never touches this logic. One email per attendee (each only
 * sees their own address in `to`); the ICS lists all attendees + the organizer.
 */
import type { CalendarEvent } from "../models/event.model";
import type {
  EmailAddress,
  EmailProvider,
} from "../providers/email-provider.interface";
import { buildEventIcs } from "./ics.builder";

export interface InvitationOptions {
  /** Sender / organizer (e.g. `Yaguar Meet <meet@dominio>`). */
  from: EmailAddress;
  /** IANA timezone used to render the date/time in the email. */
  timezone?: string;
  /** Product name used in the email copy. */
  appName?: string;
}

export interface InvitationResult {
  sent: number;
  failed: number;
}

const DEFAULT_TZ = "America/Sao_Paulo";

function fmtDate(d: Date, tz: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: tz,
  }).format(d);
}

function fmtTime(d: Date, tz: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: tz,
  }).format(d);
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

interface Rendered {
  subject: string;
  html: string;
  text: string;
}

function render(event: CalendarEvent, appName: string, tz: string): Rendered {
  const dateLabel = fmtDate(event.startAt, tz);
  const timeLabel = `${fmtTime(event.startAt, tz)} – ${fmtTime(event.endAt, tz)}`;
  const subject = `Convite: ${event.title}`;
  const guests = (event.attendees ?? []).map((a) => a.name || a.email);

  const detailRow = (label: string, value: string): string =>
    `<tr><td style="padding:6px 0;color:#8a7e66;font:12px/1.4 Arial,sans-serif;text-transform:uppercase;letter-spacing:.06em;width:96px;vertical-align:top">${label}</td>` +
    `<td style="padding:6px 0;color:#1a1206;font:15px/1.5 Arial,sans-serif">${value}</td></tr>`;

  const meetBtn = event.meetingLink
    ? `<tr><td colspan="2" style="padding:14px 0 2px"><a href="${escapeHtml(event.meetingLink)}" style="display:inline-block;background:#c89b40;color:#1a1306;text-decoration:none;font:bold 14px Arial,sans-serif;padding:11px 22px;border-radius:8px">Entrar na sala Yaguar Meet</a></td></tr>`
    : "";

  const html = `<!doctype html><html><body style="margin:0;background:#f4f1ea;padding:24px">
<table role="presentation" width="100%" style="max-width:520px;margin:0 auto;background:#fff;border-radius:14px;overflow:hidden;border:1px solid #e7e1d4">
  <tr><td style="height:5px;background:#c89b40"></td></tr>
  <tr><td style="padding:24px 28px 8px">
    <p style="margin:0 0 4px;color:#c89b40;font:bold 11px Arial,sans-serif;text-transform:uppercase;letter-spacing:.18em">${escapeHtml(appName)} · Convite de reunião</p>
    <h1 style="margin:0;color:#1a1206;font:600 24px Georgia,serif">${escapeHtml(event.title)}</h1>
  </td></tr>
  <tr><td style="padding:8px 28px 24px">
    <table role="presentation" width="100%">
      ${detailRow("Data", escapeHtml(dateLabel))}
      ${detailRow("Horário", escapeHtml(timeLabel))}
      ${event.location && !event.meetingLink ? detailRow("Local", escapeHtml(event.location)) : ""}
      ${event.description ? detailRow("Sobre", escapeHtml(event.description)) : ""}
      ${guests.length ? detailRow("Convidados", escapeHtml(guests.join(", "))) : ""}
      ${meetBtn}
    </table>
    <p style="margin:18px 0 0;color:#8a7e66;font:12px/1.5 Arial,sans-serif">Confirme sua presença respondendo ao convite anexado (.ics) — ele adiciona a reunião ao seu calendário.</p>
  </td></tr>
</table>
</body></html>`;

  const textLines = [
    `${appName} — Convite de reunião`,
    "",
    event.title,
    `Data: ${dateLabel}`,
    `Horário: ${timeLabel}`,
  ];
  if (event.location && !event.meetingLink) textLines.push(`Local: ${event.location}`);
  if (event.meetingLink) textLines.push(`Entrar: ${event.meetingLink}`);
  if (event.description) textLines.push("", event.description);
  if (guests.length) textLines.push("", `Convidados: ${guests.join(", ")}`);
  textLines.push("", "O convite (.ics) anexado adiciona a reunião ao seu calendário.");

  return { subject, html, text: textLines.join("\n") };
}

export class InvitationService {
  constructor(
    private readonly provider: EmailProvider,
    private readonly options: InvitationOptions,
  ) {}

  /** Email every attendee a meeting invitation with an ICS attachment. */
  async sendInvites(event: CalendarEvent): Promise<InvitationResult> {
    const attendees = event.attendees ?? [];
    if (attendees.length === 0) return { sent: 0, failed: 0 };

    const tz = this.options.timezone ?? DEFAULT_TZ;
    const appName = this.options.appName ?? "Yaguar Meet";
    const ics = buildEventIcs(event, this.options.from);
    const { subject, html, text } = render(event, appName, tz);

    let sent = 0;
    let failed = 0;
    for (const a of attendees) {
      try {
        await this.provider.sendEmail({
          from: this.options.from,
          to: [{ email: a.email, name: a.name }],
          subject,
          html,
          text,
          attachments: [
            {
              filename: "convite.ics",
              content: ics,
              contentType: "text/calendar; method=REQUEST; charset=utf-8",
            },
          ],
        });
        sent += 1;
      } catch {
        // Best-effort: one attendee failing must not block the others.
        failed += 1;
      }
    }
    return { sent, failed };
  }
}
