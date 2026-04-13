import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { CalorieService, CalorieIntake } from '../../../../core/services/calorie';
import { ProfileService } from '../../../../core/services/profile';
import { Subscription } from 'rxjs';
import { timeout } from 'rxjs/operators';

@Component({
  selector: 'app-calorie-display',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatProgressBarModule,
    MatIconModule,
    MatChipsModule
  ],
  templateUrl: './calorie-display.html',
  styleUrl: './calorie-display.css'
})
export class CalorieDisplayComponent implements OnInit, OnDestroy {
  calorieData: CalorieIntake | null = null;
  percentage = 0;
  netCalories = 0;
  remainingCalories = 0;
  selectedGoalDirection: 'lose' | 'hold' | 'gain' = 'hold';
  private readonly REQUEST_TIMEOUT_MS = 8000;
  
  private subscriptions = new Subscription();

  constructor(
    private calorieService: CalorieService,
    private profileService: ProfileService
  ) {}

  ngOnInit(): void {
    this.subscriptions.add(
      this.calorieService.calorieIntake$.subscribe(data => {
        this.calorieData = data;
        this.percentage = this.calorieService.getPercentage();
        this.netCalories = this.calorieService.getNetCalories();
        this.remainingCalories = this.calorieService.getRemainingCalories();
      })
    );

    this.initializeGoalFromBackend();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  getProgressColor(): string {
    if (this.percentage >= 100) return 'warn';
    if (this.percentage >= 75) return 'accent';
    return 'primary';
  }

  formatNumber(num: number): string {
    return num.toLocaleString();
  }

  getMotivationalMessage(): string {
    if (this.percentage >= 100) {
      return '⚠️ You\'ve reached your daily goal!';
    } else if (this.percentage >= 75) {
      return '👍 Getting close to your goal!';
    } else if (this.percentage >= 50) {
      return '💪 Halfway there!';
    } else if (this.percentage >= 25) {
      return '🔥 Good start for today!';
    } else {
      return '🎯 Let\'s track your calories!';
    }
  }

  private initializeGoalFromBackend(): void {
    this.subscriptions.add(
      this.profileService.loadProfile().pipe(timeout(this.REQUEST_TIMEOUT_MS)).subscribe({
        next: (profile) => {
          const direction = this.normalizeDirection(profile?.weight_goal);
          this.selectedGoalDirection = direction;

          // Recalculate and persist today's displayed calorie goal from backend.
          this.subscriptions.add(
            this.calorieService.setDailyGoal(direction).pipe(timeout(this.REQUEST_TIMEOUT_MS)).subscribe({
              next: () => {},
              error: () => {}
            })
          );
        },
        error: () => {}
      })
    );
  }

  get goalDirectionLabel(): string {
    switch (this.selectedGoalDirection) {
      case 'lose': return 'Lose Weight';
      case 'gain': return 'Gain Weight';
      default:     return 'Maintain Weight';
    }
  }

  private normalizeDirection(value?: string): 'lose' | 'hold' | 'gain' {
    if (value === 'lose' || value === 'gain' || value === 'hold') {
      return value;
    }
    return 'hold';
  }
}