import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { map } from 'rxjs';
import { AuthService } from '../../../core/services/auth';
import { calcAgeYears, calcBmiKgCm, calcDeurenbergBfp } from '../../../shared/utils/profile-stats';

import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-profile-stats',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  templateUrl: './profile-stats.html',
  styleUrl: './profile-stats.css',
})
export class ProfileStatsComponent {
  vm$ = this.auth.currentUser.pipe(
    map(u => {
      const missing: string[] = [];

      if (!u?.dateOfBirth) missing.push('date of birth');
      if (!u?.sex) missing.push('sex');
      if (u?.height == null) missing.push('height');
      if (u?.weight == null) missing.push('weight');

      if (!u || missing.length) {
        return { ready: false as const, missing };
      }

      const age = calcAgeYears(u.dateOfBirth!);
      const bmi = calcBmiKgCm(u.weight!, u.height!);
      const bfp = u.sex === 'male' || u.sex === 'female' ? calcDeurenbergBfp(bmi, age, u.sex): null;


      return {
        ready: true as const,
        age,
        bmi,
        bfp,
        missing: [] as string[],
      };
    })
  );

  constructor(private auth: AuthService) {}
}
