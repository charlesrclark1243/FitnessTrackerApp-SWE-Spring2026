import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../core/services/auth';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './navigation.html',
  styleUrl: './navigation.css'
})
export class NavigationComponent {
  // Observable that emits true if user is logged in
  isAuthenticated$: Observable<boolean>;
  // Observable for username
  username$: Observable<string | undefined>;

  constructor(private authService: AuthService) {
    // Map currentUser observable to boolean
    this.isAuthenticated$ = this.authService.currentUser.pipe(
      map(user => !!user)
    );
    
    // Map currentUser observable to username
    this.username$ = this.authService.currentUser.pipe(
      map(user => user?.username)
    );
  }

  logout() {
    this.authService.logout();
  }
}