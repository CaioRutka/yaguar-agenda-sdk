/**
 * Task domain types.
 *
 * These types MUST stay compatible with the frontend's current types in
 * `agenda/frontend/src/lib/types.ts`.
 */

export type TaskStatus = "todo" | "in_progress" | "done";

export type TaskPriority = "low" | "medium" | "high";

export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate?: Date;
  status: TaskStatus;
  priority: TaskPriority;
  linkedEventId?: string;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  dueDate?: Date;
  status?: TaskStatus;
  priority?: TaskPriority;
  linkedEventId?: string;
}

export type UpdateTaskInput = Partial<Omit<Task, "id">>;

export const STATUS_ORDER: TaskStatus[] = ["todo", "in_progress", "done"];
