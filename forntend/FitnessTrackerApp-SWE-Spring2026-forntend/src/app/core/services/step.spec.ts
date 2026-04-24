import { TestBed } from '@angular/core/testing';
import { StepService, StepData } from './step';
import { CalorieService } from './calorie';

describe('StepService', () => {
  let service: StepService;
  let calorieService: CalorieService;

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    
    // Create a fresh service instance
    TestBed.configureTestingModule({});
    service = TestBed.inject(StepService);
    calorieService = TestBed.inject(CalorieService);
  });

  // Test 1: Service Creation
  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // Test 2: Initial State
  it('should start with 0 steps', () => {
    const data = service.getCurrentData();
    expect(data.steps).toBe(0);
    expect(data.entries.length).toBe(0);
  });

  // Test 3: Default Goal
  it('should have default goal of 10000 steps', () => {
    const data = service.getCurrentData();
    expect(data.goal).toBe(10000);
  });

  // Test 4: Add Steps and Sync Calories
  it('should add steps and sync calories to calorie service', () => {
    service.addSteps(1000, 'Morning walk');
    const data = service.getCurrentData();
    
    expect(data.steps).toBe(1000);
    expect(data.entries.length).toBe(1);
    expect(data.entries[0].amount).toBe(1000);
    expect(data.entries[0].calories).toBe(50); // 1000/20 = 50
    
    // Check that calories were added to calorie service
    const calorieData = calorieService.getCurrentIntake();
    expect(calorieData.burned).toBe(50);
  });

  // Test 5: Multiple Additions
  it('should accumulate multiple step entries and sync all calories', () => {
    service.addSteps(500, 'Morning walk');   // 25 cal
    service.addSteps(1000, 'Lunch walk');    // 50 cal
    service.addSteps(500, 'Evening walk');   // 25 cal
    
    const data = service.getCurrentData();
    expect(data.steps).toBe(2000);
    expect(data.entries.length).toBe(3);
    
    // Total calories burned should be 100
    const calorieData = calorieService.getCurrentIntake();
    expect(calorieData.burned).toBe(100);
  });

  // Test 6: Remove Last Entry and Sync
  it('should remove last entry and sync calorie removal', () => {
    service.addSteps(500);
    service.addSteps(1000);
    
    service.removeLastEntry();
    
    const data = service.getCurrentData();
    expect(data.steps).toBe(500);
    expect(data.entries.length).toBe(1);
    
    // Calories should also be reduced
    const calorieData = calorieService.getCurrentIntake();
    expect(calorieData.burned).toBe(25); // Only 500 steps = 25 cal remaining
  });

  // Test 7: Remove From Empty
  it('should handle undo when no entries exist', () => {
    service.removeLastEntry();
    
    const data = service.getCurrentData();
    expect(data.steps).toBe(0);
    expect(data.entries.length).toBe(0);
  });

  // Test 8: Update Goal
  it('should update daily goal', () => {
    service.updateGoal(15000);
    
    const data = service.getCurrentData();
    expect(data.goal).toBe(15000);
  });

  // Test 9: Calculate Percentage
  it('should calculate percentage correctly', () => {
    service.addSteps(5000);
    
    const percentage = service.getPercentage();
    expect(percentage).toBe(50); // 5000/10000 = 50%
  });

  // Test 10: Percentage at 100%
  it('should cap percentage at 100%', () => {
    service.addSteps(12000);
    
    const percentage = service.getPercentage();
    expect(percentage).toBe(100); // Max is 100%, not 120%
  });

  // Test 11: Percentage with Different Goal
  it('should calculate percentage based on current goal', () => {
    service.updateGoal(5000);
    service.addSteps(2500);
    
    const percentage = service.getPercentage();
    expect(percentage).toBe(50);
  });

  // Test 12: Get Remaining Steps
  it('should calculate remaining steps correctly', () => {
    service.addSteps(7000);
    
    const remaining = service.getRemainingSteps();
    expect(remaining).toBe(3000); // 10000 - 7000
  });

  // Test 13: Remaining Steps at Goal
  it('should return 0 remaining when goal is reached', () => {
    service.addSteps(10000);
    
    const remaining = service.getRemainingSteps();
    expect(remaining).toBe(0);
  });

  // Test 14: Remaining Steps Over Goal
  it('should return 0 remaining when over goal', () => {
    service.addSteps(12000);
    
    const remaining = service.getRemainingSteps();
    expect(remaining).toBe(0);
  });

  // Test 15: Estimate Distance
  it('should calculate estimated distance correctly', () => {
    service.addSteps(2500);
    
    const distance = service.getEstimatedDistance();
    expect(distance).toBe(2); // 2500 / 1250 = 2 km
  });

  // Test 16: Estimate Distance (Decimal)
  it('should calculate distance with decimals', () => {
    service.addSteps(3000);
    
    const distance = service.getEstimatedDistance();
    expect(distance).toBe(2.4); // 3000 / 1250 = 2.4 km
  });

  // Test 17: Estimate Calories
  it('should calculate estimated calories correctly', () => {
    service.addSteps(1000);
    
    const calories = service.getEstimatedCalories();
    expect(calories).toBe(50); // 1000 / 20 = 50 calories
  });

  // Test 18: Estimate Calories (Large Amount)
  it('should calculate calories for large step count', () => {
    service.addSteps(10000);
    
    const calories = service.getEstimatedCalories();
    expect(calories).toBe(500); // 10000 / 20 = 500 calories
  });

  // Test 19: Reset Day
  it('should reset daily data', () => {
    service.addSteps(5000);
    service.addSteps(2500);
    
    service.resetDay();
    
    const data = service.getCurrentData();
    expect(data.steps).toBe(0);
    expect(data.entries.length).toBe(0);
    expect(data.goal).toBe(10000); // Default goal restored
  });

  // Test 20: Observable Emission
  it('should emit new values when steps are added', (done) => {
    let emissionCount = 0;
    
    service.stepData$.subscribe((data) => {
      emissionCount++;
      
      if (emissionCount === 2) {
        // Second emission (after addSteps)
        expect(data.steps).toBe(750);
        done();
      }
    });
    
    service.addSteps(750);
  });

  // Test 21: localStorage Persistence
  it('should save data to localStorage', () => {
    service.addSteps(1500, 'Afternoon walk');
    
    const today = new Date().toISOString().split('T')[0];
    const storedData = localStorage.getItem(`steps-${today}`);
    
    expect(storedData).toBeTruthy();
    
    const parsed = JSON.parse(storedData!);
    expect(parsed.steps).toBe(1500);
  });

  // Test 22: Entry Timestamps
  it('should add timestamp to each entry', () => {
    const beforeTime = new Date();
    service.addSteps(500);
    const afterTime = new Date();
    
    const data = service.getCurrentData();
    const entryTime = data.entries[0].timestamp;
    
    expect(entryTime.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime());
    expect(entryTime.getTime()).toBeLessThanOrEqual(afterTime.getTime());
  });

  // Test 23: Add Steps Without Description
  it('should handle adding steps without description', () => {
    service.addSteps(600);
    
    const data = service.getCurrentData();
    expect(data.steps).toBe(600);
    expect(data.entries[0].description).toBeUndefined();
  });

  // Test 24: Calorie Calculation per Entry
  it('should store calories for each entry', () => {
    service.addSteps(500, 'Walk 1');  // 25 cal
    service.addSteps(1000, 'Walk 2'); // 50 cal
    service.addSteps(600, 'Walk 3');  // 30 cal
    
    const data = service.getCurrentData();
    expect(data.entries[0].calories).toBe(25);
    expect(data.entries[1].calories).toBe(50);
    expect(data.entries[2].calories).toBe(30);
  });

  // Test 25: Large Step Count
  it('should handle large step counts', () => {
    service.addSteps(25000);
    
    const data = service.getCurrentData();
    expect(data.steps).toBe(25000);
    
    const percentage = service.getPercentage();
    expect(percentage).toBe(100); // Capped at 100%
    
    const distance = service.getEstimatedDistance();
    expect(distance).toBe(20); // 25000 / 1250 = 20 km
    
    const calories = service.getEstimatedCalories();
    expect(calories).toBe(1250); // 25000 / 20 = 1250 cal
    
    // Check calorie sync
    const calorieData = calorieService.getCurrentIntake();
    expect(calorieData.burned).toBe(1250);
  });
});