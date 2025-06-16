import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TaskService } from '../../core/services/task.service';
import { WorkEnvironmentService } from '../../core/services/work-environment.service';
import { TaskResponse, TaskStatus, TaskPriority, TaskFilterRequest } from '../../core/models/task.model';
import { WorkEnvironmentResponse } from '../../core/models/work-environment.model';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { AuthService } from '../../auth/services/auth.service';
import { UserResponse, UserRole } from '../../auth/models/auth.models';
import { finalize, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { TaskFormComponent } from '../task-form/task-form.component';

@Component({
  selector: 'app-task-list',
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.scss']
})
export class TaskListComponent implements OnInit {

  displayedColumns: string[] = ['title', 'status', 'priority', 'workEnvironment', 'dueDate', 'actions'];
  dataSource = new MatTableDataSource<TaskResponse>([]);
  loading = false;
  totalElements = 0;
  pageSize = 10;
  pageSizeOptions = [5, 10, 25, 50];
  currentUser: UserResponse | null = null;

  filterForm: FormGroup;
  workEnvironments: WorkEnvironmentResponse[] = [];
  taskStatuses = Object.values(TaskStatus);
  taskPriorities = Object.values(TaskPriority);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
task: any;

  constructor(
    private taskService: TaskService,
    private workEnvironmentService: WorkEnvironmentService,
    private authService: AuthService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private fb: FormBuilder
  ) {
    this.filterForm = this.fb.group({
      searchTerm: [''],
      workEnvironmentId: [''],
      status: [''],
      priority: [''],
      dueDateFrom: [''],
      dueDateTo: [''],
      overdue: [false]
    });
  }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });

    this.loadWorkEnvironments();
    this.loadTasks();

    // Setup filter form changes
    this.filterForm.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(() => {
        this.paginator.pageIndex = 0;
        this.loadTasks();
      });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    this.sort.sortChange.subscribe(() => {
      this.paginator.pageIndex = 0;
      this.loadTasks();
    });
  }

  loadWorkEnvironments(): void {
    this.workEnvironmentService.getAllWorkEnvironments().subscribe({
      next: workEnvironments => {
        this.workEnvironments = workEnvironments;
      },
      error: error => {
        console.error('Error loading work environments', error);
      }
    });
  }

  loadTasks(page = 0, size = this.pageSize): void {
    this.loading = true;

    const filterRequest: TaskFilterRequest = {
      ...this.filterForm.value,
      page,
      size,
      sortBy: this.sort?.active || 'createdAt',
      sortDirection: this.sort?.direction || 'desc'
    };

    // Remove empty values
    Object.keys(filterRequest).forEach(key => {
      if ((filterRequest as any)[key] === '' || (filterRequest as any)[key] === null) {
        delete (filterRequest as any)[key];
      }
    });

    this.taskService.filterTasks(filterRequest)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: response => {
          this.dataSource.data = response.content;
          this.totalElements = response.totalElements;
        },
        error: error => {
          console.error('Error loading tasks', error);
          this.snackBar.open('Failed to load tasks', 'Close', { duration: 5000 });
        }
      });
  }

  onPageChange(event: any): void {
    this.loadTasks(event.pageIndex, event.pageSize);
  }

  openTaskForm(task?: TaskResponse): void {
    const dialogRef = this.dialog.open(TaskFormComponent, {
      width: '600px',
      data: { task }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadTasks(this.paginator.pageIndex, this.paginator.pageSize);
      }
    });
  }

  confirmDelete(task: TaskResponse): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Confirm Delete',
        message: `Are you sure you want to delete task "${task.title}"?`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
        color: 'warn'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deleteTask(task);
      }
    });
  }

  deleteTask(task: TaskResponse): void {
    this.loading = true;

    this.taskService.deleteTask(task.id)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: () => {
          this.snackBar.open(`Task "${task.title}" deleted successfully`, 'Close', { duration: 3000 });
          this.loadTasks(this.paginator.pageIndex, this.paginator.pageSize);
        },
        error: error => {
          console.error('Error deleting task', error);
          this.snackBar.open('Failed to delete task', 'Close', { duration: 5000 });
        }
      });
  }

  canManageTask(task: TaskResponse): boolean {
    if (!this.currentUser) return false;

    // Admins can manage all tasks
    if (this.currentUser.role === UserRole.ADMIN) return true;

    // Department managers can manage tasks in their department
    if (this.currentUser.role === UserRole.DEPARTMENT_MANAGER &&
        task.workEnvironment?.department?.id === this.currentUser.department?.id) {
      return true;
    }

    // Users can manage tasks in their work environments
    if (task.workEnvironment?.user?.id === this.currentUser.id) return true;

    return false;
  }

  clearFilters(): void {
    this.filterForm.reset();
    this.filterForm.patchValue({
      searchTerm: '',
      workEnvironmentId: '',
      status: '',
      priority: '',
      dueDateFrom: '',
      dueDateTo: '',
      overdue: false
    });
  }

  getStatusColor(status: TaskStatus): string {
    switch (status) {
      case TaskStatus.TODO:
        return 'warn';
      case TaskStatus.PENDING:
        return 'primary';
      case TaskStatus.DONE:
        return 'accent';
      default:
        return '';
    }
  }

  getPriorityColor(priority: TaskPriority): string {
    switch (priority) {
      case TaskPriority.HIGH:
        return '#f44336';
      case TaskPriority.MEDIUM:
        return '#ff9800';
      case TaskPriority.LOW:
        return '#4caf50';
      default:
        return '#757575';
    }
  }
}
