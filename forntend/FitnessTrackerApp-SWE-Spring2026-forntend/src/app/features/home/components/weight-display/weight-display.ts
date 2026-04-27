import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { finalize } from 'rxjs/operators';
import { WeightService, WeightLog } from '../../../../core/services/weight';

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
  selector: 'app-weight-display',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatTabsModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './weight-display.html',
  styleUrl: './weight-display.css'
})
export class WeightDisplayComponent implements OnInit {
  logs: WeightLog[] = [];
  loading = false;
  error = '';
  unit: 'kg' | 'lbs' = 'kg';

  readonly graphWidth = 640;
  readonly graphHeight = 260;
  readonly graphPadding = 28;

  constructor(
    private weightService: WeightService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadLogs();
  }

  loadLogs(): void {
    this.loading = true;
    this.error = '';
    this.weightService.getRecentWeights().pipe(
      finalize(() => { this.loading = false; this.cdr.markForCheck(); })
    ).subscribe({
      next: (logs) => { this.logs = logs; },
      error: () => { this.error = 'Failed to load weight history.'; }
    });
  }

  displayWeight(weightKG: number): string {
    return this.unit === 'kg'
      ? `${weightKG.toFixed(1)} kg`
      : `${(weightKG / 0.45359237).toFixed(1)} lbs`;
  }

  get chartLogs(): WeightLog[] {
    return [...this.logs].sort(
      (a, b) => new Date(a.loggedAt).getTime() - new Date(b.loggedAt).getTime()
    );
  }

  get chartPoints(): string {
    return this.chartPointData.map((p) => `${p.x},${p.y}`).join(' ');
  }

  get chartAreaPoints(): string {
    const points = this.chartPointData;
    if (points.length === 0) return '';
    const first = points[0];
    const last = points[points.length - 1];
    const baseY = this.graphHeight - this.graphPadding;
    return [`${first.x},${baseY}`, ...points.map((p) => `${p.x},${p.y}`), `${last.x},${baseY}`].join(' ');
  }

  get chartPointData(): ChartPoint[] {
    const points = this.chartLogs;
    if (points.length === 0) return [];
    const values = points.map((l) => this.toDisplayUnit(l.weightKG));
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;
    const innerWidth = this.graphWidth - this.graphPadding * 2;
    const innerHeight = this.graphHeight - this.graphPadding * 2;
    return points.map((log, index) => {
      const value = this.toDisplayUnit(log.weightKG);
      const x = points.length === 1
        ? this.graphPadding + innerWidth / 2
        : this.graphPadding + (index / (points.length - 1)) * innerWidth;
      const y = this.graphPadding + ((max - value) / range) * innerHeight;
      return { x, y, weightLabel: `${value.toFixed(1)} ${this.unit}`, dateLabel: new Date(log.loggedAt).toLocaleString() };
    });
  }

  get chartGridLinesY(): number[] {
    const lines = 4;
    const innerHeight = this.graphHeight - this.graphPadding * 2;
    return Array.from({ length: lines + 1 }, (_, i) => this.graphPadding + (i / lines) * innerHeight);
  }

  get chartMinLabel(): string {
    if (this.logs.length === 0) return '';
    return `${Math.min(...this.logs.map((l) => this.toDisplayUnit(l.weightKG))).toFixed(1)} ${this.unit}`;
  }

  get chartMaxLabel(): string {
    if (this.logs.length === 0) return '';
    return `${Math.max(...this.logs.map((l) => this.toDisplayUnit(l.weightKG))).toFixed(1)} ${this.unit}`;
  }

  get chartDateMarkers(): ChartDateMarker[] {
    const points = this.chartLogs;
    if (points.length === 0) return [];
    const seenDays = new Set<string>();
    const total = points.length;
    return points.map((log, index) => {
      const date = new Date(log.loggedAt);
      const dayKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
      if (seenDays.has(dayKey)) return null;
      seenDays.add(dayKey);
      const leftPercent = total === 1 ? 50 : (index / (total - 1)) * 100;
      return { leftPercent, label: date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) };
    }).filter((m): m is ChartDateMarker => m !== null);
  }

  private toDisplayUnit(weightKG: number): number {
    return this.unit === 'kg' ? weightKG : weightKG / 0.45359237;
  }
}
