import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DepartmentService } from '../../core/services/department.service';
import { DepartmentRequest, DepartmentResponse } from '../../core/models/department.model';
import { finalize } from 'rxjs/operators';

interface DialogData {
  department?: DepartmentResponse;
}

@Component({
  selector: 'app-department-form',
  templateUrl: './department-form.component.html',
  styleUrls: ['./department-form.component.scss']
})
export class DepartmentFormComponent {
  departmentForm: FormGroup;
  loading = false;
  isEditMode = false;

  constructor(
    private fb: FormBuilder,
    private departmentService: DepartmentService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<DepartmentFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {
    this.isEditMode = !!data.department;

    this.departmentForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      description: ['', Validators.maxLength(500)]
    });

    if (this.isEditMode && data.department) {
      this.departmentForm.patchValue({
        name: data.department.name,
        description: data.department.description
      });
    }
  }

  onSubmit(): void {
    if (this.departmentForm.invalid) {
      return;
    }

    this.loading = true;

    const departmentRequest: DepartmentRequest = {
      name: this.departmentForm.value.name,
      description: this.departmentForm.value.description
    };

    if (this.isEditMode && this.data.department) {
      this.departmentService.updateDepartment(this.data.department.id, departmentRequest)
        .pipe(finalize(() => this.loading = false))
        .subscribe({
          next: () => {
            this.snackBar.open('Department updated successfully', 'Close', { duration: 3000 });
            this.dialogRef.close(true);
          },
          error: error => {
            console.error('Error updating department', error);
            this.snackBar.open('Failed to update department', 'Close', { duration: 5000 });
          }
        });
    } else {
      this.departmentService.createDepartment(departmentRequest)
        .pipe(finalize(() => this.loading = false))
        .subscribe({
          next: () => {
            this.snackBar.open('Department created successfully', 'Close', { duration: 3000 });
            this.dialogRef.close(true);
          },
          error: error => {
            console.error('Error creating department', error);
            this.snackBar.open('Failed to create department', 'Close', { duration: 5000 });
          }
        });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
