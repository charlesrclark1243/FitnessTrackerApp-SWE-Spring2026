import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth';
import { ProfileService } from '../../../core/services/profile';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ProfileStatsComponent } from '../profile-stats/profile-stats';
import { LengthUnit, cmToIn, inToCm, ftInToCm, cmToFtIn, kgToLbs, lbsToKg  } from '../../../shared/utils/unit-conversion';


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
    MatIconModule,
    MatProgressSpinnerModule,
    ProfileStatsComponent
  ],
  templateUrl: './health-profile.html',
  styleUrl: './health-profile.css',
})
export class HealthProfileComponent implements OnInit {
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
  loading = true;
  errorMsg = '';
  noProfileData = false;

  constructor(
    private fb: FormBuilder, 
    private auth: AuthService,
    private profileService: ProfileService
  ) {}

  ngOnInit() {
    // Load profile from backend
    this.loading = true;
    this.errorMsg = '';
    this.noProfileData = false;
    this.profileService.loadProfile().subscribe({
      next: (profile) => {
        const hasData = profile && (profile.height_cm || profile.weight_kg || profile.sex || profile.date_of_birth);
        if (hasData) {
          this.populateForm(profile);
          this.noProfileData = false;
        } else {
          this.noProfileData = true;
        }
        this.loading = false;
      },
      error: () => {
        this.noProfileData = false;
        this.loading = false;
      }
    });
  }

  private populateFromUser() {
    const u = this.auth.currentUserValue;
    if (u) {
      this.populateForm({
        date_of_birth: u.dateOfBirth,
        sex: u.sex,
        height_cm: u.height,
        weight_kg: u.weight,
        neck_cm: u.neck,
        waist_cm: u.waist,
        hips_cm: u.hips,
      });
    }
  }

  private populateForm(profile: any) {
    if (profile?.date_of_birth) {
      const dob = typeof profile.date_of_birth === 'string' 
        ? new Date(profile.date_of_birth) 
        : profile.date_of_birth;
      this.form.patchValue({ dateOfBirth: dob });
    }
    if (profile?.sex) this.form.patchValue({ sex: profile.sex as any });

    const heightCm = profile?.height_cm || profile?.heightCM;
    if (heightCm != null) this.form.patchValue({ heightCm });

    const weightKg = profile?.weight_kg || profile?.weightKG;
    if (weightKg != null) this.form.patchValue({ weightKg });

    const neckCm = profile?.neck_cm || profile?.neckCM;
    if (neckCm != null) this.form.patchValue({ neckCm });

    const waistCm = profile?.waist_cm || profile?.waistCM;
    if (waistCm != null) this.form.patchValue({ waistCm });

    const hipsCm = profile?.hips_cm || profile?.hipsCM;
    if (hipsCm != null) this.form.patchValue({ hipsCm });

    const h = this.form.value.heightCm;
    if (h != null) {
      const { ft, inch } = cmToFtIn(h);
      this.form.patchValue({ heightFt: ft, heightIn: inch }, { emitEvent: false });
    }

    const w = this.form.value.weightKg;
    if (w != null) {
      this.form.patchValue({ weightLbs: this.round1(kgToLbs(w)!) }, { emitEvent: false });
    }
  }

  setHeightUnit(unit: HeightUnit) {
    if (this.heightUnit === unit) return;

    if (unit === 'ftin') {
        // cm -> ft/in
        const cm = this.num(this.form.value.heightCm);
        if (cm != null) {
        const { ft, inch } = cmToFtIn(cm);
        this.form.patchValue({ heightFt: ft, heightIn: inch }, { emitEvent: false });
        } else {
        this.form.patchValue({ heightFt: null, heightIn: null }, { emitEvent: false });
        }
    } else {
        // ft/in -> cm
        const cm = ftInToCm(this.num(this.form.value.heightFt), this.num(this.form.value.heightIn));
        this.form.patchValue({ heightCm: cm != null ? this.round1(cm) : null }, { emitEvent: false });
    }

    this.heightUnit = unit;
    this.savedMsg = '';
    }


  setWeightUnit(unit: WeightUnit) {
    if (this.weightUnit === unit) return;

    if (unit === 'lbs') {
        // kg -> lbs
        const kg = this.num(this.form.value.weightKg);
        this.form.patchValue(
        { weightLbs: kg != null ? this.round1(kgToLbs(kg)!) : null },
        { emitEvent: false }
        );
    } else {
        // lbs -> kg
        const kg = lbsToKg(this.num(this.form.value.weightLbs));
        this.form.patchValue(
        { weightKg: kg != null ? this.round1(kg) : null },
        { emitEvent: false }
        );
    }

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

  private round1(n: number): number {
        return Math.round(n * 10) / 10;
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

    // Send data in snake_case format to match backend
    this.profileService.updateProfile({
        date_of_birth: dob.toISOString(),
        sex,
        height_cm: heightCm ?? undefined,
        weight_kg: weightKg ?? undefined, 
        neck_cm: this.form.value.neckCm ?? undefined,
        waist_cm: this.form.value.waistCm ?? undefined,
        hips_cm: this.form.get('sex')?.value === 'female'
        ? (this.form.value.hipsCm ?? undefined)
        : undefined,
        }).subscribe({
        next: () => {
          this.savedMsg = 'Saved!';
          this.noProfileData = false;
          // Also update auth service so other components see the change
          if (this.auth.currentUserValue) {
            this.auth.currentUserValue.dateOfBirth = dob.toISOString();
            this.auth.currentUserValue.sex = sex;
            this.auth.currentUserValue.height = heightCm ?? undefined;
            this.auth.currentUserValue.weight = weightKg ?? undefined;
          }

          // Refresh stats so the profile stats card reflects the saved profile.
          this.profileService.loadStats().subscribe({
            error: () => {}
          });
        },
        error: () => (this.savedMsg = 'Save failed'),
        });
    }

  private num(v: any): number | null {
    if (v === null || v === undefined || v === '') return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }
}
