import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserService } from '../../core/services/user.service';
import { WorkEnvironmentService } from '../../core/services/work-environment.service';
import { UserResponse, UserRole, PasswordChangeRequest } from '../../auth/models/auth.models';
import { WorkEnvironmentResponse } from '../../core/models/work-environment.model';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { UserFormComponent } from '../user-form/user-form.component';
import { PasswordChangeComponent } from '../password-change/password-change.component';
import { AuthService } from '../../auth/services/auth.service';
import { finalize, forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-user-detail',
  templateUrl: './user-detail.component.html',
  styleUrls: ['./user-detail.component.scss']
})
export class UserDetailComponent implements OnInit {
  userId!: number;
  user: UserResponse | null = null;
  workEnvironments: WorkEnvironmentResponse[] = [];
  loading = false;
  currentUser: UserResponse | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private workEnvironmentService: WorkEnvironmentService,
    private authService: AuthService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });

    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.userId = +id;
        this.loadUserData();
      } else {
        this.router.navigate(['/users']);
      }
    });
  }

  loadUserData(): void {
    this.loading = true;

    forkJoin({
      user: this.userService.getUserById(this.userId),
      workEnvironments: this.workEnvironmentService.getWorkEnvironmentsByUserId(this.userId)
        .pipe(catchError(() => of([])))
    })
    .pipe(finalize(() => this.loading = false))
    .subscribe({
      next: results => {
        this.user = results.user;
        this.workEnvironments = results.workEnvironments;
      },
      error: error => {
        console.error('Error loading user data', error);
        this.snackBar.open('Failed to load user data', 'Close', { duration: 5000 });
        this.router.navigate(['/users']);
      }
    });
  }

  openEditForm(): void {
    if (!this.user) return;

    const dialogRef = this.dialog.open(UserFormComponent, {
      width: '600px',
      data: { user: this.user }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadUserData();
      }
    });
  }

  openPasswordChangeForm(): void {
    if (!this.user) return;

    const dialogRef = this.dialog.open(PasswordChangeComponent, {
      width: '400px',
      data: { userId: this.user.id }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.snackBar.open('Password changed successfully', 'Close', { duration: 3000 });
      }
    });
  }

  confirmDelete(): void {
    if (!this.user) return;

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Confirm Delete',
        message: `Are you sure you want to delete user ${this.user.fullName}?`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
        color: 'warn'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deleteUser();
      }
    });
  }

  deleteUser(): void {
    if (!this.user) return;

    this.loading = true;

    this.userService.deleteUser(this.user.id)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: () => {
          this.snackBar.open(`User ${this.user?.fullName} deleted successfully`, 'Close', { duration: 3000 });
          this.router.navigate(['/users']);
        },
        error: error => {
          console.error('Error deleting user', error);
          this.snackBar.open('Failed to delete user', 'Close', { duration: 5000 });
        }
      });
  }

  canManageUser(): boolean {
    if (!this.currentUser || !this.user) return false;

    // Admins can manage all users
    if (this.currentUser.role === UserRole.ADMIN) return true;

    // Department managers can manage employees in their department
    if (this.currentUser.role === UserRole.DEPARTMENT_MANAGER &&
        this.user.role === UserRole.EMPLOYEE &&
        this.user.department?.id === this.currentUser.department?.id) {
      return true;
    }

    // Users can manage themselves
    if (this.currentUser.id === this.user.id) return true;

    return false;
  }

  canDeleteUser(): boolean {
    if (!this.currentUser || !this.user) return false;

    // Only admins can delete users
    return this.currentUser.role === UserRole.ADMIN;
  }
}
