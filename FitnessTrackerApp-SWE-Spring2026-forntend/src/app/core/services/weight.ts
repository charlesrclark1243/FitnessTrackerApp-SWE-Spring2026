import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth';

export interface WeightLog {
  id: number;
  userId: number;
  weightKG: number;
  loggedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class WeightService {
  private baseUrl = 'http://localhost:3000/api/weight';

  constructor(
    private http: HttpClient,
    private auth: AuthService
  ) {}

  getRecentWeights(days = 30): Observable<WeightLog[]> {
  const user = this.auth.currentUserValue;
  return this.http.get<WeightLog[]>(
    `http://localhost:3000/api/weight?userId=${user?.id}&days=${days}`
  );
}

  logWeight(weightKG: number): Observable<WeightLog> {
    const user = this.auth.currentUserValue;

    return this.http.post<WeightLog>(this.baseUrl, {
      userId: Number(user?.id),
      weightKG
    });
  }
}