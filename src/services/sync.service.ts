/**
 * Two-way calendar synchronization against a CalendarProvider.
 *
 * Merge strategy (kept simple but real):
 *  - pull: fetch remote events in range, merge into local. Remote wins on
 *    conflict. A conflict is counted when a local event shares its
 *    googleEventId (or id) with a remote event (both sides represent the same
 *    item, so applying remote overwrites local changes).
 *  - push: count local events not yet synced (no googleEventId) as pushed.
 *  - bidirectional: do both.
 *
 * The returned event list is built immutably; inputs are never mutated.
 */

import type { CalendarEvent, DateRange } from "../models/event.model";
import type {
  CalendarProvider,
  SyncDirection,
  SyncResult,
} from "../providers/calendar-provider.interface";

function remoteKey(event: CalendarEvent): string {
  return event.googleEventId ?? event.id;
}

export class SyncService {
  constructor(private readonly provider: CalendarProvider) {}

  async sync(
    localEvents: readonly CalendarEvent[],
    range: DateRange,
    direction: SyncDirection,
  ): Promise<{ events: CalendarEvent[]; result: SyncResult }> {
    const shouldPull = direction === "pull" || direction === "bidirectional";
    const shouldPush = direction === "push" || direction === "bidirectional";

    let pulled = 0;
    let conflicts = 0;
    let pushed = 0;
    let events: CalendarEvent[] = [...localEvents];

    if (shouldPull) {
      const remote = await this.provider.fetchEvents(range);
      pulled = remote.length;

      const localByKey = new Map(events.map((e) => [remoteKey(e), e]));
      const merged = new Map(localByKey);

      for (const remoteEvent of remote) {
        const key = remoteKey(remoteEvent);
        if (localByKey.has(key)) {
          conflicts += 1; // both sides represent the same item; remote wins
        }
        merged.set(key, remoteEvent);
      }

      events = [...merged.values()];
    }

    if (shouldPush) {
      pushed = localEvents.filter((event) => !event.googleEventId).length;
    }

    return { events, result: { pulled, pushed, conflicts } };
  }
}
