/**
 * AgendaEngine — the main framework-agnostic facade.
 *
 * Holds events and tasks in memory. Every mutating operation replaces the
 * internal arrays immutably (the previous arrays are never mutated), so a
 * consumer that captured `getEvents()` keeps a stable snapshot.
 */

import type {
  CalendarEvent,
  CreateEventInput,
  UpdateEventInput,
} from "../models/event.model";
import type {
  CreateTaskInput,
  Task,
  TaskStatus,
  UpdateTaskInput,
} from "../models/task.model";
import type {
  DayColumn,
  FilterCounts,
  FilterType,
  KanbanColumn,
  MonthView,
  ViewMode,
  WeekView,
} from "../models/view.model";
import type { MeetProvider } from "../providers/meet-provider.interface";
import { generateId } from "../utils/id.utils";
import * as eventOps from "./event";
import * as taskOps from "./task";
import { countItems, filterEvents } from "../services/filter.service";
import { MeetingService } from "../services/meeting.service";
import {
  buildDayView,
  buildKanban,
  buildMonthView,
  buildWeekView,
} from "../services/view.service";

export interface AgendaEngineOptions {
  events?: CalendarEvent[];
  tasks?: Task[];
  meetProvider?: MeetProvider;
  idGen?: () => string;
}

export type AgendaView = DayColumn | WeekView | MonthView | KanbanColumn[];

export class AgendaEngine {
  private events: CalendarEvent[];
  private tasks: Task[];
  private readonly meeting?: MeetingService;
  private readonly idGen: () => string;

  constructor(options: AgendaEngineOptions = {}) {
    this.events = options.events ? [...options.events] : [];
    this.tasks = options.tasks ? [...options.tasks] : [];
    this.meeting = options.meetProvider
      ? new MeetingService(options.meetProvider)
      : undefined;
    this.idGen = options.idGen ?? ((): string => generateId("evt"));
  }

  getEvents(): CalendarEvent[] {
    return [...this.events];
  }

  getTasks(): Task[] {
    return [...this.tasks];
  }

  createEvent(input: CreateEventInput): CalendarEvent {
    const base: CalendarEvent = {
      id: this.idGen(),
      title: input.title,
      description: input.description,
      category: input.category,
      startAt: input.startAt,
      endAt: input.endAt,
      location: input.location,
      ownerId: input.ownerId,
      attendees: input.attendees,
      recurrence: input.recurrence,
      source: "local",
    };

    const event =
      input.online && this.meeting ? this.meeting.attachLink(base) : base;

    this.events = eventOps.addEvent(this.events, event);
    return event;
  }

  updateEvent(id: string, data: UpdateEventInput): CalendarEvent | undefined {
    this.events = eventOps.updateEvent(this.events, id, data);
    return eventOps.findEvent(this.events, id);
  }

  deleteEvent(id: string): void {
    this.events = eventOps.removeEvent(this.events, id);
  }

  createTask(input: CreateTaskInput): Task {
    const task: Task = {
      id: this.idGen(),
      title: input.title,
      description: input.description,
      dueDate: input.dueDate,
      status: input.status ?? "todo",
      priority: input.priority ?? "medium",
      linkedEventId: input.linkedEventId,
    };
    this.tasks = taskOps.addTask(this.tasks, task);
    return task;
  }

  updateTask(id: string, data: UpdateTaskInput): Task | undefined {
    this.tasks = taskOps.updateTask(this.tasks, id, data);
    return taskOps.findTask(this.tasks, id);
  }

  deleteTask(id: string): void {
    this.tasks = taskOps.removeTask(this.tasks, id);
  }

  moveTask(id: string, status: TaskStatus): Task | undefined {
    this.tasks = taskOps.moveTask(this.tasks, id, status);
    return taskOps.findTask(this.tasks, id);
  }

  getFiltered(filter: FilterType): CalendarEvent[] {
    return filterEvents(this.events, filter);
  }

  getView(view: ViewMode, date: Date): AgendaView {
    switch (view) {
      case "day":
        return buildDayView(this.events, date);
      case "week":
        return buildWeekView(this.events, date);
      case "month":
        return buildMonthView(this.events, date);
      case "kanban":
        return buildKanban(this.tasks);
    }
  }

  getCounts(): FilterCounts {
    return countItems(this.events, this.tasks);
  }
}
