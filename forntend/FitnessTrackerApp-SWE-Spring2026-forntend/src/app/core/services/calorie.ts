import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, tap } from 'rxjs/operators';

export interface CalorieIntake {
  date: string;  // Format: YYYY-MM-DD
  consumed: number; // Total calories consumed
  burned: number;   // Total calories burned
  goal: number;     // Daily calorie goal
  entries: CalorieEntry[];
}

export interface CalorieEntry {
  timestamp: Date;
  amount: number;
  type: 'consumed' | 'burned';
  description?: string;
}

interface CalorieGoalResponse {
  adjusted_calories: number;
}

@Injectable({
  providedIn: 'root'
})
export class CalorieService {
  private platformId = inject(PLATFORM_ID);
  private http = inject(HttpClient, { optional: true });
  private isBrowser: boolean;
  
  // Default daily goal (2000 calories)
  private readonly DEFAULT_GOAL = 2000;
  
  // Current day's calorie data
  private calorieIntakeSubject: BehaviorSubject<CalorieIntake>;
  public calorieIntake$: Observable<CalorieIntake>;

  constructor() {
    this.isBrowser = isPlatformBrowser(this.platformId);
    
    // Load today's data from localStorage
    const todayData = this.getTodayData();
    this.calorieIntakeSubject = new BehaviorSubject<CalorieIntake>(todayData);
    this.calorieIntake$ = this.calorieIntakeSubject.asObservable();
  }

  // Get today's date in YYYY-MM-DD format
  private getTodayDate(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  // Get today's calorie data
  private getTodayData(): CalorieIntake {
    const today = this.getTodayDate();
    
    if (!this.isBrowser) {
      return {
        date: today,
        consumed: 0,
        burned: 0,
        goal: this.DEFAULT_GOAL,
        entries: []
      };
    }
    
    const storedData = localStorage.getItem(`calorie-${today}`);
    
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
      consumed: 0,
      burned: 0,
      goal: this.DEFAULT_GOAL,
      entries: []
    };
  }

  // Save data to localStorage
  private saveData(data: CalorieIntake): void {
    if (this.isBrowser) {
      localStorage.setItem(`calorie-${data.date}`, JSON.stringify(data));
    }
  }

  // Add calories consumed (food intake)
  addConsumed(amount: number, description?: string): void {
    const currentData = this.calorieIntakeSubject.value;
    const today = this.getTodayDate();
    
    // If it's a new day, reset the data
    if (currentData.date !== today) {
      const newData: CalorieIntake = {
        date: today,
        consumed: amount,
        burned: 0,
        goal: this.DEFAULT_GOAL,
        entries: [{ timestamp: new Date(), amount, type: 'consumed', description }]
      };
      this.calorieIntakeSubject.next(newData);
      this.saveData(newData);
      return;
    }
    
    // Add to existing day
    const updatedData: CalorieIntake = {
      ...currentData,
      consumed: currentData.consumed + amount,
      entries: [
        ...currentData.entries,
        { timestamp: new Date(), amount, type: 'consumed', description }
      ]
    };
    
    this.calorieIntakeSubject.next(updatedData);
    this.saveData(updatedData);
  }

  // Add calories burned (exercise)
  addBurned(amount: number, description?: string): void {
    const currentData = this.calorieIntakeSubject.value;
    const today = this.getTodayDate();
    
    // If it's a new day, reset the data
    if (currentData.date !== today) {
      const newData: CalorieIntake = {
        date: today,
        consumed: 0,
        burned: amount,
        goal: this.DEFAULT_GOAL,
        entries: [{ timestamp: new Date(), amount, type: 'burned', description }]
      };
      this.calorieIntakeSubject.next(newData);
      this.saveData(newData);
      return;
    }
    
    // Add to existing day
    const updatedData: CalorieIntake = {
      ...currentData,
      burned: currentData.burned + amount,
      entries: [
        ...currentData.entries,
        { timestamp: new Date(), amount, type: 'burned', description }
      ]
    };
    
    this.calorieIntakeSubject.next(updatedData);
    this.saveData(updatedData);
  }

  // Remove last entry (undo)
  removeLastEntry(): void {
    const currentData = this.calorieIntakeSubject.value;
    
    if (currentData.entries.length === 0) {
      return;
    }
    
    const lastEntry = currentData.entries[currentData.entries.length - 1];
    
    const updatedData: CalorieIntake = {
      ...currentData,
      consumed: lastEntry.type === 'consumed' 
        ? currentData.consumed - lastEntry.amount 
        : currentData.consumed,
      burned: lastEntry.type === 'burned' 
        ? currentData.burned - lastEntry.amount 
        : currentData.burned,
      entries: currentData.entries.slice(0, -1)
    };
    
    this.calorieIntakeSubject.next(updatedData);
    this.saveData(updatedData);
  }

  // Update daily goal
  updateGoal(newGoal: number): void {
    const currentData = this.calorieIntakeSubject.value;
    const updatedData: CalorieIntake = {
      ...currentData,
      goal: newGoal
    };
    
    this.calorieIntakeSubject.next(updatedData);
    this.saveData(updatedData);
  }

  // Set daily goal using backend calorie goal API.
  setDailyGoal(targetDirection: 'lose' | 'hold' | 'gain'): Observable<number> {
    if (!this.http) {
      return throwError(() => new Error('HttpClient is not available'));
    }

    return this.http
      .post<CalorieGoalResponse>('http://localhost:8080/api/caloriegoal', {
        target_direction: targetDirection
      })
      .pipe(
        map((res) => Math.round(res.adjusted_calories)),
        tap((goal) => this.updateGoal(goal))
      );
  }

  // Get current calorie data
  getCurrentIntake(): CalorieIntake {
    return this.calorieIntakeSubject.value;
  }

  // Calculate net calories (consumed - burned)
  getNetCalories(): number {
    const data = this.calorieIntakeSubject.value;
    return data.consumed - data.burned;
  }

  // Calculate percentage of goal achieved
  getPercentage(): number {
    const data = this.calorieIntakeSubject.value;
    if (data.goal === 0) return 0;
    const netCalories = this.getNetCalories();
    return Math.min(100, Math.round((netCalories / data.goal) * 100));
  }

  // Get remaining calories for the day
  getRemainingCalories(): number {
    const data = this.calorieIntakeSubject.value;
    return data.goal - this.getNetCalories();
  }

  // Reset daily data (for testing or manual reset)
  resetDay(): void {
    const today = this.getTodayDate();
    const resetData: CalorieIntake = {
      date: today,
      consumed: 0,
      burned: 0,
      goal: this.DEFAULT_GOAL,
      entries: []
    };
    
    this.calorieIntakeSubject.next(resetData);
    this.saveData(resetData);
  }
}