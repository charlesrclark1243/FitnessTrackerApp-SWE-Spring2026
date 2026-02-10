import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/components/login/login';
import { RegisterComponent } from './features/auth/components/register/register';
import { HomeComponent } from './features/home/home';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
  // Protected route - requires authentication
  {
    path: '',
    component: HomeComponent,
    canActivate: [authGuard]
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