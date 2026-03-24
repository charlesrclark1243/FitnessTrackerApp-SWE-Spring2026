import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';

export const authGuard: CanActivateFn = (route, state) => {
  // Inject services
  const authService = inject(AuthService);
  const router = inject(Router);
  
  // Check if user is authenticated
  if (authService.isAuthenticated()) {
    // User is logged in, allow access
    return true;
  }
  
  // User is not logged in, redirect to login page
  // Save the attempted URL for redirecting after login
  router.navigate(['/login'], { 
    queryParams: { returnUrl: state.url }
  });
  return false;
};