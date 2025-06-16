import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserService, UserUpdateRequest } from '../../core/services/user.service';
import { DepartmentService } from '../../core/services/department.service';
import { UserResponse, UserRole } from '../../auth/models/auth.models';
import { DepartmentResponse } from '../../core/models/department.model';
import { finalize } from 'rxjs/operators';

interface DialogData {
  user?: UserResponse;
}

@Component({
  selector: 'app-user-form',
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.scss']
})
export class UserFormComponent implements OnInit {
  userForm: FormGroup;
  loading = false;
  departments: DepartmentResponse[] = [];
  roles = Object.values(UserRole);
  isEditMode = false;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private departmentService: DepartmentService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<UserFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {
    this.isEditMode = !!data.user;

    this.userForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      departmentId: ['', Validators.required],
      role: ['', Validators.required],
      password: ['', this.isEditMode ? [] : [Validators.required, Validators.minLength(6)]],
      isActive: [true]
    });

    if (this.isEditMode && data.user) {
      this.userForm.patchValue({
        firstName: data.user.firstName,
        lastName: data.user.lastName,
        email: data.user.email,
        departmentId: data.user.department?.id,
        role: data.user.role,
        isActive: data.user.isActive
      });

      // Disable email field in edit mode
      this.userForm.get('email')?.disable();
    }
  }

  ngOnInit(): void {
    this.loadDepartments();
  }

  loadDepartments(): void {
    this.departmentService.getAllDepartments().subscribe({
      next: departments => {
        this.departments = departments;
      },
      error: error => {
        console.error('Error loading departments', error);
        this.snackBar.open('Failed to load departments', 'Close', { duration: 5000 });
      }
    });
  }

  onSubmit(): void {
    if (this.userForm.invalid) {
      return;
    }

    this.loading = true;

    if (this.isEditMode && this.data.user) {
      const updateRequest: UserUpdateRequest = {
        firstName: this.userForm.value.firstName,
        lastName: this.userForm.value.lastName,
        departmentId: this.userForm.value.departmentId,
        role: this.userForm.value.role
      };

      this.userService.updateUser(this.data.user.id, updateRequest)
        .pipe(finalize(() => this.loading = false))
        .subscribe({
          next: () => {
            this.snackBar.open('User updated successfully', 'Close', { duration: 3000 });
            this.dialogRef.close(true);
          },
          error: error => {
            console.error('Error updating user', error);
            this.snackBar.open('Failed to update user', 'Close', { duration: 5000 });
          }
        });
    } else {
      // For create, include the password
      const createRequest = {
        ...this.userForm.value,
        email: this.userForm.get('email')?.value // Get email from the disabled control
      };

      this.userService.createUser(createRequest)
        .pipe(finalize(() => this.loading = false))
        .subscribe({
          next: () => {
            this.snackBar.open('User created successfully', 'Close', { duration: 3000 });
            this.dialogRef.close(true);
          },
          error: error => {
            console.error('Error creating user', error);
            this.snackBar.open('Failed to create user', 'Close', { duration: 5000 });
          }
        });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
