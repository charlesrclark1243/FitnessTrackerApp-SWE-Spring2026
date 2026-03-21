import { TestBed } from '@angular/core/testing';
import { WaterService, WaterIntake } from './water';

describe('WaterService', () => {
  let service: WaterService;

  beforeEach(() => {
    localStorage.clear();
    
    TestBed.configureTestingModule({});
    service = TestBed.inject(WaterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start with 0ml water intake', () => {
    const intake = service.getCurrentIntake();
    expect(intake.amount).toBe(0);
    expect(intake.entries.length).toBe(0);
  });

  it('should have default goal of 2000ml', () => {
    const intake = service.getCurrentIntake();
    expect(intake.goal).toBe(2000);
  });

  it('should add water intake correctly', () => {
    service.addWater(250);
    const intake = service.getCurrentIntake();
    
    expect(intake.amount).toBe(250);
    expect(intake.entries.length).toBe(1);
    expect(intake.entries[0].amount).toBe(250);
  });

  it('should accumulate multiple water additions', () => {
    service.addWater(250);
    service.addWater(500);
    service.addWater(250);
    
    const intake = service.getCurrentIntake();
    expect(intake.amount).toBe(1000);
    expect(intake.entries.length).toBe(3);
  });

  it('should remove last entry when undo is called', () => {
    service.addWater(250);
    service.addWater(500);
    
    service.removeLastEntry();
    
    const intake = service.getCurrentIntake();
    expect(intake.amount).toBe(250);
    expect(intake.entries.length).toBe(1);
  });

  it('should handle undo when no entries exist', () => {
    service.removeLastEntry();
    
    const intake = service.getCurrentIntake();
    expect(intake.amount).toBe(0);
    expect(intake.entries.length).toBe(0);
  });

  it('should update daily goal', () => {
    service.updateGoal(3000);
    
    const intake = service.getCurrentIntake();
    expect(intake.goal).toBe(3000);
  });

  it('should calculate percentage correctly', () => {
    service.addWater(1000);
    
    const percentage = service.getPercentage();
    expect(percentage).toBe(50); // 1000/2000 = 50%
  });

  it('should cap percentage at 100%', () => {
    service.addWater(2500);
    
    const percentage = service.getPercentage();
    expect(percentage).toBe(100); // Max is 100%, not 125%
  });

  it('should calculate percentage based on current goal', () => {
    service.updateGoal(1000);
    service.addWater(500);
    
    const percentage = service.getPercentage();
    expect(percentage).toBe(50);
  });

  it('should reset daily data', () => {
    service.addWater(500);
    service.addWater(250);
    
    service.resetDay();
    
    const intake = service.getCurrentIntake();
    expect(intake.amount).toBe(0);
    expect(intake.entries.length).toBe(0);
    expect(intake.goal).toBe(2000); // Default goal restored
  });

  

  it('should save data to localStorage', () => {
    service.addWater(750);
    
    const today = new Date().toISOString().split('T')[0];
    const storedData = localStorage.getItem(`water-${today}`);
    
    expect(storedData).toBeTruthy();
    
    const parsed = JSON.parse(storedData!);
    expect(parsed.amount).toBe(750);
  });

  it('should add timestamp to each entry', () => {
    const beforeTime = new Date();
    service.addWater(250);
    const afterTime = new Date();
    
    const intake = service.getCurrentIntake();
    const entryTime = intake.entries[0].timestamp;
    
    expect(entryTime.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime());
    expect(entryTime.getTime()).toBeLessThanOrEqual(afterTime.getTime());
  });
});
