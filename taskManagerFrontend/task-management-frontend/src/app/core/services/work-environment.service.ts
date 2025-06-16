import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  WorkEnvironmentRequest,
  WorkEnvironmentUpdateRequest,
  WorkEnvironmentResponse,
  WorkEnvironmentPageResponse
} from '../models/work-environment.model';

@Injectable({
  providedIn: 'root'
})
export class WorkEnvironmentService {
  private apiUrl = `${environment.apiUrl}/work-environments`;

  constructor(private http: HttpClient) {}

  getAllWorkEnvironments(): Observable<WorkEnvironmentResponse[]> {
    return this.http.get<WorkEnvironmentResponse[]>(this.apiUrl);
  }

  getWorkEnvironmentsPaginated(page = 0, size = 10, sortBy = 'name', sortDir = 'asc'): Observable<WorkEnvironmentPageResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy)
      .set('sortDir', sortDir);

    return this.http.get<WorkEnvironmentPageResponse>(`${this.apiUrl}/paginated`, { params });
  }

  getWorkEnvironmentById(id: number): Observable<WorkEnvironmentResponse> {
    return this.http.get<WorkEnvironmentResponse>(`${this.apiUrl}/${id}`);
  }

  getWorkEnvironmentsByUserId(userId: number): Observable<WorkEnvironmentResponse[]> {
    return this.http.get<WorkEnvironmentResponse[]>(`${this.apiUrl}/user/${userId}`);
  }

  getWorkEnvironmentsByDepartmentId(departmentId: number): Observable<WorkEnvironmentResponse[]> {
    return this.http.get<WorkEnvironmentResponse[]>(`${this.apiUrl}/department/${departmentId}`);
  }

  getWorkEnvironmentByUserAndDepartment(userId: number, departmentId: number): Observable<WorkEnvironmentResponse> {
    return this.http.get<WorkEnvironmentResponse>(`${this.apiUrl}/user/${userId}/department/${departmentId}`);
  }

  createWorkEnvironment(workEnvironment: WorkEnvironmentRequest): Observable<WorkEnvironmentResponse> {
    return this.http.post<WorkEnvironmentResponse>(this.apiUrl, workEnvironment);
  }

  updateWorkEnvironment(id: number, workEnvironment: WorkEnvironmentUpdateRequest): Observable<WorkEnvironmentResponse> {
    return this.http.put<WorkEnvironmentResponse>(`${this.apiUrl}/${id}`, workEnvironment);
  }

  deleteWorkEnvironment(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
