/**
 * View / presentation domain types (day, week, month, kanban, filters).
 */

import type { CalendarEvent } from "./event.model";
import type { Task, TaskStatus } from "./task.model";

export type ViewMode = "day" | "week" | "month" | "kanban";

export type FilterType = "all" | "personal" | "professional" | "tasks";

export interface DayColumn {
  date: Date;
  events: CalendarEvent[];
}

export interface WeekView {
  days: DayColumn[];
}

export interface MonthCell {
  date: Date;
  inMonth: boolean;
  events: CalendarEvent[];
}

export interface MonthView {
  weeks: MonthCell[][];
}

export interface KanbanColumn {
  status: TaskStatus;
  tasks: Task[];
}

export interface FilterCounts {
  all: number;
  personal: number;
  professional: number;
  tasks: number;
}
