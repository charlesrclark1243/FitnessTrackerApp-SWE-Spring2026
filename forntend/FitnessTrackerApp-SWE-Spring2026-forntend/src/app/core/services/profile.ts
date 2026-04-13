import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface HealthProfile {
  id?: number;
  user_id?: number;
  date_of_birth?: string | Date;
  sex?: 'male' | 'female' | 'other' | 'na';
  height_cm?: number;
  weight_kg?: number;
  neck_cm?: number;
  waist_cm?: number;
  hips_cm?: number;
  activity_level?: string;
  preferred_units?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ProfileStats {
  age?: number;
  bmi?: number;
  bfp?: number;
  bmr?: number;
  tdee?: number;
  calorieGoal?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private baseUrl = 'http://localhost:8080/api/profile';
  
  private profileSubject = new BehaviorSubject<HealthProfile | null>(null);
  public profile$ = this.profileSubject.asObservable();
  
  private statsSubject = new BehaviorSubject<ProfileStats | null>(null);
  public stats$ = this.statsSubject.asObservable();

  constructor(private http: HttpClient) {}

  // Load profile from backend
  loadProfile(): Observable<HealthProfile> {
    return this.http.get<HealthProfile>(this.baseUrl).pipe(
      tap(profile => this.profileSubject.next(profile))
    );
  }

  // Load stats from backend
  loadStats(): Observable<ProfileStats> {
    return this.http.get<ProfileStats>(`${this.baseUrl}/stats`).pipe(
      tap(stats => this.statsSubject.next(stats))
    );
  }

  // Get current profile value
  getCurrentProfile(): HealthProfile | null {
    return this.profileSubject.value;
  }

  // Get current stats value
  getCurrentStats(): ProfileStats | null {
    return this.statsSubject.value;
  }

  // Update profile on backend
  updateProfile(profile: HealthProfile): Observable<HealthProfile> {
    return this.http.put<HealthProfile>(this.baseUrl, profile).pipe(
      tap(updated => this.profileSubject.next(updated))
    );
  }
}
