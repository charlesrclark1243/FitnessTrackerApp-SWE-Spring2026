// src/app/shared/utils/unit-conversion.ts

export const LB_PER_KG = 0.45359237;
export const CM_PER_IN = 2.54;
export const IN_PER_FT = 12;
export type LengthUnit = 'cm' | 'in';
export type WeightUnit = 'kg' | 'lbs';

export function lbsToKg(lbs: number | null): number | null {
  if (lbs === null) return null;
  return lbs / LB_PER_KG;
}

export function kgToLbs(kg: number): number {
  return kg * LB_PER_KG;
}

export function ftInToCm(ft: number | null, inch: number | null): number | null {
  if (ft === null && inch === null) return null;
  const totalIn = (ft ?? 0) * IN_PER_FT + (inch ?? 0);
  return totalIn * CM_PER_IN;
}

export function cmToFtIn(cm: number): { ft: number; inch: number } {
  const totalIn = cm / CM_PER_IN;
  const ft = Math.floor(totalIn / IN_PER_FT);
  const inch = +(totalIn - ft * IN_PER_FT).toFixed(1); // 1 decimal
  return { ft, inch };
}

export function cmToIn(cm: number): number {
  return cm / CM_PER_IN;
}

export function inToCm(inches: number): number {
  return inches * CM_PER_IN;
}
