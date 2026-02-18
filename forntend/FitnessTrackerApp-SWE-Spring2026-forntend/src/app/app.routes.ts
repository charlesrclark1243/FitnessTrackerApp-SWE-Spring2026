import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/components/login/login';
import { RegisterComponent } from './features/auth/components/register/register';
import { HomeComponent } from './features/home/home';
import { authGuard } from './core/guards/auth-guard';
import { HealthProfileComponent } from './features/profile/health-profile/health-profile';

export const routes: Routes = [
  // Protected route - requires authentication
  {
    path: '',
    component: HomeComponent,
    canActivate: [authGuard]
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/profile/health-profile/health-profile')
        .then(m => m.HealthProfileComponent),
  },
  // Public routes
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'register',
    component: RegisterComponent
  },
  // Redirect unknown routes to home
  {
    path: '**',
    redirectTo: ''
  }
];