import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { HeartService } from '../../../../core/services/heart';

@Component({
  selector: 'app-heart-log',
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
    MatSnackBarModule
  ],
  templateUrl: './heart-log.html',
  styleUrl: './heart-log.css'
})
export class HeartLogComponent {
  @Output() logged = new EventEmitter<void>();

  heartRate: number | null = null;
  systolic: number | null = null;
  diastolic: number | null = null;
  saving = false;

  lastHeartRateId: number | null = null;
  lastBPId: number | null = null;

  constructor(private heartService: HeartService, private snackBar: MatSnackBar) {}

  logHeartRate() {
    if (!this.heartRate || this.heartRate <= 0) return;
    this.saving = true;
    this.heartService.logHeartRate(this.heartRate).subscribe({
      next: (entry) => {
        this.snackBar.open('Heart rate logged!', '', { duration: 2000 });
        this.lastHeartRateId = entry.id;
        this.heartRate = null;
        this.saving = false;
        this.logged.emit();
      },
      error: () => {
        this.snackBar.open('Failed to log heart rate.', '', { duration: 3000 });
        this.saving = false;
      }
    });
  }

  logBloodPressure() {
    if (!this.systolic || this.systolic <= 0 || !this.diastolic || this.diastolic <= 0) return;
    this.saving = true;
    this.heartService.logBloodPressure(this.systolic, this.diastolic).subscribe({
      next: (entry) => {
        this.snackBar.open('Blood pressure logged!', '', { duration: 2000 });
        this.lastBPId = entry.id;
        this.systolic = null;
        this.diastolic = null;
        this.saving = false;
        this.logged.emit();
      },
      error: () => {
        this.snackBar.open('Failed to log blood pressure.', '', { duration: 3000 });
        this.saving = false;
      }
    });
  }

  undoLastHeartRate() {
    if (!this.lastHeartRateId) return;
    this.heartService.deleteEntry('heart_rate', this.lastHeartRateId).subscribe({
      next: () => {
        this.snackBar.open('Heart rate entry removed.', '', { duration: 2000 });
        this.lastHeartRateId = null;
        this.logged.emit();
      },
      error: () => this.snackBar.open('Failed to undo.', '', { duration: 3000 })
    });
  }

  undoLastBP() {
    if (!this.lastBPId) return;
    this.heartService.deleteEntry('blood_pressure', this.lastBPId).subscribe({
      next: () => {
        this.snackBar.open('Blood pressure entry removed.', '', { duration: 2000 });
        this.lastBPId = null;
        this.logged.emit();
      },
      error: () => this.snackBar.open('Failed to undo.', '', { duration: 3000 })
    });
  }
}
