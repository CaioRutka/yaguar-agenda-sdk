/**
 * Pure, immutable array operations over Task collections.
 * Every function returns a new array/object; inputs are never mutated.
 */

import type { Task, TaskStatus, UpdateTaskInput } from "../models/task.model";

export function addTask(tasks: readonly Task[], task: Task): Task[] {
  return [...tasks, task];
}

export function updateTask(
  tasks: readonly Task[],
  id: string,
  data: UpdateTaskInput,
): Task[] {
  return tasks.map((task) =>
    task.id === id ? { ...task, ...data, id } : task,
  );
}

export function removeTask(tasks: readonly Task[], id: string): Task[] {
  return tasks.filter((task) => task.id !== id);
}

export function moveTask(
  tasks: readonly Task[],
  id: string,
  status: TaskStatus,
): Task[] {
  return tasks.map((task) => (task.id === id ? { ...task, status } : task));
}

export function findTask(tasks: readonly Task[], id: string): Task | undefined {
  return tasks.find((task) => task.id === id);
}
