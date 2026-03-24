import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';

export interface WaterIntake {
  date: string;  // Format: YYYY-MM-DD
  amount: number; // Total ml for the day
  goal: number;   // Daily goal in ml
  entries: WaterEntry[];
}

export interface WaterEntry {
  timestamp: Date;
  amount: number;
}

@Injectable({
  providedIn: 'root'
})
export class WaterService {
  private platformId = inject(PLATFORM_ID);
  private isBrowser: boolean;
  
  // Default daily goal (2000ml = 2 liters)
  private readonly DEFAULT_GOAL = 2000;
  
  // Current day's water intake
  private waterIntakeSubject: BehaviorSubject<WaterIntake>;
  public waterIntake$: Observable<WaterIntake>;

  constructor() {
    this.isBrowser = isPlatformBrowser(this.platformId);
    
    // Load today's data from localStorage
    const todayData = this.getTodayData();
    this.waterIntakeSubject = new BehaviorSubject<WaterIntake>(todayData);
    this.waterIntake$ = this.waterIntakeSubject.asObservable();
  }

  // Get today's date in YYYY-MM-DD format
  private getTodayDate(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  // Get today's water intake data
  private getTodayData(): WaterIntake {
    const today = this.getTodayDate();
    
    if (!this.isBrowser) {
      return {
        date: today,
        amount: 0,
        goal: this.DEFAULT_GOAL,
        entries: []
      };
    }
    
    const storedData = localStorage.getItem(`water-${today}`);
    
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
      amount: 0,
      goal: this.DEFAULT_GOAL,
      entries: []
    };
  }

  // Save data to localStorage
  private saveData(data: WaterIntake): void {
    if (this.isBrowser) {
      localStorage.setItem(`water-${data.date}`, JSON.stringify(data));
    }
  }

  // Add water intake
  addWater(amount: number): void {
    const currentData = this.waterIntakeSubject.value;
    const today = this.getTodayDate();
    
    // If it's a new day, reset the data
    if (currentData.date !== today) {
      const newData: WaterIntake = {
        date: today,
        amount: amount,
        goal: this.DEFAULT_GOAL,
        entries: [{ timestamp: new Date(), amount }]
      };
      this.waterIntakeSubject.next(newData);
      this.saveData(newData);
      return;
    }
    
    // Add to existing day
    const updatedData: WaterIntake = {
      ...currentData,
      amount: currentData.amount + amount,
      entries: [
        ...currentData.entries,
        { timestamp: new Date(), amount }
      ]
    };
    
    this.waterIntakeSubject.next(updatedData);
    this.saveData(updatedData);
  }

  // Remove last entry (undo)
  removeLastEntry(): void {
    const currentData = this.waterIntakeSubject.value;
    
    if (currentData.entries.length === 0) {
      return;
    }
    
    const lastEntry = currentData.entries[currentData.entries.length - 1];
    const updatedData: WaterIntake = {
      ...currentData,
      amount: currentData.amount - lastEntry.amount,
      entries: currentData.entries.slice(0, -1)
    };
    
    this.waterIntakeSubject.next(updatedData);
    this.saveData(updatedData);
  }

  // Update daily goal
  updateGoal(newGoal: number): void {
    const currentData = this.waterIntakeSubject.value;
    const updatedData: WaterIntake = {
      ...currentData,
      goal: newGoal
    };
    
    this.waterIntakeSubject.next(updatedData);
    this.saveData(updatedData);
  }

  // Get current water intake data
  getCurrentIntake(): WaterIntake {
    return this.waterIntakeSubject.value;
  }

  // Calculate percentage of goal achieved
  getPercentage(): number {
    const data = this.waterIntakeSubject.value;
    if (data.goal === 0) return 0;
    return Math.min(100, Math.round((data.amount / data.goal) * 100));
  }

  // Reset daily data (for testing or manual reset)
  resetDay(): void {
    const today = this.getTodayDate();
    const resetData: WaterIntake = {
      date: today,
      amount: 0,
      goal: this.DEFAULT_GOAL,
      entries: []
    };
    
    this.waterIntakeSubject.next(resetData);
    this.saveData(resetData);
  }
}