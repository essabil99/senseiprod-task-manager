import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DepartmentService } from '../../core/services/department.service';
import { DepartmentResponse } from '../../core/models/department.model';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { AuthService } from '../../auth/services/auth.service';
import { UserRole } from '../../auth/models/auth.models';
import { finalize } from 'rxjs/operators';
import { DepartmentFormComponent } from '../department-form/department-form.component';

@Component({
  selector: 'app-department-list',
  templateUrl: './department-list.component.html',
  styleUrls: ['./department-list.component.scss']
})
export class DepartmentListComponent implements OnInit {
  displayedColumns: string[] = ['name', 'description', 'userCount', 'actions'];
  dataSource = new MatTableDataSource<DepartmentResponse>([]);
  loading = false;
  totalElements = 0;
  pageSize = 10;
  pageSizeOptions = [5, 10, 25, 50];
  isAdmin = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private departmentService: DepartmentService,
    private authService: AuthService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.isAdmin = user?.role === UserRole.ADMIN;
    });

    this.loadDepartments();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    this.sort.sortChange.subscribe(() => {
      this.paginator.pageIndex = 0;
      this.loadDepartments();
    });
  }

  loadDepartments(page = 0, size = this.pageSize): void {
    this.loading = true;

    this.departmentService.getDepartmentsPaginated(
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
        console.error('Error loading departments', error);
        this.snackBar.open('Failed to load departments', 'Close', { duration: 5000 });
      }
    });
  }

  onPageChange(event: any): void {
    this.loadDepartments(event.pageIndex, event.pageSize);
  }

  openDepartmentForm(department?: DepartmentResponse): void {
    const dialogRef = this.dialog.open(DepartmentFormComponent, {
      width: '500px',
      data: { department }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadDepartments(this.paginator.pageIndex, this.paginator.pageSize);
      }
    });
  }

  confirmDelete(department: DepartmentResponse): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Confirm Delete',
        message: `Are you sure you want to delete department "${department.name}"?`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
        color: 'warn'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deleteDepartment(department);
      }
    });
  }

  deleteDepartment(department: DepartmentResponse): void {
    this.loading = true;

    this.departmentService.deleteDepartment(department.id)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: () => {
          this.snackBar.open(`Department "${department.name}" deleted successfully`, 'Close', { duration: 3000 });
          this.loadDepartments(this.paginator.pageIndex, this.paginator.pageSize);
        },
        error: error => {
          console.error('Error deleting department', error);
          this.snackBar.open('Failed to delete department', 'Close', { duration: 5000 });
        }
      });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
}
