import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { CalorieService, CalorieIntake } from '../../../../core/services/calorie';
import { ProfileService } from '../../../../core/services/profile';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-calorie-display',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatProgressBarModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTooltipModule,
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
  isEditingGoal = false;
  selectedGoalDirection: 'lose' | 'hold' | 'gain' = 'hold';
  goalLoading = false;
  goalError = '';
  
  private subscriptions = new Subscription();

  constructor(
    private calorieService: CalorieService,
    private profileService: ProfileService
  ) {}

  ngOnInit(): void {
    // Subscribe to calorie intake changes
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

  // Get progress bar color based on percentage
  getProgressColor(): string {
    if (this.percentage >= 100) return 'warn';
    if (this.percentage >= 75) return 'accent';
    return 'primary';
  }

  // Format number with commas
  formatNumber(num: number): string {
    return num.toLocaleString();
  }

  // Start editing goal
  startEditGoal(): void {
    this.isEditingGoal = true;
    this.goalError = '';
  }

  // Save new goal from backend calculation
  saveGoal(): void {
    this.setGoalFromBackend(this.selectedGoalDirection, true);
  }

  // Cancel editing goal
  cancelEditGoal(): void {
    this.isEditingGoal = false;
  }

  // Get motivational message based on progress
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
    this.goalLoading = true;
    this.goalError = '';

    this.subscriptions.add(
      this.profileService.loadProfile().subscribe({
        next: (profile) => {
          const direction = this.normalizeDirection(profile?.weight_goal);
          this.selectedGoalDirection = direction;
          this.setGoalFromBackend(direction, false);
        },
        error: () => {
          this.setGoalFromBackend(this.selectedGoalDirection, false);
        }
      })
    );
  }

  private setGoalFromBackend(direction: 'lose' | 'hold' | 'gain', closeEditor: boolean): void {
    this.goalLoading = true;
    this.goalError = '';

    this.subscriptions.add(
      this.calorieService.setDailyGoal(direction).subscribe({
        next: () => {
          this.goalLoading = false;
          if (closeEditor) {
            this.isEditingGoal = false;
          }
        },
        error: () => {
          this.goalLoading = false;
          this.goalError = 'Could not update goal from backend.';
        }
      })
    );
  }

  private normalizeDirection(value?: string): 'lose' | 'hold' | 'gain' {
    if (value === 'lose' || value === 'gain' || value === 'hold') {
      return value;
    }
    return 'hold';
  }
}