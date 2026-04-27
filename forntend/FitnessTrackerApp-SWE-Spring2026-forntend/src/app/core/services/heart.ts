import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface HeartRateEntry {
  id: number;
  user_id: number;
  rate: number;
  logged_at: string;
}

export interface BloodPressureEntry {
  id: number;
  user_id: number;
  systolic: number;
  diastolic: number;
  logged_at: string;
}

export interface HeartSummary {
  median_heart_rate?: number;
  median_systolic?: number;
  median_diastolic?: number;
  heart_rate_entries?: HeartRateEntry[];
  blood_pressure_entries?: BloodPressureEntry[];
}

@Injectable({ providedIn: 'root' })
export class HeartService {
  private base = 'http://localhost:8080/api/heart';

  constructor(private http: HttpClient) {}

  logHeartRate(rate: number, logged_at?: string): Observable<HeartRateEntry> {
    const body: any = { rate };
    if (logged_at) body['logged_at'] = logged_at;
    return this.http.post<HeartRateEntry>(`${this.base}/rate`, body);
  }

  logBloodPressure(systolic: number, diastolic: number, logged_at?: string): Observable<BloodPressureEntry> {
    const body: any = { systolic, diastolic };
    if (logged_at) body['logged_at'] = logged_at;
    return this.http.post<BloodPressureEntry>(`${this.base}/blood-pressure`, body);
  }

  getSummary(): Observable<HeartSummary> {
    return this.http.get<HeartSummary>(`${this.base}/summary`);
  }

  deleteEntry(type: 'heart_rate' | 'blood_pressure', id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${type}/${id}`);
  }
}
