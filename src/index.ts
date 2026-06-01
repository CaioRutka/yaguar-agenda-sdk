/**
 * `@yaguar/agenda` — top-level entry.
 *
 * Framework-agnostic, isomorphic, zero runtime dependencies. The backend
 * imports everything from here; frontend type-only consumers should prefer
 * `@yaguar/agenda/shared`.
 */

// Models (types + value constants like STATUS_ORDER)
export * from "./models/event.model";
export * from "./models/task.model";
export * from "./models/view.model";
export * from "./models/user.model";

// Utils
export * from "./utils/date.utils";
export * from "./utils/id.utils";

// Providers
export * from "./providers/calendar-provider.interface";
export * from "./providers/meet-provider.interface";
export * from "./providers/email-provider.interface";
export * from "./providers/mock-google.provider";

// Services
export * from "./services/filter.service";
export * from "./services/view.service";
export * from "./services/meeting.service";
export * from "./services/sync.service";
export * from "./services/ics.builder";
export * from "./services/invitation.service";

// Core
export * from "./core/event";
export * from "./core/task";
export * from "./core/agenda";
