import { TestBed } from '@angular/core/testing';
import { CalorieService, CalorieIntake } from './calorie';

describe('CalorieService', () => {
  let service: CalorieService;

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    
    // Create a fresh service instance
    TestBed.configureTestingModule({});
    service = TestBed.inject(CalorieService);
  });

  // Test 1: Service Creation
  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // Test 2: Initial State
  it('should start with 0 consumed and 0 burned calories', () => {
    const intake = service.getCurrentIntake();
    expect(intake.consumed).toBe(0);
    expect(intake.burned).toBe(0);
    expect(intake.entries.length).toBe(0);
  });

  // Test 3: Default Goal
  it('should have default goal of 2000 calories', () => {
    const intake = service.getCurrentIntake();
    expect(intake.goal).toBe(2000);
  });

  // Test 4: Add Consumed Calories
  it('should add consumed calories correctly', () => {
    service.addConsumed(400, 'Lunch');
    const intake = service.getCurrentIntake();
    
    expect(intake.consumed).toBe(400);
    expect(intake.entries.length).toBe(1);
    expect(intake.entries[0].amount).toBe(400);
    expect(intake.entries[0].type).toBe('consumed');
    expect(intake.entries[0].description).toBe('Lunch');
  });

  // Test 5: Add Burned Calories
  it('should add burned calories correctly', () => {
    service.addBurned(300, 'Running');
    const intake = service.getCurrentIntake();
    
    expect(intake.burned).toBe(300);
    expect(intake.entries.length).toBe(1);
    expect(intake.entries[0].amount).toBe(300);
    expect(intake.entries[0].type).toBe('burned');
    expect(intake.entries[0].description).toBe('Running');
  });

  // Test 6: Multiple Additions
  it('should accumulate multiple calorie entries', () => {
    service.addConsumed(400, 'Breakfast');
    service.addConsumed(600, 'Lunch');
    service.addBurned(200, 'Walking');
    
    const intake = service.getCurrentIntake();
    expect(intake.consumed).toBe(1000);
    expect(intake.burned).toBe(200);
    expect(intake.entries.length).toBe(3);
  });

  // Test 7: Calculate Net Calories
  it('should calculate net calories correctly', () => {
    service.addConsumed(800);
    service.addBurned(300);
    
    const netCalories = service.getNetCalories();
    expect(netCalories).toBe(500); // 800 - 300
  });

  // Test 8: Remove Last Entry
  it('should remove last entry when undo is called', () => {
    service.addConsumed(400, 'Food1');
    service.addBurned(200, 'Exercise1');
    service.addConsumed(300, 'Food2');
    
    service.removeLastEntry();
    
    const intake = service.getCurrentIntake();
    expect(intake.consumed).toBe(400);
    expect(intake.burned).toBe(200);
    expect(intake.entries.length).toBe(2);
  });

  // Test 9: Remove From Empty
  it('should handle undo when no entries exist', () => {
    service.removeLastEntry();
    
    const intake = service.getCurrentIntake();
    expect(intake.consumed).toBe(0);
    expect(intake.burned).toBe(0);
    expect(intake.entries.length).toBe(0);
  });

  // Test 10: Update Goal
  it('should update daily goal', () => {
    service.updateGoal(2500);
    
    const intake = service.getCurrentIntake();
    expect(intake.goal).toBe(2500);
  });

  // Test 11: Calculate Percentage
  it('should calculate percentage correctly', () => {
    service.addConsumed(1000);
    
    const percentage = service.getPercentage();
    expect(percentage).toBe(50); // 1000/2000 = 50%
  });

  // Test 12: Percentage with Burned Calories
  it('should calculate percentage based on net calories', () => {
    service.addConsumed(1500);
    service.addBurned(500);
    
    const percentage = service.getPercentage();
    expect(percentage).toBe(50); // (1500-500)/2000 = 50%
  });

  // Test 13: Percentage at 100%
  it('should cap percentage at 100%', () => {
    service.addConsumed(2500);
    
    const percentage = service.getPercentage();
    expect(percentage).toBe(100); // Max is 100%, not 125%
  });

  // Test 14: Get Remaining Calories
  it('should calculate remaining calories', () => {
    service.addConsumed(1200);
    
    const remaining = service.getRemainingCalories();
    expect(remaining).toBe(800); // 2000 - 1200
  });

  // Test 15: Remaining with Burned Calories
  it('should calculate remaining considering burned calories', () => {
    service.addConsumed(1500);
    service.addBurned(300);
    
    const remaining = service.getRemainingCalories();
    expect(remaining).toBe(800); // 2000 - (1500 - 300)
  });

  // Test 16: Reset Day
  it('should reset daily data', () => {
    service.addConsumed(500);
    service.addBurned(200);
    
    service.resetDay();
    
    const intake = service.getCurrentIntake();
    expect(intake.consumed).toBe(0);
    expect(intake.burned).toBe(0);
    expect(intake.entries.length).toBe(0);
    expect(intake.goal).toBe(2000); // Default goal restored
  });

  // Test 17: Observable Emission
  it('should emit new values when calories are added', (done) => {
    let emissionCount = 0;
    
    service.calorieIntake$.subscribe((intake) => {
      emissionCount++;
      
      if (emissionCount === 2) {
        // Second emission (after addConsumed)
        expect(intake.consumed).toBe(400);
        done();
      }
    });
    
    service.addConsumed(400);
  });

  // Test 18: localStorage Persistence
  it('should save data to localStorage', () => {
    service.addConsumed(750, 'Dinner');
    
    const today = new Date().toISOString().split('T')[0];
    const storedData = localStorage.getItem(`calorie-${today}`);
    
    expect(storedData).toBeTruthy();
    
    const parsed = JSON.parse(storedData!);
    expect(parsed.consumed).toBe(750);
  });

  // Test 19: Entry Timestamps
  it('should add timestamp to each entry', () => {
    const beforeTime = new Date();
    service.addConsumed(300);
    const afterTime = new Date();
    
    const intake = service.getCurrentIntake();
    const entryTime = intake.entries[0].timestamp;
    
    expect(entryTime.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime());
    expect(entryTime.getTime()).toBeLessThanOrEqual(afterTime.getTime());
  });

  // Test 20: Mixed Entry Types
  it('should handle mixed consumed and burned entries', () => {
    service.addConsumed(500, 'Breakfast');
    service.addBurned(150, 'Walking');
    service.addConsumed(700, 'Lunch');
    service.addBurned(250, 'Gym');
    
    const intake = service.getCurrentIntake();
    expect(intake.consumed).toBe(1200);
    expect(intake.burned).toBe(400);
    expect(service.getNetCalories()).toBe(800);
  });
});