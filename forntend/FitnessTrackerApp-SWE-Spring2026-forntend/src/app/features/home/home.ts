import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { AuthService } from '../../core/services/auth';
import { WaterIntakeComponent } from './components/water-intake/water-intake';
import { WaterDisplayComponent } from './components/water-display/water-display';
import { WeightLogComponent } from './components/weight-log/weight-log';
import { WeightDisplayComponent } from './components/weight-display/weight-display';
import { CalorieInputComponent } from './components/calorie-input/calorie-input';
import { CalorieDisplayComponent } from './components/calorie-display/calorie-display';
import { StepInputComponent } from './components/step-input/step-input';
import { StepDisplayComponent } from './components/step-display/step-display';
import { HeartLogComponent } from './components/heart-log/heart-log';
import { HeartDisplayComponent } from './components/heart-display/heart-display';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule, 
    MatCardModule,
    WaterIntakeComponent,
    WaterDisplayComponent,
    WeightLogComponent,
    WeightDisplayComponent,
    CalorieInputComponent,    
    CalorieDisplayComponent,
    StepInputComponent,
    StepDisplayComponent,
    HeartLogComponent,
    HeartDisplayComponent
  ],
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
