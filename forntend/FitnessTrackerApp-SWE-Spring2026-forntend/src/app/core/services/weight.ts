import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, of } from 'rxjs';
import { AuthService } from './auth';

export interface WeightLog {
  id: number;
  userId: number;
  weightKG: number;
  loggedAt: string;
}

interface BackendWeightLog {
  id: number;
  user_id: number;
  weight: number;
  unit: string;
  logged_at: string;
}

interface GetWeightLogsResponse {
  entries: BackendWeightLog[];
}

interface AddWeightLogResponse {
  message: string;
  log: {
    id: number;
    user_id: number;
    weight_kg: number;
    logged_at: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class WeightService {
  private baseUrl = 'http://localhost:8080/api/weight';

  constructor(
    private http: HttpClient,
    private auth: AuthService
  ) {}

  getRecentWeights(): Observable<WeightLog[]> {
    return this.http.get<GetWeightLogsResponse>(`${this.baseUrl}/logs`).pipe(
      map((response) =>
        (response.entries || []).map((entry) => ({
          id: entry.id,
          userId: entry.user_id,
          weightKG: entry.unit === 'lbs' ? entry.weight * 0.45359237 : entry.weight,
          loggedAt: entry.logged_at,
        }))
          .sort((a, b) => new Date(b.loggedAt).getTime() - new Date(a.loggedAt).getTime())
      )
    );
  }

  logWeight(weightKG: number): Observable<WeightLog> {
    return this.http.put<AddWeightLogResponse>(`${this.baseUrl}/add`, {
      weight: weightKG,
      unit: 'metric',
    }).pipe(
      map((response) => ({
        id: response.log.id,
        userId: response.log.user_id,
        weightKG: response.log.weight_kg,
        loggedAt: response.log.logged_at,
      }))
    );
  }

  // Modify the most recent weight entry
  modifyWeight(weightKG: number): Observable<WeightLog> {
    return this.http.post<AddWeightLogResponse>(`${this.baseUrl}/modify`, {
      weight: weightKG,
      unit: 'metric'
    }).pipe(
      map((response) => ({
        id: response.log.id,
        userId: response.log.user_id,
        weightKG: response.log.weight_kg,
        loggedAt: response.log.logged_at,
      })),
      // Keep UI logic deterministic: emit an invalid sentinel on failure.
      catchError(() => of({
        id: 0,
        userId: 0,
        weightKG: Number.NaN,
        loggedAt: ''
      }))
    );
  }
}