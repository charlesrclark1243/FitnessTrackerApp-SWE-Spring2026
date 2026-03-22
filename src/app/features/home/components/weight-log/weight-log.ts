import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { WeightService } from '../../../../core/services/weight';
import { AuthService } from '../../../../core/services/auth';

interface WeightLog {
  id: number;
  userId: number;
  weightKG: number;
  loggedAt: string;
}

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
    MatButtonToggleModule
  ],
  templateUrl: './weight-log.html',
  styleUrl: './weight-log.css'
})
export class WeightLogComponent implements OnInit {
  logs: WeightLog[] = [];
  loading = false;
  errorMessage = '';
  successMessage = '';
  unit: 'kg' | 'lbs' = 'kg';
  showLogs = false;
  logsLoaded = false;

  form = this.fb.group({
    weight: [null as number | null, [Validators.required, Validators.min(1)]]
  });

  constructor(
    private fb: FormBuilder,
    private weightService: WeightService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadRecentWeights();
  }

  loadRecentWeights(): void {
  this.weightService.getRecentWeights(30).subscribe({
    next: (logs) => {
      this.logs = logs;
    },
    error: () => {
      this.errorMessage = 'Failed to load recent weights.';
    }
  });
}

  onSubmit(): void {
    if (this.form.invalid) return;

    this.errorMessage = '';
    this.successMessage = '';
    this.loading = true;

    const rawWeight = Number(this.form.value.weight);
    const weightKG =
      this.unit === 'kg' ? rawWeight : rawWeight * 0.45359237;

    this.weightService.logWeight(weightKG).subscribe({
      next: () => {
        this.successMessage = 'Weight logged successfully.';
        this.loading = false;
        this.form.reset();

        // only refresh when logs are visible
        if (this.showLogs) {
          this.loadRecentWeights();
        }

        // update profile weight
        this.authService.updateProfile({ weight: weightKG }).subscribe({
          error: () => {}
        });
      },
      error: () => {
        this.errorMessage = 'Failed to log weight.';
        this.loading = false;
      }
    });
  }

  displayWeight(weightKG: number): string {
    if (this.unit === 'kg') {
      return `${weightKG.toFixed(1)} kg`;
    }
    return `${(weightKG / 0.45359237).toFixed(1)} lbs`;
  }

  toggleLogs(): void {
    this.showLogs = !this.showLogs;

    if (this.showLogs && !this.logsLoaded) {
      this.loadRecentWeights();
      this.logsLoaded = true;
    }
  }
}