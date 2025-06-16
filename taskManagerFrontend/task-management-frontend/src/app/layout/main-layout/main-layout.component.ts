import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/services/auth.service';
import { UserResponse, UserRole } from '../../auth/models/auth.models';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-main-layout',
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss']
})
export class MainLayoutComponent implements OnInit {
  currentUser$: Observable<UserResponse | null>;
  isMenuOpen = false;

  menuItems = [
    {
      label: 'Dashboard',
      icon: 'dashboard',
      route: '/dashboard',
      roles: [UserRole.ADMIN, UserRole.DEPARTMENT_MANAGER, UserRole.EMPLOYEE]
    },
    {
      label: 'Tasks',
      icon: 'task',
      route: '/tasks',
      roles: [UserRole.ADMIN, UserRole.DEPARTMENT_MANAGER, UserRole.EMPLOYEE]
    },
    {
      label: 'Work Environments',
      icon: 'business',
      route: '/work-environments',
      roles: [UserRole.ADMIN, UserRole.DEPARTMENT_MANAGER, UserRole.EMPLOYEE]
    },
    {
      label: 'Users',
      icon: 'people',
      route: '/users',
      roles: [UserRole.ADMIN, UserRole.DEPARTMENT_MANAGER]
    },
    {
      label: 'Departments',
      icon: 'domain',
      route: '/departments',
      roles: [UserRole.ADMIN, UserRole.DEPARTMENT_MANAGER, UserRole.EMPLOYEE]
    }
  ];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.currentUser$ = this.authService.currentUser$;
  }

  ngOnInit(): void {}

  hasRole(roles: UserRole[], userRole?: UserRole): boolean {
    if (!userRole) return false;
    return roles.includes(userRole);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }
}
