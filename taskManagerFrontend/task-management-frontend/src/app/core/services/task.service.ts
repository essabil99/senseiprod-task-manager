import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  TaskRequest,
  TaskUpdateRequest,
  StatusUpdateRequest,
  TaskResponse,
  TaskPageResponse,
  TaskFilterRequest
} from '../models/task.model';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private apiUrl = `${environment.apiUrl}/tasks`;

  constructor(private http: HttpClient) {}

  getAllTasks(): Observable<TaskResponse[]> {
    return this.http.get<TaskResponse[]>(this.apiUrl);
  }

  getTaskById(id: number): Observable<TaskResponse> {
    return this.http.get<TaskResponse>(`${this.apiUrl}/${id}`);
  }

  getTasksByWorkEnvironmentId(workEnvironmentId: number): Observable<TaskResponse[]> {
    return this.http.get<TaskResponse[]>(`${this.apiUrl}/work-environment/${workEnvironmentId}`);
  }

  getTasksByWorkEnvironmentIdAndStatus(workEnvironmentId: number, status: string): Observable<TaskResponse[]> {
    return this.http.get<TaskResponse[]>(`${this.apiUrl}/work-environment/${workEnvironmentId}/status/${status}`);
  }

  filterTasks(filter: TaskFilterRequest): Observable<TaskPageResponse> {
    let params = new HttpParams();

    // Add all filter parameters
    (Object.keys(filter) as (keyof TaskFilterRequest)[]).forEach(key => {
      if (filter[key] !== undefined && filter[key] !== null) {
        params = params.set(key as string, filter[key]!.toString());
      }
    });

    return this.http.get<TaskPageResponse>(`${this.apiUrl}/filter`, { params });
  }

  createTask(task: TaskRequest): Observable<TaskResponse> {
    return this.http.post<TaskResponse>(this.apiUrl, task);
  }

  updateTask(id: number, task: TaskUpdateRequest): Observable<TaskResponse> {
    return this.http.put<TaskResponse>(`${this.apiUrl}/${id}`, task);
  }

  updateTaskStatus(id: number, statusUpdate: StatusUpdateRequest): Observable<TaskResponse> {
    return this.http.put<TaskResponse>(`${this.apiUrl}/${id}/status`, statusUpdate);
  }

  progressTask(id: number): Observable<TaskResponse> {
    return this.http.put<TaskResponse>(`${this.apiUrl}/${id}/progress`, {});
  }

  deleteTask(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
