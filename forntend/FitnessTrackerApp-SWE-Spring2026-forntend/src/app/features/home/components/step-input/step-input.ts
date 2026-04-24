import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTooltipModule } from '@angular/material/tooltip';
import { StepService } from '../../../../core/services/step';

@Component({
  selector: 'app-step-input',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatTooltipModule
  ],
  templateUrl: './step-input.html',
  styleUrl: './step-input.css'
})
export class StepInputComponent {
  customAmount: number = 0;
  customDescription: string = '';
  showCustomInput = false;
  
  // Quick add amounts
  quickSteps = [
    { label: 'Short Walk', value: 500, icon: 'directions_walk' },
    { label: '10 Minutes', value: 1000, icon: 'schedule' },
    { label: '20 Minutes', value: 2500, icon: 'timer' }
  ];

  constructor(public stepService: StepService) {}

  // Add predefined steps
  addQuickSteps(amount: number, description: string): void {
    this.stepService.addSteps(amount, description);
    console.log('Added steps:', amount, description);
  }

  // Add custom steps
  addCustomSteps(): void {
    console.log('Custom amount:', this.customAmount);
    console.log('Custom description:', this.customDescription);
    
    if (this.customAmount && this.customAmount > 0 && this.customAmount <= 50000) {
      const description = this.customDescription || 'Walking';
      this.stepService.addSteps(this.customAmount, description);
      console.log('Steps added successfully');
      this.resetCustomForm();
    } else {
      console.log('Invalid amount');
    }
  }

  // Toggle custom input
  toggleCustomInput(): void {
    this.showCustomInput = !this.showCustomInput;
    console.log('Toggle custom input:', this.showCustomInput);
    
    if (!this.showCustomInput) {
      this.resetCustomForm();
    }
  }

  // Reset custom form
  private resetCustomForm(): void {
    this.customAmount = 0;
    this.customDescription = '';
    this.showCustomInput = false;
  }

  // Undo last entry
  undoLast(): void {
    this.stepService.removeLastEntry();
  }
}