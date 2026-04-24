import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';
import { CalorieService } from './calorie';

export interface StepData {
  date: string;  // Format: YYYY-MM-DD
  steps: number; // Total steps for the day
  goal: number;  // Daily step goal
  entries: StepEntry[];
}

export interface StepEntry {
  timestamp: Date;
  amount: number;
  description?: string;
  calories: number; // Calories burned for this entry
}

@Injectable({
  providedIn: 'root'
})
export class StepService {
  private platformId = inject(PLATFORM_ID);
  private calorieService = inject(CalorieService);
  private isBrowser: boolean;
  
  // Default daily goal (10,000 steps)
  private readonly DEFAULT_GOAL = 10000;
  
  // Current day's step data
  private stepDataSubject: BehaviorSubject<StepData>;
  public stepData$: Observable<StepData>;

  constructor() {
    this.isBrowser = isPlatformBrowser(this.platformId);
    
    // Load today's data from localStorage
    const todayData = this.getTodayData();
    this.stepDataSubject = new BehaviorSubject<StepData>(todayData);
    this.stepData$ = this.stepDataSubject.asObservable();
  }

  // Get today's date in YYYY-MM-DD format
  private getTodayDate(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  // Calculate calories from steps (20 steps = 1 calorie)
  private calculateCalories(steps: number): number {
    return Math.round(steps / 20);
  }

  // Get today's step data
  private getTodayData(): StepData {
    const today = this.getTodayDate();
    
    if (!this.isBrowser) {
      return {
        date: today,
        steps: 0,
        goal: this.DEFAULT_GOAL,
        entries: []
      };
    }
    
    const storedData = localStorage.getItem(`steps-${today}`);
    
    if (storedData) {
      const parsed = JSON.parse(storedData);
      // Convert timestamp strings back to Date objects
      parsed.entries = parsed.entries.map((e: any) => ({
        ...e,
        timestamp: new Date(e.timestamp)
      }));
      return parsed;
    }
    
    return {
      date: today,
      steps: 0,
      goal: this.DEFAULT_GOAL,
      entries: []
    };
  }

  // Save data to localStorage
  private saveData(data: StepData): void {
    if (this.isBrowser) {
      localStorage.setItem(`steps-${data.date}`, JSON.stringify(data));
    }
  }

  // Add steps
  addSteps(amount: number, description?: string): void {
    const currentData = this.stepDataSubject.value;
    const today = this.getTodayDate();
    
    // Calculate calories burned from these steps
    const caloriesBurned = this.calculateCalories(amount);
    
    // If it's a new day, reset the data
    if (currentData.date !== today) {
      const newData: StepData = {
        date: today,
        steps: amount,
        goal: this.DEFAULT_GOAL,
        entries: [{ 
          timestamp: new Date(), 
          amount, 
          description,
          calories: caloriesBurned
        }]
      };
      this.stepDataSubject.next(newData);
      this.saveData(newData);
      
      // Add burned calories to calorie tracker
      this.calorieService.addBurned(
        caloriesBurned, 
        `Walking: ${description || 'Steps'}`
      );
      
      return;
    }
    
    // Add to existing day
    const updatedData: StepData = {
      ...currentData,
      steps: currentData.steps + amount,
      entries: [
        ...currentData.entries,
        { 
          timestamp: new Date(), 
          amount, 
          description,
          calories: caloriesBurned
        }
      ]
    };
    
    this.stepDataSubject.next(updatedData);
    this.saveData(updatedData);
    
    // Add burned calories to calorie tracker
    this.calorieService.addBurned(
      caloriesBurned, 
      `Walking: ${description || 'Steps'}`
    );
    
    console.log(`Added ${amount} steps = ${caloriesBurned} calories burned`);
  }

  // Remove last entry (undo)
  removeLastEntry(): void {
    const currentData = this.stepDataSubject.value;
    
    if (currentData.entries.length === 0) {
      return;
    }
    
    const lastEntry = currentData.entries[currentData.entries.length - 1];
    const updatedData: StepData = {
      ...currentData,
      steps: currentData.steps - lastEntry.amount,
      entries: currentData.entries.slice(0, -1)
    };
    
    this.stepDataSubject.next(updatedData);
    this.saveData(updatedData);
    
    // Also remove the calories from calorie tracker
    // We need to remove the last "Walking" entry from calorie service
    this.calorieService.removeLastEntry();
    
    console.log(`Removed ${lastEntry.amount} steps = ${lastEntry.calories} calories`);
  }

  // Update daily goal
  updateGoal(newGoal: number): void {
    const currentData = this.stepDataSubject.value;
    const updatedData: StepData = {
      ...currentData,
      goal: newGoal
    };
    
    this.stepDataSubject.next(updatedData);
    this.saveData(updatedData);
  }

  // Get current step data
  getCurrentData(): StepData {
    return this.stepDataSubject.value;
  }

  // Calculate percentage of goal achieved
  getPercentage(): number {
    const data = this.stepDataSubject.value;
    if (data.goal === 0) return 0;
    return Math.min(100, Math.round((data.steps / data.goal) * 100));
  }

  // Get remaining steps for the day
  getRemainingSteps(): number {
    const data = this.stepDataSubject.value;
    return Math.max(0, data.goal - data.steps);
  }

  // Calculate estimated distance (km) - assuming average stride
  getEstimatedDistance(): number {
    const data = this.stepDataSubject.value;
    // Average: 1,250 steps = 1 km
    return Number((data.steps / 1250).toFixed(2));
  }

  // Calculate estimated calories burned (total for the day)
  getEstimatedCalories(): number {
    const data = this.stepDataSubject.value;
    return this.calculateCalories(data.steps);
  }

  // Reset daily data (for testing or manual reset)
  resetDay(): void {
    const today = this.getTodayDate();
    const resetData: StepData = {
      date: today,
      steps: 0,
      goal: this.DEFAULT_GOAL,
      entries: []
    };
    
    this.stepDataSubject.next(resetData);
    this.saveData(resetData);
  }
}