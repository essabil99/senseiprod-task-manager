import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { WorkEnvironmentService } from '../core/services/work-environment.service';
import { WorkEnvironmentResponse } from '../core/models/work-environment.model';
import { ConfirmDialogComponent } from '../shared/components/confirm-dialog/confirm-dialog.component';
import { AuthService } from '../auth/services/auth.service';
import { UserResponse, UserRole } from '../auth/models/auth.models';
import { finalize } from 'rxjs/operators';
import { WorkEnvironmentFormComponent } from './work-environment-form/work-environment-form.component';

@Component({
  selector: 'app-work-environment-list',
  templateUrl: './work-environment-list.component.html',
  styleUrls: ['./work-environment-list.component.scss']
})
export class WorkEnvironmentListComponent implements OnInit {
  displayedColumns: string[] = ['name', 'department', 'user', 'taskCount', 'actions'];
  dataSource = new MatTableDataSource<WorkEnvironmentResponse>([]);
  loading = false;
  totalElements = 0;
  pageSize = 10;
  pageSizeOptions = [5, 10, 25, 50];
  currentUser: UserResponse | null = null;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private workEnvironmentService: WorkEnvironmentService,
    private authService: AuthService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });

    this.loadWorkEnvironments();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    this.sort.sortChange.subscribe(() => {
      this.paginator.pageIndex = 0;
      this.loadWorkEnvironments();
    });
  }

  loadWorkEnvironments(page = 0, size = this.pageSize): void {
    this.loading = true;

    this.workEnvironmentService.getWorkEnvironmentsPaginated(
      page,
      size,
      this.sort?.active || 'name',
      this.sort?.direction || 'asc'
    )
    .pipe(finalize(() => this.loading = false))
    .subscribe({
      next: response => {
        this.dataSource.data = response.content;
        this.totalElements = response.totalElements;
      },
      error: error => {
        console.error('Error loading work environments', error);
        this.snackBar.open('Failed to load work environments', 'Close', { duration: 5000 });
      }
    });
  }

  onPageChange(event: any): void {
    this.loadWorkEnvironments(event.pageIndex, event.pageSize);
  }

  openWorkEnvironmentForm(workEnvironment?: WorkEnvironmentResponse): void {
    const dialogRef = this.dialog.open(WorkEnvironmentFormComponent, {
      width: '600px',
      data: { workEnvironment }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadWorkEnvironments(this.paginator.pageIndex, this.paginator.pageSize);
      }
    });
  }

  confirmDelete(workEnvironment: WorkEnvironmentResponse): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Confirm Delete',
        message: `Are you sure you want to delete work environment "${workEnvironment.name}"?`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
        color: 'warn'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deleteWorkEnvironment(workEnvironment);
      }
    });
  }

  deleteWorkEnvironment(workEnvironment: WorkEnvironmentResponse): void {
    this.loading = true;

    this.workEnvironmentService.deleteWorkEnvironment(workEnvironment.id)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: () => {
          this.snackBar.open(`Work environment "${workEnvironment.name}" deleted successfully`, 'Close', { duration: 3000 });
          this.loadWorkEnvironments(this.paginator.pageIndex, this.paginator.pageSize);
        },
        error: error => {
          console.error('Error deleting work environment', error);
          this.snackBar.open('Failed to delete work environment', 'Close', { duration: 5000 });
        }
      });
  }

  canManageWorkEnvironment(workEnvironment: WorkEnvironmentResponse): boolean {
    if (!this.currentUser) return false;

    // Admins can manage all work environments
    if (this.currentUser.role === UserRole.ADMIN) return true;

    // Department managers can manage work environments in their department
    if (this.currentUser.role === UserRole.DEPARTMENT_MANAGER &&
        workEnvironment.department?.id === this.currentUser.department?.id) {
      return true;
    }

    // Users can manage their own work environments
    if (workEnvironment.user?.id === this.currentUser.id) return true;

    return false;
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
}
