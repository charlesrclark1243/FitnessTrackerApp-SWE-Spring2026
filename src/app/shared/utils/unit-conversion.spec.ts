import { lbsToKg, kgToLbs, ftInToCm, cmToFtIn } from './unit-conversion';

describe('unit-conversion utils', () => {
  it('kg <-> lbs round trip', () => {
    const kg = 70;
    const lbs = kgToLbs(kg);
    const kg2 = lbsToKg(lbs);
    expect(kg2).toBeCloseTo(kg, 8);
  });

  it('ft/in -> cm', () => {
    // 5 ft 10 in = 177.8 cm
    expect(ftInToCm(5, 10)).toBeCloseTo(177.8, 6);
  });

  it('cm -> ft/in', () => {
    const v = cmToFtIn(177.8);
    expect(v.ft).toBe(5);
    expect(v.inch).toBeCloseTo(10, 1);
  });
});
