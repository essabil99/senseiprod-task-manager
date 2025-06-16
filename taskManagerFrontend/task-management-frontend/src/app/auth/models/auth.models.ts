export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  departmentId: number;
}

export interface LoginResponse {
  token: string;
  tokenType: string;
  user: UserResponse;
}

export interface UserResponse {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  role: UserRole;
  isActive: boolean;
  department?: DepartmentSummary;
  createdAt: string;
  updatedAt: string;
  workEnvironmentCount: number;
}

export interface DepartmentSummary {
  id: number;
  name: string;
}

export enum UserRole {
  ADMIN = 'ADMIN',
  DEPARTMENT_MANAGER = 'DEPARTMENT_MANAGER',
  EMPLOYEE = 'EMPLOYEE'
}

export interface PasswordChangeRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}
