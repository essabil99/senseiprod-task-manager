import { WorkEnvironmentResponse } from './work-environment.model';

export enum TaskStatus {
  TODO = 'TODO',
  PENDING = 'PENDING',
  DONE = 'DONE'
}

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH'
}

export interface TaskRequest {
  title: string;
  description?: string;
  priority: TaskPriority;
  dueDate?: string;
  workEnvironmentId: number;
}

export interface TaskUpdateRequest {
  title: string;
  description?: string;
  priority: TaskPriority;
  dueDate?: string;
}

export interface StatusUpdateRequest {
  status: TaskStatus;
}

export interface TaskResponse {
  id: number;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  workEnvironment: WorkEnvironmentResponse;
  createdAt: string;
  updatedAt: string;
  statusChangedAt?: string;
  overdue: boolean;
}

export interface TaskPageResponse {
  content: TaskResponse[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface TaskFilterRequest {
  workEnvironmentId?: number;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDateFrom?: string;
  dueDateTo?: string;
  overdue?: boolean;
  searchTerm?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  page?: number;
  size?: number;
}
