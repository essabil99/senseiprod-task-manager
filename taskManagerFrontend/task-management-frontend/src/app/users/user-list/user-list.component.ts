import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserService } from '../../core/services/user.service';
import { UserResponse, UserRole } from '../../auth/models/auth.models';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { AuthService } from '../../auth/services/auth.service';
import { finalize } from 'rxjs/operators';
import { UserFormComponent } from '../user-form/user-form.component';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss']
})
export class UserListComponent implements OnInit {
  displayedColumns: string[] = ['fullName', 'email', 'role', 'department', 'isActive', 'actions'];
  dataSource = new MatTableDataSource<UserResponse>([]);
  loading = false;
  totalElements = 0;
  pageSize = 10;
  pageSizeOptions = [5, 10, 25, 50];
  currentUser: UserResponse | null = null;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });

    this.loadUsers();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    this.sort.sortChange.subscribe(() => {
      this.paginator.pageIndex = 0;
      this.loadUsers();
    });
  }

  loadUsers(page = 0, size = this.pageSize): void {
    this.loading = true;

    this.userService.getUsersPaginated(
      page,
      size,
      this.sort?.active || 'lastName',
      this.sort?.direction || 'asc'
    )
    .pipe(finalize(() => this.loading = false))
    .subscribe({
      next: response => {
        this.dataSource.data = response.content;
        this.totalElements = response.totalElements;
      },
      error: error => {
        console.error('Error loading users', error);
        this.snackBar.open('Failed to load users', 'Close', { duration: 5000 });
      }
    });
  }

  onPageChange(event: any): void {
    this.loadUsers(event.pageIndex, event.pageSize);
  }

  openUserForm(user?: UserResponse): void {
    const dialogRef = this.dialog.open(UserFormComponent, {
      width: '600px',
      data: { user }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadUsers(this.paginator.pageIndex, this.paginator.pageSize);
      }
    });
  }

  confirmDelete(user: UserResponse): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Confirm Delete',
        message: `Are you sure you want to delete user ${user.fullName}?`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
        color: 'warn'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deleteUser(user);
      }
    });
  }

  deleteUser(user: UserResponse): void {
    this.loading = true;

    this.userService.deleteUser(user.id)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: () => {
          this.snackBar.open(`User ${user.fullName} deleted successfully`, 'Close', { duration: 3000 });
          this.loadUsers(this.paginator.pageIndex, this.paginator.pageSize);
        },
        error: error => {
          console.error('Error deleting user', error);
          this.snackBar.open('Failed to delete user', 'Close', { duration: 5000 });
        }
      });
  }

  canManageUser(user: UserResponse): boolean {
    if (!this.currentUser) return false;

    // Admins can manage all users
    if (this.currentUser.role === UserRole.ADMIN) return true;

    // Department managers can manage employees in their department
    if (this.currentUser.role === UserRole.DEPARTMENT_MANAGER &&
        user.role === UserRole.EMPLOYEE &&
        user.department?.id === this.currentUser.department?.id) {
      return true;
    }

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
