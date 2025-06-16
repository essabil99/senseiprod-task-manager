import { Injectable } from "@angular/core"
import { HttpClient } from "@angular/common/http"
import { BehaviorSubject, type Observable, of } from "rxjs"
import { tap, catchError } from "rxjs/operators"
import { JwtHelperService } from "@auth0/angular-jwt"
import { environment } from "../../../environments/environment"
import type { LoginRequest, LoginResponse, RegisterRequest, UserResponse } from "../models/auth.models"

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<UserResponse | null>(null)
  public currentUser$ = this.currentUserSubject.asObservable()
  private jwtHelper = new JwtHelperService()

  constructor(private http: HttpClient) {
    this.loadCurrentUser()
  }

  login(loginRequest: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login`, loginRequest).pipe(
      tap((response) => {
        localStorage.setItem(environment.jwtTokenKey, response.token)
        localStorage.setItem("current_user", JSON.stringify(response.user))
        this.currentUserSubject.next(response.user)
      }),
    )
  }

  register(registerRequest: RegisterRequest): Observable<UserResponse> {
    console.log("Making register request to:", `${environment.apiUrl}/auth/register`)
    return this.http.post<UserResponse>(`${environment.apiUrl}/auth/register`, registerRequest).pipe(
      catchError((error) => {
        console.error("Register error:", error)
        throw error
      }),
    )
  }

  logout(): void {
    localStorage.removeItem(environment.jwtTokenKey)
    localStorage.removeItem("current_user")
    this.currentUserSubject.next(null)
  }

  getCurrentUser(): Observable<UserResponse> {
    return this.http.get<UserResponse>(`${environment.apiUrl}/auth/me`).pipe(
      tap((user) => {
        this.currentUserSubject.next(user)
        // Store user data in localStorage for persistence
        localStorage.setItem("current_user", JSON.stringify(user))
      }),
      catchError((error) => {
        console.error("Get current user error:", error)
        // Don't automatically logout on error - let the user stay logged in
        // this.logout();
        return of(null as any)
      }),
    )
  }

  isLoggedIn(): boolean {
    const token = localStorage.getItem(environment.jwtTokenKey)
    const isValid = token !== null && !this.jwtHelper.isTokenExpired(token)
    console.log("Is logged in:", isValid, "Token exists:", !!token)
    return isValid
  }

  getToken(): string | null {
    return localStorage.getItem(environment.jwtTokenKey)
  }

  hasRole(role: string): boolean {
    const user = this.currentUserSubject.value
    return user !== null && user.role === role
  }

  private loadCurrentUser(): void {
    const token = this.getToken()
    if (token && !this.jwtHelper.isTokenExpired(token)) {
      // Try to decode user info from token first
      try {
        const decodedToken = this.jwtHelper.decodeToken(token)
        if (decodedToken) {
          // Create a mock user object from token or use stored user data
          const storedUser = localStorage.getItem("current_user")
          if (storedUser) {
            this.currentUserSubject.next(JSON.parse(storedUser))
            return
          }
        }
      } catch (error) {
        console.log("Could not decode token, will try to fetch user data")
      }

      // Only make HTTP request if we don't have stored user data
      this.getCurrentUser().subscribe({
        error: (error) => {
          console.log("Could not fetch current user, but keeping token valid")
          // Don't logout on error during development
        },
      })
    }
  }
}
