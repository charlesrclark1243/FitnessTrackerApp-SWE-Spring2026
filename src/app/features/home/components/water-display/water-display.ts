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
import { WaterService, WaterIntake } from '../../../../core/services/water';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-water-display',
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
    MatTooltipModule
  ],
  templateUrl: './water-display.html',
  styleUrl: './water-display.css'
})
export class WaterDisplayComponent implements OnInit, OnDestroy {
  waterData: WaterIntake | null = null;
  percentage = 0;
  isEditingGoal = false;
  newGoal = 0;
  
  private subscription?: Subscription;

  constructor(private waterService: WaterService) {}

  ngOnInit(): void {
    // Subscribe to water intake changes
    this.subscription = this.waterService.waterIntake$.subscribe(data => {
      this.waterData = data;
      this.percentage = this.waterService.getPercentage();
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  // Get progress bar color based on percentage
  getProgressColor(): string {
    if (this.percentage >= 100) return 'accent';
    if (this.percentage >= 50) return 'primary';
    return 'warn';
  }

  // Format amount with commas
  formatAmount(amount: number): string {
    return amount.toLocaleString();
  }

  // Start editing goal
  startEditGoal(): void {
    this.isEditingGoal = true;
    this.newGoal = this.waterData?.goal || 2000;
  }

  // Save new goal
  saveGoal(): void {
    if (this.newGoal > 0 && this.newGoal <= 10000) {
      this.waterService.updateGoal(this.newGoal);
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
      return '🎉 Great job! Goal achieved!';
    } else if (this.percentage >= 75) {
      return '💪 Almost there! Keep going!';
    } else if (this.percentage >= 50) {
      return '👍 Halfway there! You\'re doing great!';
    } else if (this.percentage >= 25) {
      return '🌊 Good start! Keep drinking!';
    } else {
      return '💧 Let\'s stay hydrated today!';
    }
  }
}