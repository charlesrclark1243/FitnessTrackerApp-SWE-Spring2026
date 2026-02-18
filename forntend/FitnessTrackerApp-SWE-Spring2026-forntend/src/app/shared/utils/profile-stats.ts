// src/app/shared/utils/profile-stats.ts

export function calcAgeYears(dateOfBirthIso: string, now = new Date()): number {
  const dob = new Date(dateOfBirthIso);
  let age = now.getFullYear() - dob.getFullYear();

  const m = now.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) {
    age--;
  }
  return age;
}

export function calcBmiKgCm(weightKg: number, heightCm: number): number {
  const hM = heightCm / 100;
  return weightKg / (hM * hM);
}

// Deurenberg body fat percentage (adult approximation)
export function calcDeurenbergBfp(
  bmi: number,
  ageYears: number,
  sex: 'male' | 'female' | 'other' | 'na'
): number | null {
  // Formula not valid for minors
  if (ageYears < 18) return null;

  // Formula requires biological sex
  if (sex !== 'male' && sex !== 'female') return null;

  const sexVal = sex === 'male' ? 1 : 0;
  return 1.2 * bmi + 0.23 * ageYears - 10.8 * sexVal - 5.4;
}

