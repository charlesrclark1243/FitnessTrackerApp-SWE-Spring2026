import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, map, switchMap, throwError, of, catchError } from 'rxjs';
import { Router } from '@angular/router';

// Interface for user data
interface User {
  id: string;
  username: string;
  token: string;
  height?: number;
  weight?: number;
  dateOfBirth?: string;
  sex?: string;
  neck?: number;  // cm
  waist?: number; // cm
  hips?: number;  // cm (only used for females)
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // API endpoint - CHANGE THIS to your backend URL
  private apiUrl = 'http://localhost:3000/api/auth';

  
  // BehaviorSubject to track current user state
  private currentUserSubject: BehaviorSubject<User | null>;
  
  // Observable that components can subscribe to
  public currentUser: Observable<User | null>;

  // Platform check for SSR
  private platformId = inject(PLATFORM_ID);
  private isBrowser: boolean;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    // Check if we're running in a browser
    this.isBrowser = isPlatformBrowser(this.platformId);
    
    // On app startup, check if user is already logged in (only in browser)
    let storedUser = null;
    if (this.isBrowser) {
      const storedUserString = localStorage.getItem('currentUser');
      storedUser = storedUserString ? JSON.parse(storedUserString) : null;
    }
    
    this.currentUserSubject = new BehaviorSubject<User | null>(storedUser);
    this.currentUser = this.currentUserSubject.asObservable();
  }

  // Getter for current user value
  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  // Check if user is authenticated
  public isAuthenticated(): boolean {
    return !!this.currentUserValue;
  }

  // Get the JWT token
  public getToken(): string | null {
    return this.currentUserValue?.token || null;
  }

  // Register new user - accepts an object with all user data
  register(userData: {
    username: string;
    password: string;
    height?: number;
    weight?: number;
    dateOfBirth?: Date | string;
    sex?: string;
  }): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/register`, userData)
      .pipe(
        tap(user => {
          // Save user to localStorage and update subject (only in browser)
          if (this.isBrowser) {
            localStorage.setItem('currentUser', JSON.stringify(user));
          }
          this.currentUserSubject.next(user);
        })
      );
  }

  // Login existing user
  login(username: string, password: string): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/login`, { username, password })
      .pipe(
        tap(user => {
          // Save user to localStorage and update subject (only in browser)
          if (this.isBrowser) {
            localStorage.setItem('currentUser', JSON.stringify(user));
          }
          this.currentUserSubject.next(user);
        })
      );
  }

  // Logout user
  logout(): void {
    // Remove user from localStorage (only in browser)
    if (this.isBrowser) {
      localStorage.removeItem('currentUser');
    }
    // Update subject to null
    this.currentUserSubject.next(null);
    // Redirect to login page
    this.router.navigate(['/login']);
  }

  // Dev-only login (no backend needed)
  devLogin(username: string): void {
    const user: User = {
      id: 'dev',
      username,
      token: 'dev-token',
    };

    if (this.isBrowser) {
      localStorage.setItem('currentUser', JSON.stringify(user));
    }

    this.currentUserSubject.next(user);
  }


  updateProfile(profile: {
    height?: number;
    weight?: number;
    dateOfBirth?: string;
    sex?: string;
    neck?: number;
    waist?: number;
    hips?: number;
  }): Observable<User> {
    const user = this.currentUserValue;
    if (!user) return of(null as unknown as User);

    // local apply function (keeps app state consistent)
    const applyLocal = (updatedUser: User) => {
      if (this.isBrowser) {
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      }
      this.currentUserSubject.next(updatedUser);
    };

    // API-first: PATCH /api/users/:id
    return this.http.patch<User>(`http://localhost:3000/api/users/${user.id}`, profile).pipe(
      tap(updatedUser => applyLocal(updatedUser)),

      // fallback: still update locally if API is down (dev convenience)
      catchError(() => {
        const updatedLocal = { ...user, ...profile } as User;
        applyLocal(updatedLocal);
        return of(updatedLocal);
      })
    );
  }




}



