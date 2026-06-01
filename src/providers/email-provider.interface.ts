/**
 * Email transport contract.
 *
 * Implementations send a fully-composed message via some email service (Resend,
 * SMTP, SES, …). The SDK depends only on this abstraction — the
 * `InvitationService` builds the message + ICS and hands it here, so swapping
 * providers never touches invite logic.
 */

export interface EmailAddress {
  email: string;
  name?: string;
}

export interface EmailAttachment {
  filename: string;
  /** Raw (un-encoded) attachment content; the provider encodes as needed. */
  content: string;
  /** MIME type, e.g. `text/calendar; method=REQUEST; charset=utf-8`. */
  contentType: string;
}

export interface EmailMessage {
  from: EmailAddress;
  to: EmailAddress[];
  subject: string;
  html: string;
  text: string;
  attachments?: EmailAttachment[];
}

export interface EmailProvider {
  sendEmail(message: EmailMessage): Promise<void>;
}
