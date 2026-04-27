import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { finalize } from 'rxjs/operators';
import { HeartService, HeartSummary, HeartRateEntry, BloodPressureEntry } from '../../../../core/services/heart';

@Component({
  selector: 'app-heart-display',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './heart-display.html',
  styleUrl: './heart-display.css'
})
export class HeartDisplayComponent implements OnInit {
  summary: HeartSummary | null = null;
  loading = false;
  error = '';
  noData = false;

  constructor(
    private heartService: HeartService,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading = true;
    this.error = '';
    this.noData = false;
    this.summary = null;
    this.cdr.markForCheck();
    this.heartService.getSummary().pipe(
      finalize(() => { this.loading = false; this.cdr.markForCheck(); })
    ).subscribe({
      next: (data) => {
        const hasEntries =
          (data.heart_rate_entries && data.heart_rate_entries.length > 0) ||
          (data.blood_pressure_entries && data.blood_pressure_entries.length > 0) ||
          (data.median_heart_rate != null && data.median_heart_rate !== 0) ||
          (data.median_systolic != null && data.median_systolic !== 0);
        if (hasEntries) {
          this.summary = data;
        } else {
          this.noData = true;
        }
      },
      error: (err: unknown) => {
        const status = (err instanceof HttpErrorResponse) ? err.status : 0;
        if (status === 404) {
          this.noData = true;
        } else {
          this.error = 'Failed to load heart data. Please try again.';
        }
      }
    });
  }

  deleteHeartRate(entry: HeartRateEntry) {
    this.heartService.deleteEntry('heart_rate', entry.id).subscribe({
      next: () => {
        this.snackBar.open('Entry deleted.', '', { duration: 2000 });
        this.load();
      },
      error: () => this.snackBar.open('Failed to delete entry.', '', { duration: 3000 })
    });
  }

  deleteBloodPressure(entry: BloodPressureEntry) {
    this.heartService.deleteEntry('blood_pressure', entry.id).subscribe({
      next: () => {
        this.snackBar.open('Entry deleted.', '', { duration: 2000 });
        this.load();
      },
      error: () => this.snackBar.open('Failed to delete entry.', '', { duration: 3000 })
    });
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleString();
  }

  bpCategory(systolic: number, diastolic: number): string {
    if (systolic < 120 && diastolic < 80) return 'Normal';
    if (systolic < 130 && diastolic < 80) return 'Elevated';
    if (systolic < 140 || diastolic < 90) return 'High Stage 1';
    return 'High Stage 2';
  }

  bpCategoryClass(systolic: number, diastolic: number): string {
    const cat = this.bpCategory(systolic, diastolic);
    if (cat === 'Normal') return 'cat-normal';
    if (cat === 'Elevated') return 'cat-elevated';
    return 'cat-high';
  }

  heartRateCategory(bpm: number): string {
    if (bpm < 60) return 'Low';
    if (bpm <= 100) return 'Normal';
    return 'High';
  }

  heartRateCategoryClass(bpm: number): string {
    const cat = this.heartRateCategory(bpm);
    if (cat === 'Normal') return 'cat-normal';
    if (cat === 'Low') return 'cat-elevated';
    return 'cat-high';
  }

  getHeartRateMessage(): string {
    if (!this.summary?.median_heart_rate || this.summary.median_heart_rate === 0) return '';
    const cat = this.heartRateCategory(this.summary.median_heart_rate);
    if (cat === 'Normal') return '❤️ Your heart rate is in a healthy range. Keep it up!';
    if (cat === 'Low') return '💙 Low resting heart rate — often a sign of great cardiovascular fitness!';
    return '⚠️ Heart rate is elevated. Rest, hydrate, and consider a check-up.';
  }

  getBloodPressureMessage(): string {
    if (!this.summary?.median_systolic || this.summary.median_systolic === 0 ||
        !this.summary?.median_diastolic || this.summary.median_diastolic === 0) return '';
    const cat = this.bpCategory(this.summary.median_systolic, this.summary.median_diastolic);
    if (cat === 'Normal') return '💜 Blood pressure is optimal. Excellent work!';
    if (cat === 'Elevated') return '💛 Blood pressure slightly elevated. Try reducing sodium and managing stress.';
    if (cat === 'High Stage 1') return '🟠 Blood pressure is Stage 1. Consider lifestyle adjustments and monitor regularly.';
    return '🔴 Blood pressure is Stage 2. Please consult a healthcare provider soon.';
  }
}
