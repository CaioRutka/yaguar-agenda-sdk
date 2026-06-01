/**
 * Pure view builders: group events/tasks into day, week, month, kanban shapes.
 */

import type { CalendarEvent } from "../models/event.model";
import type { Task } from "../models/task.model";
import { STATUS_ORDER } from "../models/task.model";
import type {
  DayColumn,
  KanbanColumn,
  MonthCell,
  MonthView,
  WeekView,
} from "../models/view.model";
import {
  isSameDay,
  isSameMonth,
  monthMatrix,
  weekDays,
} from "../utils/date.utils";

const DAYS_IN_WEEK = 7;

function eventsOnDay(
  events: readonly CalendarEvent[],
  date: Date,
): CalendarEvent[] {
  return events.filter((event) => isSameDay(event.startAt, date));
}

export function buildDayView(
  events: readonly CalendarEvent[],
  date: Date,
): DayColumn {
  return { date, events: eventsOnDay(events, date) };
}

export function buildWeekView(
  events: readonly CalendarEvent[],
  date: Date,
): WeekView {
  const days = weekDays(date).map<DayColumn>((day) => ({
    date: day,
    events: eventsOnDay(events, day),
  }));
  return { days };
}

export function buildMonthView(
  events: readonly CalendarEvent[],
  date: Date,
): MonthView {
  const cells = monthMatrix(date).map<MonthCell>((cell) => ({
    date: cell,
    inMonth: isSameMonth(cell, date),
    events: eventsOnDay(events, cell),
  }));

  const weeks: MonthCell[][] = [];
  for (let i = 0; i < cells.length; i += DAYS_IN_WEEK) {
    weeks.push(cells.slice(i, i + DAYS_IN_WEEK));
  }
  return { weeks };
}

export function buildKanban(tasks: readonly Task[]): KanbanColumn[] {
  return STATUS_ORDER.map<KanbanColumn>((status) => ({
    status,
    tasks: tasks.filter((task) => task.status === status),
  }));
}
