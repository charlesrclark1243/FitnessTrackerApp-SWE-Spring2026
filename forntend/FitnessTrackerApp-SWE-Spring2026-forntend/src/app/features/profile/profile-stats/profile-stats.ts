import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { combineLatest, map, of } from 'rxjs';
import { AuthService } from '../../../core/services/auth';
import { ProfileService } from '../../../core/services/profile';
import { calcAgeYears, calcBmiKgCm, calcDeurenbergBfp } from '../../../shared/utils/profile-stats';

import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-profile-stats',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  templateUrl: './profile-stats.html',
  styleUrl: './profile-stats.css',
})
export class ProfileStatsComponent implements OnInit {
  vm$ = combineLatest([
    this.profileService.stats$,
    this.auth.currentUser
  ]).pipe(
    map(([backendStats, user]) => {
      // First, try to use backend stats
      if (backendStats && backendStats.age != null) {
        return {
          ready: true as const,
          age: backendStats.age,
          bmi: backendStats.bmi,
          bfp: backendStats.bfp,
          bmr: backendStats.bmr,
          tdee: backendStats.tdee,
          missing: [] as string[],
        };
      }

      // Fallback: Calculate from user registration data
      if (!user) {
        return {
          ready: false as const,
          missing: ['user data']
        };
      }

      const missing: string[] = [];
      if (!user?.dateOfBirth) missing.push('date of birth');
      if (!user?.sex) missing.push('sex');
      if (user?.height == null) missing.push('height');
      if (user?.weight == null) missing.push('weight');

      if (missing.length > 0) {
        return {
          ready: false as const,
          missing
        };
      }

      // Calculate stats locally from user data
      const dobString = typeof user.dateOfBirth === 'string' 
        ? user.dateOfBirth 
        : (user.dateOfBirth as any).toISOString?.() || user.dateOfBirth;
      const age = calcAgeYears(dobString);
      const bmi = calcBmiKgCm(user.weight!, user.height!);
      const bfp = user.sex === 'male' || user.sex === 'female' 
        ? calcDeurenbergBfp(bmi, age, user.sex) 
        : null;

      return {
        ready: true as const,
        age,
        bmi,
        bfp,
        missing: [] as string[],
      };
    })
  );

  constructor(
    private auth: AuthService,
    private profileService: ProfileService
  ) {}

  ngOnInit() {
    // Load stats from backend
    this.profileService.loadStats().subscribe({
      next: (stats) => {
        // Stats will update automatically through vm$ subscription
      },
      error: (error) => {
        console.warn('Failed to load stats from backend, will use registration data', error);
      }
    });
  }
}
