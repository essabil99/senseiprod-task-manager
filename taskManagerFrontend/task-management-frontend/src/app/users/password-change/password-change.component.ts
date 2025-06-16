import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserService } from '../../core/services/user.service';
import { PasswordChangeRequest } from '../../auth/models/auth.models';
import { finalize } from 'rxjs/operators';

interface DialogData {
  userId: number;
}

@Component({
  selector: 'app-password-change',
  templateUrl: './password-change.component.html',
  styleUrls: ['./password-change.component.scss']
})
export class PasswordChangeComponent {
  passwordForm: FormGroup;
  loading = false;
  hideCurrentPassword = true;
  hideNewPassword = true;
  hideConfirmPassword = true;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<PasswordChangeComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {
    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  passwordMatchValidator(formGroup: FormGroup) {
    const newPassword = formGroup.get('newPassword')?.value;
    const confirmPassword = formGroup.get('confirmPassword')?.value;

    if (newPassword !== confirmPassword) {
      formGroup.get('confirmPassword')?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    } else {
      formGroup.get('confirmPassword')?.setErrors(null);
      return null;
    }
  }

  onSubmit(): void {
    if (this.passwordForm.invalid) {
      return;
    }

    this.loading = true;

    const passwordRequest: PasswordChangeRequest = {
      currentPassword: this.passwordForm.value.currentPassword,
      newPassword: this.passwordForm.value.newPassword,
      confirmPassword: this.passwordForm.value.confirmPassword
    };

    this.userService.changePassword(this.data.userId, passwordRequest)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: () => {
          this.dialogRef.close(true);
        },
        error: error => {
          console.error('Error changing password', error);
          const message = error.error?.message || 'Failed to change password';
          this.snackBar.open(message, 'Close', { duration: 5000 });
        }
      });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
