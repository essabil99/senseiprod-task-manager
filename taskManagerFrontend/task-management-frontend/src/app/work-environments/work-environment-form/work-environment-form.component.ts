import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { WorkEnvironmentService } from '../../core/services/work-environment.service';
import { DepartmentService } from '../../core/services/department.service';
import { UserService } from '../../core/services/user.service';
import {
  WorkEnvironmentRequest,
  WorkEnvironmentUpdateRequest,
  WorkEnvironmentResponse
} from '../../core/models/work-environment.model';
import { DepartmentResponse } from '../../core/models/department.model';
import { UserResponse, UserRole } from '../../auth/models/auth.models';
import { AuthService } from '../../auth/services/auth.service';
import { finalize, forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

interface DialogData {
  workEnvironment?: WorkEnvironmentResponse;
}

@Component({
  selector: 'app-work-environment-form',
  templateUrl: './work-environment-form.component.html',
  styleUrls: ['./work-environment-form.component.scss']
})
export class WorkEnvironmentFormComponent implements OnInit {
  workEnvironmentForm: FormGroup;
  loading = false;
  loadingData = false;
  isEditMode = false;
  departments: DepartmentResponse[] = [];
  users: UserResponse[] = [];
  filteredUsers: UserResponse[] = [];
  currentUser: UserResponse | null = null;
  isAdmin = false;
  isDepartmentManager = false;

  constructor(
    private fb: FormBuilder,
    private workEnvironmentService: WorkEnvironmentService,
    private departmentService: DepartmentService,
    private userService: UserService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<WorkEnvironmentFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {
    this.isEditMode = !!data.workEnvironment;

    this.workEnvironmentForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      description: ['', Validators.maxLength(500)],
      departmentId: ['', Validators.required],
      userId: ['', Validators.required]
    });

    if (this.isEditMode && data.workEnvironment) {
      this.workEnvironmentForm.patchValue({
        name: data.workEnvironment.name,
        description: data.workEnvironment.description,
        departmentId: data.workEnvironment.department?.id,
        userId: data.workEnvironment.user?.id
      });

      // Disable department and user fields in edit mode
      this.workEnvironmentForm.get('departmentId')?.disable();
      this.workEnvironmentForm.get('userId')?.disable();
    }
  }

  ngOnInit(): void {
    this.loadingData = true;

    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.isAdmin = user?.role === UserRole.ADMIN;
      this.isDepartmentManager = user?.role === UserRole.DEPARTMENT_MANAGER;

      // If not admin and not in edit mode, set the user to current user
      if (!this.isAdmin && !this.isEditMode && user) {
        this.workEnvironmentForm.patchValue({ userId: user.id });
        this.workEnvironmentForm.get('userId')?.disable();
      }
    });

    forkJoin({
      departments: this.departmentService.getAllDepartments()
        .pipe(catchError(() => of([]))),
      users: this.userService.getAllUsers()
        .pipe(catchError(() => of([])))
    })
    .pipe(finalize(() => this.loadingData = false))
    .subscribe({
      next: results => {
        this.departments = results.departments;
        this.users = results.users;
        this.filterUsersByDepartment();

        // If department manager, filter to only show their department
        if (this.isDepartmentManager && this.currentUser?.department) {
          this.workEnvironmentForm.patchValue({ departmentId: this.currentUser.department.id });
          this.workEnvironmentForm.get('departmentId')?.disable();
        }
      },
      error: error => {
        console.error('Error loading form data', error);
        this.snackBar.open('Failed to load form data', 'Close', { duration: 5000 });
      }
    });

    // Listen for department changes to filter users
    this.workEnvironmentForm.get('departmentId')?.valueChanges.subscribe(() => {
      this.filterUsersByDepartment();
    });
  }

  filterUsersByDepartment(): void {
    const departmentId = this.workEnvironmentForm.get('departmentId')?.value;

    if (departmentId) {
      this.filteredUsers = this.users.filter(user =>
        user.department?.id === departmentId
      );
    } else {
      this.filteredUsers = this.users;
    }
  }

  onSubmit(): void {
    if (this.workEnvironmentForm.invalid) {
      return;
    }

    this.loading = true;

    if (this.isEditMode && this.data.workEnvironment) {
      const updateRequest: WorkEnvironmentUpdateRequest = {
        name: this.workEnvironmentForm.value.name,
        description: this.workEnvironmentForm.value.description
      };

      this.workEnvironmentService.updateWorkEnvironment(this.data.workEnvironment.id, updateRequest)
        .pipe(finalize(() => this.loading = false))
        .subscribe({
          next: () => {
            this.snackBar.open('Work environment updated successfully', 'Close', { duration: 3000 });
            this.dialogRef.close(true);
          },
          error: error => {
            console.error('Error updating work environment', error);
            this.snackBar.open('Failed to update work environment', 'Close', { duration: 5000 });
          }
        });
    } else {
      const createRequest: WorkEnvironmentRequest = {
        name: this.workEnvironmentForm.value.name,
        description: this.workEnvironmentForm.value.description,
        departmentId: this.workEnvironmentForm.getRawValue().departmentId,
        userId: this.workEnvironmentForm.getRawValue().userId
      };

      this.workEnvironmentService.createWorkEnvironment(createRequest)
        .pipe(finalize(() => this.loading = false))
        .subscribe({
          next: () => {
            this.snackBar.open('Work environment created successfully', 'Close', { duration: 3000 });
            this.dialogRef.close(true);
          },
          error: error => {
            console.error('Error creating work environment', error);
            this.snackBar.open('Failed to create work environment', 'Close', { duration: 5000 });
          }
        });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
