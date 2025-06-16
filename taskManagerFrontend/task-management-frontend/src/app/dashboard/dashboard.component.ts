import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth/services/auth.service';
import { TaskService } from '../core/services/task.service';
import { WorkEnvironmentService } from '../core/services/work-environment.service';
import { UserResponse } from '../auth/models/auth.models';
import { TaskResponse, TaskStatus } from '../core/models/task.model';
import { WorkEnvironmentResponse } from '../core/models/work-environment.model';
import { forkJoin, of } from 'rxjs';
import { catchError, finalize, switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  currentUser: UserResponse | null = null;
  workEnvironments: WorkEnvironmentResponse[] = [];
  recentTasks: TaskResponse[] = [];
  tasksByStatus = {
    [TaskStatus.TODO]: 0,
    [TaskStatus.PENDING]: 0,
    [TaskStatus.DONE]: 0
  };

  loading = true;
  error = false;

  constructor(
    private authService: AuthService,
    private taskService: TaskService,
    private workEnvironmentService: WorkEnvironmentService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.loadDashboardData(user.id);
      }
    });
  }

  // Option 1: Get tasks by work environment IDs
  loadDashboardData(userId: number): void {
    this.loading = true
    this.error = false

    // First get work environments, then get tasks for each environment
    this.workEnvironmentService
      .getWorkEnvironmentsByUserId(userId)
      .pipe(
        catchError(() => of([])),
        switchMap((workEnvironments) => {
          this.workEnvironments = workEnvironments

          if (workEnvironments.length === 0) {
            return of([])
          }

          // Get tasks for each work environment
          const taskRequests = workEnvironments.map((env) =>
            this.taskService.getTasksByWorkEnvironmentId(env.id).pipe(catchError(() => of([]))),
          )

          return forkJoin(taskRequests)
        }),
        finalize(() => (this.loading = false)),
      )
      .subscribe({
        next: (taskArrays) => {
          // Flatten the array of arrays and get recent tasks
          this.recentTasks = taskArrays
            .flat()
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 10) // Get 10 most recent tasks

          this.calculateTaskStats()
        },
        error: () => {
          this.error = true
        },
      })
  }

  calculateTaskStats(): void {
    // Reset counters
    this.tasksByStatus = {
      [TaskStatus.TODO]: 0,
      [TaskStatus.PENDING]: 0,
      [TaskStatus.DONE]: 0
    };

    // Count tasks by status
    this.recentTasks.forEach(task => {
      if (this.tasksByStatus[task.status] !== undefined) {
        this.tasksByStatus[task.status]++;
      }
    });
  }

  navigateToTasks(): void {
    this.router.navigate(['/tasks']);
  }

  navigateToWorkEnvironments(): void {
    this.router.navigate(['/work-environments']);
  }
}
