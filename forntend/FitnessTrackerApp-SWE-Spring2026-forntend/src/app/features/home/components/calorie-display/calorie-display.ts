import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { CalorieService, CalorieIntake } from '../../../../core/services/calorie';
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
  newGoal = 0;
  
  private subscription?: Subscription;

  constructor(private calorieService: CalorieService) {}

  ngOnInit(): void {
    // Subscribe to calorie intake changes
    this.subscription = this.calorieService.calorieIntake$.subscribe(data => {
      this.calorieData = data;
      this.percentage = this.calorieService.getPercentage();
      this.netCalories = this.calorieService.getNetCalories();
      this.remainingCalories = this.calorieService.getRemainingCalories();
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
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
    this.newGoal = this.calorieData?.goal || 2000;
  }

  // Save new goal
  saveGoal(): void {
    if (this.newGoal > 0 && this.newGoal <= 10000) {
      this.calorieService.updateGoal(this.newGoal);
      this.isEditingGoal = false;
    }
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
}