import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (this.authService.isLoggedIn()) {
      // Check if route has data.roles and user has one of the required roles
      if (route.data['roles'] && !this.checkRoles(route.data['roles'])) {
        this.router.navigate(['/unauthorized']);
        return false;
      }
      return true;
    }

    this.router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }

  private checkRoles(roles: string[]): boolean {
    return roles.some(role => this.authService.hasRole(role));
  }
}
