/**
 * Meeting-link provider contract.
 *
 * Implementations turn an event into a join URL (e.g. a Yaguar Meet link).
 */

export interface MeetProvider {
  getMeetingLink(event: { id: string }): string;
}
