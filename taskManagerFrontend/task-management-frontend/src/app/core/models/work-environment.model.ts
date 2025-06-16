import { UserResponse } from '../../auth/models/auth.models';
import { DepartmentResponse } from './department.model';

export interface WorkEnvironmentRequest {
  name: string;
  description?: string;
  userId: number;
  departmentId: number;
}

export interface WorkEnvironmentUpdateRequest {
  name: string;
  description?: string;
}

export interface WorkEnvironmentResponse {
  id: number;
  name: string;
  description?: string;
  user: UserResponse;
  department: DepartmentResponse;
  createdAt: string;
  updatedAt: string;
  taskCount?: number;
}

export interface WorkEnvironmentPageResponse {
  content: WorkEnvironmentResponse[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}
