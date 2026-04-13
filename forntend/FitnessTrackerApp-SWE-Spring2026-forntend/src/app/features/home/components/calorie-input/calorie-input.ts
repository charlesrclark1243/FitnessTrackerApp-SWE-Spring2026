import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatRadioModule } from '@angular/material/radio';
import { MatDividerModule } from '@angular/material/divider';
import { CalorieService } from '../../../../core/services/calorie';

@Component({
  selector: 'app-calorie-input',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatTabsModule,
    MatTooltipModule,
    MatRadioModule,
    MatDividerModule
  ],
  templateUrl: './calorie-input.html',
  styleUrl: './calorie-input.css'
})
export class CalorieInputComponent {
  customAmount: number = 0;
  customDescription: string = '';
  showCustomConsumed = false;
  showCustomBurned = false;
  selectedDirection: 'lose' | 'hold' | 'gain' = 'hold';
  settingGoal = false;
  goalMessage = '';
  
  // Quick add amounts for consumed calories
  quickConsumed = [
    { label: 'Snack', value: 150, icon: 'cookie' },
    { label: 'Small Meal', value: 400, icon: 'lunch_dining' },
    { label: 'Large Meal', value: 800, icon: 'dinner_dining' }
  ];

  // Quick add amounts for burned calories
  quickBurned = [
    { label: 'Walk 30min', value: 150, icon: 'directions_walk' },
    { label: 'Run 30min', value: 300, icon: 'directions_run' },
    { label: 'Gym 1hr', value: 400, icon: 'fitness_center' }
  ];

  constructor(public calorieService: CalorieService) {}

  // Set the daily calorie goal based on selected direction
  setGoal(): void {
    this.settingGoal = true;
    this.goalMessage = '';
    
    this.calorieService.setDailyGoal(this.selectedDirection).subscribe({
      next: (goal) => {
        this.goalMessage = `Daily goal set to ${goal} calories (${this.selectedDirection} mode)`;
        this.settingGoal = false;
        // Clear message after 3 seconds
        setTimeout(() => {
          this.goalMessage = '';
        }, 3000);
      },
      error: () => {
        this.goalMessage = 'Failed to set daily goal. Please try again.';
        this.settingGoal = false;
      }
    });
  }

  // Add predefined consumed calories
  addQuickConsumed(amount: number, description: string): void {
    this.calorieService.addConsumed(amount, description);
    console.log('Added consumed:', amount, description); // Debug log
  }

  // Add predefined burned calories
  addQuickBurned(amount: number, description: string): void {
    this.calorieService.addBurned(amount, description);
    console.log('Added burned:', amount, description); // Debug log
  }

  // Add custom consumed calories
  addCustomConsumed(): void {
    console.log('Custom consumed amount:', this.customAmount); // Debug log
    console.log('Custom description:', this.customDescription); // Debug log
    
    if (this.customAmount && this.customAmount > 0 && this.customAmount <= 5000) {
      const description = this.customDescription || 'Custom food';
      this.calorieService.addConsumed(this.customAmount, description);
      console.log('Consumed added successfully'); // Debug log
      this.resetCustomForm();
    } else {
      console.log('Invalid amount'); // Debug log
    }
  }

  // Add custom burned calories
  addCustomBurned(): void {
    console.log('Custom burned amount:', this.customAmount); // Debug log
    console.log('Custom description:', this.customDescription); // Debug log
    
    if (this.customAmount && this.customAmount > 0 && this.customAmount <= 5000) {
      const description = this.customDescription || 'Custom exercise';
      this.calorieService.addBurned(this.customAmount, description);
      console.log('Burned added successfully'); // Debug log
      this.resetCustomForm();
    } else {
      console.log('Invalid amount'); // Debug log
    }
  }

  // Toggle custom consumed input
  toggleCustomConsumed(): void {
    this.showCustomConsumed = !this.showCustomConsumed;
    this.showCustomBurned = false;
    console.log('Toggle custom consumed:', this.showCustomConsumed); // Debug log
    
    if (!this.showCustomConsumed) {
      this.resetCustomForm();
    }
  }

  // Toggle custom burned input
  toggleCustomBurned(): void {
    this.showCustomBurned = !this.showCustomBurned;
    this.showCustomConsumed = false;
    console.log('Toggle custom burned:', this.showCustomBurned); // Debug log
    
    if (!this.showCustomBurned) {
      this.resetCustomForm();
    }
  }

  // Reset custom form
  private resetCustomForm(): void {
    this.customAmount = 0;
    this.customDescription = '';
    this.showCustomConsumed = false;
    this.showCustomBurned = false;
  }

  // Undo last entry
  undoLast(): void {
    this.calorieService.removeLastEntry();
  }
}