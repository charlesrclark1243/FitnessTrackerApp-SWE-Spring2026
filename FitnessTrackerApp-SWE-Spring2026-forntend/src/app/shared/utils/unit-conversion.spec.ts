import { lbsToKg, kgToLbs, ftInToCm, cmToFtIn, cmToIn, inToCm } from './unit-conversion';

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

  it('cm -> inches basic values', () => {
    expect(cmToIn(0)).toBeCloseTo(0, 12);
    expect(cmToIn(2.54)).toBeCloseTo(1, 12);
    expect(cmToIn(30.48)).toBeCloseTo(12, 12); // 1 ft
  });

  it('inches -> cm basic values', () => {
    expect(inToCm(0)).toBeCloseTo(0, 12);
    expect(inToCm(1)).toBeCloseTo(2.54, 12);
    expect(inToCm(12)).toBeCloseTo(30.48, 12);
  });

  it('cm <-> inches round trip', () => {
    const cm = 180;
    const inches = cmToIn(cm);
    const cm2 = inToCm(inches);
    expect(cm2).toBeCloseTo(cm, 10);
  });

  it('large value precision', () => {
    const cm = 250;
    const inches = cmToIn(cm);
    expect(inches).toBeCloseTo(98.4252, 4);
  });

});

