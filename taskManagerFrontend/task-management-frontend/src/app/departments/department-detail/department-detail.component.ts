import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DepartmentService } from '../../core/services/department.service';
import { UserService } from '../../core/services/user.service';
import { WorkEnvironmentService } from '../../core/services/work-environment.service';
import { DepartmentResponse } from '../../core/models/department.model';
import { UserResponse, UserRole } from '../../auth/models/auth.models';
import { WorkEnvironmentResponse } from '../../core/models/work-environment.model';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { DepartmentFormComponent } from '../department-form/department-form.component';
import { AuthService } from '../../auth/services/auth.service';
import { finalize, forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-department-detail',
  templateUrl: './department-detail.component.html',
  styleUrls: ['./department-detail.component.scss']
})
export class DepartmentDetailComponent implements OnInit {
  departmentId!: number;
  department: DepartmentResponse | null = null;
  users: UserResponse[] = [];
  workEnvironments: WorkEnvironmentResponse[] = [];
  loading = false;
  isAdmin = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private departmentService: DepartmentService,
    private userService: UserService,
    private workEnvironmentService: WorkEnvironmentService,
    private authService: AuthService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.isAdmin = user?.role === UserRole.ADMIN;
    });

    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.departmentId = +id;
        this.loadDepartmentData();
      } else {
        this.router.navigate(['/departments']);
      }
    });
  }

  loadDepartmentData(): void {
    this.loading = true;

    forkJoin({
      department: this.departmentService.getDepartmentById(this.departmentId),
      users: this.userService.getUsersByDepartmentId(this.departmentId)
        .pipe(catchError(() => of([]))),
      workEnvironments: this.workEnvironmentService.getWorkEnvironmentsByDepartmentId(this.departmentId)
        .pipe(catchError(() => of([])))
    })
    .pipe(finalize(() => this.loading = false))
    .subscribe({
      next: results => {
        this.department = results.department;
        this.users = results.users;
        this.workEnvironments = results.workEnvironments;
      },
      error: error => {
        console.error('Error loading department data', error);
        this.snackBar.open('Failed to load department data', 'Close', { duration: 5000 });
        this.router.navigate(['/departments']);
      }
    });
  }

  openEditForm(): void {
    if (!this.department) return;

    const dialogRef = this.dialog.open(DepartmentFormComponent, {
      width: '500px',
      data: { department: this.department }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadDepartmentData();
      }
    });
  }

  confirmDelete(): void {
    if (!this.department) return;

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Confirm Delete',
        message: `Are you sure you want to delete department "${this.department.name}"?`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
        color: 'warn'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deleteDepartment();
      }
    });
  }

  deleteDepartment(): void {
    if (!this.department) return;

    this.loading = true;

    this.departmentService.deleteDepartment(this.department.id)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: () => {
          this.snackBar.open(`Department "${this.department?.name}" deleted successfully`, 'Close', { duration: 3000 });
          this.router.navigate(['/departments']);
        },
        error: error => {
          console.error('Error deleting department', error);
          this.snackBar.open('Failed to delete department', 'Close', { duration: 5000 });
        }
      });
  }
}
