import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatTabsModule } from '@angular/material/tabs';
import { finalize } from 'rxjs/operators';
import { WeightService } from '../../../../core/services/weight';
import { AuthService } from '../../../../core/services/auth';

interface WeightLog {
  id: number;
  userId: number;
  weightKG: number;
  loggedAt: string;
}

interface ChartDateMarker {
  leftPercent: number;
  label: string;
}

interface ChartPoint {
  x: number;
  y: number;
  weightLabel: string;
  dateLabel: string;
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
    MatButtonToggleModule,
    MatTabsModule
  ],
  templateUrl: './weight-log.html',
  styleUrl: './weight-log.css'
})
export class WeightLogComponent implements OnInit {
  logs: WeightLog[] = [];
  loading = false;
  errorMessage = '';
  successMessage = '';
  modifyErrorMessage = '';
  unit: 'kg' | 'lbs' = 'kg';
  showModifyForm = false;

  readonly graphWidth = 640;
  readonly graphHeight = 260;
  readonly graphPadding = 28;

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

  ngOnInit(): void {
    this.loadRecentWeights();
  }

  loadRecentWeights(): void {
    this.weightService.getRecentWeights().subscribe({
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
    this.modifyErrorMessage = '';
    this.loading = true;

    const rawWeight = Number(this.form.value.weight);
    const weightKG =
      this.unit === 'kg' ? rawWeight : rawWeight * 0.45359237;

    this.weightService.logWeight(weightKG).subscribe({
      next: () => {
        this.successMessage = 'Weight logged successfully.';
        this.loading = false;
        this.form.reset();
        this.loadRecentWeights();

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

  modifyMostRecent(): void {
    if (this.modifyForm.invalid || this.logs.length === 0) return;

    this.errorMessage = '';
    this.successMessage = '';
    this.modifyErrorMessage = '';
    this.loading = true;

    const rawWeight = Number(this.modifyForm.value.weight);
    const weightKG =
      this.unit === 'kg' ? rawWeight : rawWeight * 0.45359237;

    let didSucceed = false;

    this.weightService.modifyWeight(weightKG).pipe(
      finalize(() => {
        if (!didSucceed) {
          this.modifyErrorMessage = 'Failed to update weight.';
          this.errorMessage = 'Failed to update weight.';
          this.loading = false;
        }
      })
    ).subscribe({
      next: (updatedLog) => {
        if (!updatedLog || updatedLog.id <= 0 || !Number.isFinite(updatedLog.weightKG)) {
          return;
        }
        didSucceed = true;
        this.successMessage = 'Weight updated successfully.';
        this.loading = false;
        this.modifyForm.reset();
        this.showModifyForm = false;
        this.loadRecentWeights();

        // update profile weight
        this.authService.updateProfile({ weight: weightKG }).subscribe({
          error: () => {}
        });
      },
      error: () => {
        // Error UI is handled by finalize when request does not succeed.
      }
    });
  }

  toggleModifyForm(): void {
    this.showModifyForm = !this.showModifyForm;
    this.modifyErrorMessage = '';
    if (this.showModifyForm && this.logs.length > 0) {
      // Pre-fill with current most recent weight
      const mostRecentKG = this.logs[0].weightKG;
      const displayValue = this.unit === 'kg' 
        ? mostRecentKG.toFixed(1) 
        : (mostRecentKG / 0.45359237).toFixed(1);
      this.modifyForm.patchValue({ weight: parseFloat(displayValue) });
    } else {
      this.modifyForm.reset();
    }
  }

  displayWeight(weightKG: number): string {
    if (this.unit === 'kg') {
      return `${weightKG.toFixed(1)} kg`;
    }
    return `${(weightKG / 0.45359237).toFixed(1)} lbs`;
  }

  get chartLogs(): WeightLog[] {
    return [...this.logs].sort(
      (a, b) => new Date(a.loggedAt).getTime() - new Date(b.loggedAt).getTime()
    );
  }

  get chartPoints(): string {
    return this.chartPointData.map((point) => `${point.x},${point.y}`).join(' ');
  }

  get chartAreaPoints(): string {
    const points = this.chartPointData;
    if (points.length === 0) return '';

    const first = points[0];
    const last = points[points.length - 1];
    const baseY = this.graphHeight - this.graphPadding;

    const area = [`${first.x},${baseY}`, ...points.map((point) => `${point.x},${point.y}`), `${last.x},${baseY}`];
    return area.join(' ');
  }

  get chartPointData(): ChartPoint[] {
    const points = this.chartLogs;
    if (points.length === 0) return [];

    const values = points.map((log) => this.toDisplayUnit(log.weightKG));
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;

    const innerWidth = this.graphWidth - this.graphPadding * 2;
    const innerHeight = this.graphHeight - this.graphPadding * 2;

    return points.map((log, index) => {
      const value = this.toDisplayUnit(log.weightKG);
      const x =
        points.length === 1
          ? this.graphPadding + innerWidth / 2
          : this.graphPadding + (index / (points.length - 1)) * innerWidth;
      const y = this.graphPadding + ((max - value) / range) * innerHeight;

      return {
        x,
        y,
        weightLabel: `${value.toFixed(1)} ${this.unit}`,
        dateLabel: new Date(log.loggedAt).toLocaleString()
      };
    });
  }

  get chartGridLinesY(): number[] {
    const lines = 4;
    const innerHeight = this.graphHeight - this.graphPadding * 2;
    return Array.from({ length: lines + 1 }, (_, i) => this.graphPadding + (i / lines) * innerHeight);
  }

  get chartMinLabel(): string {
    if (this.logs.length === 0) return '';
    const min = Math.min(...this.logs.map((log) => this.toDisplayUnit(log.weightKG)));
    return `${min.toFixed(1)} ${this.unit}`;
  }

  get chartMaxLabel(): string {
    if (this.logs.length === 0) return '';
    const max = Math.max(...this.logs.map((log) => this.toDisplayUnit(log.weightKG)));
    return `${max.toFixed(1)} ${this.unit}`;
  }

  get chartStartDate(): string {
    const points = this.chartLogs;
    if (points.length === 0) return '';
    return new Date(points[0].loggedAt).toLocaleDateString();
  }

  get chartEndDate(): string {
    const points = this.chartLogs;
    if (points.length === 0) return '';
    return new Date(points[points.length - 1].loggedAt).toLocaleDateString();
  }

  get chartDateMarkers(): ChartDateMarker[] {
    const points = this.chartLogs;
    if (points.length === 0) return [];

    const seenDays = new Set<string>();
    const total = points.length;

    return points
      .map((log, index) => {
        const date = new Date(log.loggedAt);
        const dayKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

        if (seenDays.has(dayKey)) {
          return null;
        }

        seenDays.add(dayKey);

        const leftPercent =
          total === 1
            ? 50
            : (index / (total - 1)) * 100;

        return {
          leftPercent,
          label: date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
        };
      })
      .filter((marker): marker is ChartDateMarker => marker !== null);
  }

  private toDisplayUnit(weightKG: number): number {
    if (this.unit === 'kg') {
      return weightKG;
    }

    return weightKG / 0.45359237;
  }
}