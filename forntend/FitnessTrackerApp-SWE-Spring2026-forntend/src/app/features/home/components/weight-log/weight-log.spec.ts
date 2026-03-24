import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { WeightLogComponent } from './weight-log';
import { WeightService } from '../../../../core/services/weight';
import { AuthService } from '../../../../core/services/auth';

describe('WeightLogComponent', () => {
  let component: WeightLogComponent;
  let fixture: ComponentFixture<WeightLogComponent>;

  let weightServiceSpy: jasmine.SpyObj<WeightService>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    weightServiceSpy = jasmine.createSpyObj('WeightService', [
      'getRecentWeights',
      'logWeight'
    ]);

    authServiceSpy = jasmine.createSpyObj(
      'AuthService',
      ['updateProfile'],
      {
        currentUserValue: { id: '1', username: 'demo', token: 'demo-token' }
      }
    );

    weightServiceSpy.getRecentWeights.and.returnValue(of([]));
    weightServiceSpy.logWeight.and.returnValue(of({
      id: 1,
      userId: 1,
      weightKG: 56,
      loggedAt: '2026-03-21T10:00:00.000Z'
    }));

    authServiceSpy.updateProfile.and.returnValue(of({
      id: '1',
      username: 'demo',
      token: 'demo-token',
      weight: 56
    }));

    await TestBed.configureTestingModule({
      imports: [WeightLogComponent],
      providers: [
        { provide: WeightService, useValue: weightServiceSpy },
        { provide: AuthService, useValue: authServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(WeightLogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load recent weights on init', () => {
    expect(weightServiceSpy.getRecentWeights).toHaveBeenCalledWith(30);
    expect(component.logs).toEqual([]);
  });

  it('should populate logs when loadRecentWeights succeeds', () => {
    const mockLogs = [
      { id: 1, userId: 1, weightKG: 56, loggedAt: '2026-03-20T10:00:00.000Z' },
      { id: 2, userId: 1, weightKG: 56.4, loggedAt: '2026-03-18T10:00:00.000Z' }
    ];

    weightServiceSpy.getRecentWeights.and.returnValue(of(mockLogs));

    component.loadRecentWeights();

    expect(component.logs).toEqual(mockLogs);
    expect(component.errorMessage).toBe('');
  });

  it('should show error when loadRecentWeights fails', () => {
    weightServiceSpy.getRecentWeights.and.returnValue(
      throwError(() => new Error('load failed'))
    );

    component.loadRecentWeights();

    expect(component.errorMessage).toBe('Failed to load recent weights.');
  });

  it('should not submit if form is invalid', () => {
    component.form.patchValue({ weight: null });

    component.onSubmit();

    expect(weightServiceSpy.logWeight).not.toHaveBeenCalled();
  });

  it('should submit kg weight directly', () => {
    component.unit = 'kg';
    component.form.patchValue({ weight: 56 });

    component.onSubmit();

    expect(weightServiceSpy.logWeight).toHaveBeenCalledWith(56);
    expect(authServiceSpy.updateProfile).toHaveBeenCalledWith({ weight: 56 });
    expect(component.successMessage).toBe('Weight logged successfully.');
  });

  it('should convert lbs to kg before submit', () => {
    component.unit = 'lbs';
    component.form.patchValue({ weight: 154 });

    component.onSubmit();

    const expectedKg = 154 * 0.45359237;
    const callArg = weightServiceSpy.logWeight.calls.mostRecent().args[0];
    expect(callArg).toBeCloseTo(expectedKg, 3);
  });

  it('should refresh logs after successful submit when logs are visible', () => {
    const loadSpy = spyOn(component, 'loadRecentWeights');

    component.showLogs = true;
    component.unit = 'kg';
    component.form.patchValue({ weight: 56 });

    component.onSubmit();

    expect(loadSpy).toHaveBeenCalled();
  });

  it('should not refresh logs after successful submit when logs are hidden', () => {
    const loadSpy = spyOn(component, 'loadRecentWeights');

    component.showLogs = false;
    component.unit = 'kg';
    component.form.patchValue({ weight: 56 });

    component.onSubmit();

    expect(loadSpy).not.toHaveBeenCalled();
  });

  it('should show error message when submit fails', () => {
    weightServiceSpy.logWeight.and.returnValue(
      throwError(() => new Error('submit failed'))
    );

    component.unit = 'kg';
    component.form.patchValue({ weight: 56 });

    component.onSubmit();

    expect(component.errorMessage).toBe('Failed to log weight.');
    expect(component.loading).toBeFalse();
  });

  it('should toggle logs and load them first time only', () => {
    const loadSpy = spyOn(component, 'loadRecentWeights');

    component.showLogs = false;
    component.logsLoaded = false;

    component.toggleLogs();

    expect(component.showLogs).toBeTrue();
    expect(component.logsLoaded).toBeTrue();
    expect(loadSpy).toHaveBeenCalled();

    loadSpy.calls.reset();

    component.toggleLogs(); // hide
    component.toggleLogs(); // show again

    expect(loadSpy).not.toHaveBeenCalled();
  });

  it('should display weight in kg when unit is kg', () => {
    component.unit = 'kg';
    expect(component.displayWeight(56)).toBe('56.0 kg');
  });

  it('should display weight in lbs when unit is lbs', () => {
    component.unit = 'lbs';
    const result = component.displayWeight(56);
    expect(result).toContain('lbs');
  });
});