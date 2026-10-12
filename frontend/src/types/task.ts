// Task types matching the API DTOs

export type TaskPriority = 'High' | 'Medium' | 'Low';

export interface Task {
  id: number;
  title: string;
  description?: string;
  dueDate?: string;
  category?: string;
  priority?: TaskPriority;
  statusCode: string;
  createdDate: string;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  dueDate?: string;
  category?: string;
  priority?: TaskPriority | '';
}

/** Status is changed through complete/uncomplete, not here. */
export interface UpdateTaskRequest extends CreateTaskRequest {
  id: number;
}
