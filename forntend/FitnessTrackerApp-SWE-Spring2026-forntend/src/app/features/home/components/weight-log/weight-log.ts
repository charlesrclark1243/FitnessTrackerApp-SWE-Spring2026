import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { finalize } from 'rxjs/operators';
import { WeightService } from '../../../../core/services/weight';
import { AuthService } from '../../../../core/services/auth';

@Component({
  selector: 'app-weight-log',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatTooltipModule,
  ],
  templateUrl: './weight-log.html',
  styleUrl: './weight-log.css'
})
export class WeightLogComponent {
  @Output() logged = new EventEmitter<void>();

  loading = false;
  errorMessage = '';
  successMessage = '';
  modifyErrorMessage = '';
  unit: 'kg' | 'lbs' = 'kg';
  showModifyForm = false;

  form = this.fb.group({
    weight: [null as number | null, [Validators.required, Validators.min(1)]]
  });

  modifyForm = this.fb.group({
    weight: [null as number | null, [Validators.required, Validators.min(1)]]
  });

  constructor(
    private fb: FormBuilder,
    private weightService: WeightService,
    private authService: AuthService
  ) {}

  onSubmit(): void {
    if (this.form.invalid) return;

    this.errorMessage = '';
    this.successMessage = '';
    this.modifyErrorMessage = '';
    this.loading = true;

    const rawWeight = Number(this.form.value.weight);
    const weightKG = this.unit === 'kg' ? rawWeight : rawWeight * 0.45359237;

    this.weightService.logWeight(weightKG).subscribe({
      next: () => {
        this.successMessage = 'Weight logged successfully.';
        this.loading = false;
        this.form.reset();
        this.logged.emit();
        this.authService.updateProfile({ weight: weightKG }).subscribe({ error: () => {} });
      },
      error: () => {
        this.errorMessage = 'Failed to log weight.';
        this.loading = false;
      }
    });
  }

  modifyMostRecent(): void {
    if (this.modifyForm.invalid) return;

    this.errorMessage = '';
    this.successMessage = '';
    this.modifyErrorMessage = '';
    this.loading = true;

    const rawWeight = Number(this.modifyForm.value.weight);
    const weightKG = this.unit === 'kg' ? rawWeight : rawWeight * 0.45359237;

    this.weightService.modifyWeight(weightKG).pipe(
      finalize(() => { this.loading = false; })
    ).subscribe({
      next: () => {
        this.successMessage = 'Weight updated successfully.';
        this.modifyForm.reset();
        this.showModifyForm = false;
        this.logged.emit();
        this.authService.updateProfile({ weight: weightKG }).subscribe({ error: () => {} });
      },
      error: () => {
        this.modifyErrorMessage = 'Failed to update weight.';
      }
    });
  }

  toggleModifyForm(): void {
    this.showModifyForm = !this.showModifyForm;
    this.modifyErrorMessage = '';
    if (!this.showModifyForm) {
      this.modifyForm.reset();
    } else {
      // Pre-fill from service
      this.weightService.getRecentWeights().subscribe({
        next: (logs) => {
          if (logs.length > 0) {
            const mostRecentKG = logs[0].weightKG;
            const displayValue = this.unit === 'kg'
              ? mostRecentKG.toFixed(1)
              : (mostRecentKG / 0.45359237).toFixed(1);
            this.modifyForm.patchValue({ weight: parseFloat(displayValue) });
          }
        }
      });
    }
  }
}