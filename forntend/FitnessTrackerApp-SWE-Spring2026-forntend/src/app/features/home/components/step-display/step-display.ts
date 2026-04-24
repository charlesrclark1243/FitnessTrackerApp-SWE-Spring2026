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
import { StepService, StepData } from '../../../../core/services/step';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-step-display',
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
  templateUrl: './step-display.html',
  styleUrl: './step-display.css'
})
export class StepDisplayComponent implements OnInit, OnDestroy {
  stepData: StepData | null = null;
  percentage = 0;
  remainingSteps = 0;
  estimatedDistance = 0;
  estimatedCalories = 0;
  isEditingGoal = false;
  newGoal = 0;
  
  private subscription?: Subscription;

  constructor(private stepService: StepService) {}

  ngOnInit(): void {
    // Subscribe to step data changes
    this.subscription = this.stepService.stepData$.subscribe(data => {
      this.stepData = data;
      this.percentage = this.stepService.getPercentage();
      this.remainingSteps = this.stepService.getRemainingSteps();
      this.estimatedDistance = this.stepService.getEstimatedDistance();
      this.estimatedCalories = this.stepService.getEstimatedCalories();
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

  // Format number with commas
  formatNumber(num: number): string {
    return num.toLocaleString();
  }

  // Start editing goal
  startEditGoal(): void {
    this.isEditingGoal = true;
    this.newGoal = this.stepData?.goal || 10000;
  }

  // Save new goal
  saveGoal(): void {
    if (this.newGoal > 0 && this.newGoal <= 100000) {
      this.stepService.updateGoal(this.newGoal);
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
      return '🎉 Amazing! You\'ve reached your daily goal!';
    } else if (this.percentage >= 75) {
      return '💪 Almost there! Keep moving!';
    } else if (this.percentage >= 50) {
      return '👍 Halfway to your goal!';
    } else if (this.percentage >= 25) {
      return '🚶 Good start! Keep going!';
    } else {
      return '👟 Let\'s start walking!';
    }
  }
}