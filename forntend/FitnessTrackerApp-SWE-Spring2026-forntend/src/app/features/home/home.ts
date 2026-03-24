import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { AuthService } from '../../core/services/auth';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class HomeComponent {
  username$: Observable<string | undefined>;

  constructor(private authService: AuthService) {
    this.username$ = this.authService.currentUser.pipe(
      map(user => user?.username)
    );
  }
}