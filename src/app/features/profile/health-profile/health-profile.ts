import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatSelectModule } from '@angular/material/select';
import { ProfileStatsComponent } from '../profile-stats/profile-stats';
import { LengthUnit, cmToIn, inToCm, ftInToCm, lbsToKg  } from '../../../shared/utils/unit-conversion';


type HeightUnit = 'cm' | 'ftin';
type WeightUnit = 'kg' | 'lbs';
type CircUnit = 'cm' | 'ftin';

@Component({
  selector: 'app-health-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonToggleModule,
    ProfileStatsComponent
  ],
  templateUrl: './health-profile.html',
  styleUrl: './health-profile.css',
})
export class HealthProfileComponent {
  heightUnit: HeightUnit = 'cm';
  weightUnit: WeightUnit = 'kg';
  circUnit: LengthUnit = 'cm';

  // store ft/in separately when using ftin
  form = this.fb.group({
    dateOfBirth: [null as Date | null, Validators.required],
    sex: ['' as 'male' | 'female' | 'other' | 'na' | '', Validators.required],


    heightCm: [null as number | null],
    heightFt: [null as number | null],
    heightIn: [null as number | null],

    weightKg: [null as number | null],
    weightLbs: [null as number | null],

    neckCm: [null as number | null],
    waistCm: [null as number | null],
    hipsCm: [null as number | null],
  });

  savedMsg = '';

  constructor(private fb: FormBuilder, private auth: AuthService) {
    const u = this.auth.currentUserValue;

    if (u?.dateOfBirth) this.form.patchValue({ dateOfBirth: new Date(u.dateOfBirth) });
    if (u?.sex) this.form.patchValue({ sex: u.sex as any });

    if (u?.height != null) this.form.patchValue({ heightCm: u.height });
    if (u?.weight != null) this.form.patchValue({ weightKg: u.weight });

    if (u?.neck != null) this.form.patchValue({ neckCm: u.neck });
    if (u?.waist != null) this.form.patchValue({ waistCm: u.waist });
    if (u?.hips != null) this.form.patchValue({ hipsCm: u.hips });
  }

  setHeightUnit(unit: HeightUnit) {
    this.heightUnit = unit;
    this.savedMsg = '';
  }

  setWeightUnit(unit: WeightUnit) {
    this.weightUnit = unit;
    this.savedMsg = '';
  }

  setCircUnit(unit: LengthUnit) {
    this.circUnit = unit;
    this.savedMsg = '';
  }

  displayLength(cmVal: number | null | undefined): string {
    if (cmVal == null || cmVal === undefined || Number.isNaN(cmVal)) return '';
    const v = this.circUnit === 'cm' ? cmVal : cmToIn(cmVal);
    return String(Math.round(v * 10) / 10); // 1 decimal
  }

  onLengthInput(controlName: 'neckCm' | 'waistCm' | 'hipsCm', raw: string) {
    const n = raw === '' ? null : Number(raw);
    if (n === null || Number.isNaN(n)) {
        this.form.get(controlName)?.setValue(null);
        return;
    }

    const cm = this.circUnit === 'cm' ? n : inToCm(n);
    this.form.get(controlName)?.setValue(cm as any);
}


  save() {
    this.savedMsg = '';

    const dob = this.form.value.dateOfBirth;
    const sex = this.form.value.sex;

    if (!dob || !sex) {
      this.form.markAllAsTouched();
      return;
    }

    const heightCm =
      this.heightUnit === 'cm'
        ? this.num(this.form.value.heightCm)
        : ftInToCm(this.num(this.form.value.heightFt), this.num(this.form.value.heightIn));

    const weightKg =
      this.weightUnit === 'kg'
        ? this.num(this.form.value.weightKg)
        : lbsToKg(this.num(this.form.value.weightLbs));

    this.auth.updateProfile({
        dateOfBirth: dob.toISOString(),
        sex,
        height: heightCm ?? undefined,
        weight: weightKg ?? undefined, 
        neck: this.form.value.neckCm ?? undefined,
        waist: this.form.value.waistCm ?? undefined,
        hips: this.form.get('sex')?.value === 'female'
        ? (this.form.value.hipsCm ?? undefined)
        : undefined,
        }).subscribe({
        next: () => (this.savedMsg = 'Saved!'),
        error: () => (this.savedMsg = 'Save failed'),
        });
    }

  private num(v: any): number | null {
    if (v === null || v === undefined || v === '') return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }
}
