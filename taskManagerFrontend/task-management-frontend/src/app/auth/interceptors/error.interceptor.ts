import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  constructor(
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          // Auto logout if 401 response returned from API
          this.authService.logout();
          this.router.navigate(['/auth/login']);
          this.snackBar.open('Session expired. Please log in again.', 'Close', {
            duration: 5000
          });
        } else if (error.status === 403) {
          this.router.navigate(['/unauthorized']);
          this.snackBar.open('You do not have permission to access this resource.', 'Close', {
            duration: 5000
          });
        } else if (error.status === 400) {
          const errorMessage = error.error?.message || 'Bad request';
          this.snackBar.open(errorMessage, 'Close', {
            duration: 5000
          });
        } else {
          const errorMessage = error.error?.message || 'An error occurred';
          this.snackBar.open(errorMessage, 'Close', {
            duration: 5000
          });
        }

        return throwError(() => error);
      })
    );
  }
}
