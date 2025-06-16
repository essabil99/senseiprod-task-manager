export interface DepartmentRequest {
  name: string;
  description?: string;
}

export interface DepartmentResponse {
  id: number;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  userCount?: number;
}

export interface DepartmentPageResponse {
  content: DepartmentResponse[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}
