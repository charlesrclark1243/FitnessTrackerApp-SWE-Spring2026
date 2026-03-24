import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTooltipModule } from '@angular/material/tooltip';
import { WaterService } from '../../../../core/services/water';
@Component({
  selector: 'app-water-intake',
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
  templateUrl: './water-intake.html',
  styleUrl: './water-intake.css'
})
export class WaterIntakeComponent implements OnInit {
  customAmount: number = 0;
  showCustomInput = false;
  
  // Quick add amounts
  quickAmounts = [
    { label: '250ml', value: 250, icon: 'local_cafe' },
    { label: '500ml', value: 500, icon: 'coffee' },
    { label: '1L', value: 1000, icon: 'sports_bar' }
  ];

  constructor(public waterService: WaterService) {}

  ngOnInit(): void {}

  // Add predefined amount
  addQuickAmount(amount: number): void {
    this.waterService.addWater(amount);
    this.showSuccessAnimation(amount);
  }

  // Add custom amount
  addCustomAmount(): void {
    if (this.customAmount > 0 && this.customAmount <= 5000) {
      this.waterService.addWater(this.customAmount);
      this.showSuccessAnimation(this.customAmount);
      this.customAmount = 0;
      this.showCustomInput = false;
    }
  }

  // Toggle custom input
  toggleCustomInput(): void {
    this.showCustomInput = !this.showCustomInput;
    if (this.showCustomInput) {
      this.customAmount = 0;
    }
  }

  // Undo last entry
  undoLast(): void {
    this.waterService.removeLastEntry();
  }

  // Simple success feedback (you can enhance this with animations)
  private showSuccessAnimation(amount: number): void {
    console.log(`✅ Added ${amount}ml of water!`);
  }
}