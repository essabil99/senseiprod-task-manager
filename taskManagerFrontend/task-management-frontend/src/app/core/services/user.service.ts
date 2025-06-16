import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { UserResponse, PasswordChangeRequest } from '../../auth/models/auth.models';

export interface UserUpdateRequest {
  firstName: string;
  lastName: string;
  departmentId: number;
  role?: string;
}

export interface UserPageResponse {
  content: UserResponse[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  getAllUsers(): Observable<UserResponse[]> {
    return this.http.get<UserResponse[]>(this.apiUrl);
  }

  getUsersPaginated(page = 0, size = 10, sortBy = 'lastName', sortDir = 'asc'): Observable<UserPageResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy)
      .set('sortDir', sortDir);

    return this.http.get<UserPageResponse>(`${this.apiUrl}/paginated`, { params });
  }

  getUserById(id: number): Observable<UserResponse> {
    return this.http.get<UserResponse>(`${this.apiUrl}/${id}`);
  }

  getUsersByDepartmentId(departmentId: number): Observable<UserResponse[]> {
    return this.http.get<UserResponse[]>(`${this.apiUrl}/department/${departmentId}`);
  }

  createUser(user: any): Observable<UserResponse> {
    return this.http.post<UserResponse>(this.apiUrl, user);
  }

  updateUser(id: number, user: UserUpdateRequest): Observable<UserResponse> {
    return this.http.put<UserResponse>(`${this.apiUrl}/${id}`, user);
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  changePassword(id: number, passwordRequest: PasswordChangeRequest): Observable<UserResponse> {
    return this.http.post<UserResponse>(`${this.apiUrl}/${id}/change-password`, passwordRequest);
  }
}
