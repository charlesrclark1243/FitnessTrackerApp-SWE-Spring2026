import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StepDisplayComponent } from './step-display';
import { StepService } from '../../../../core/services/step';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';

describe('StepDisplayComponent', () => {
  let component: StepDisplayComponent;
  let fixture: ComponentFixture<StepDisplayComponent>;
  let stepService: StepService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StepDisplayComponent],
      providers: [
        provideHttpClient(),
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(StepDisplayComponent);
    component = fixture.componentInstance;
    stepService = TestBed.inject(StepService);
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should subscribe to step data updates', () => {
    expect(component.stepData).toBeTruthy();
  });

  it('should start with 0 steps', () => {
    expect(component.stepData?.steps).toBe(0);
  });

  it('should format numbers with commas', () => {
    const formatted = component.formatNumber(12345);
    expect(formatted).toBe('12,345');
  });

  

  it('should get correct progress color for low percentage', () => {
    component.percentage = 30;
    
    const color = component.getProgressColor();
    expect(color).toBe('warn');
  });

  it('should get correct progress color for medium percentage', () => {
    component.percentage = 60;
    
    const color = component.getProgressColor();
    expect(color).toBe('primary');
  });

  it('should get correct progress color for 100%', () => {
    component.percentage = 100;
    
    const color = component.getProgressColor();
    expect(color).toBe('accent');
  });

  it('should display motivational message for 0%', () => {
    component.percentage = 0;
    
    const message = component.getMotivationalMessage();
    expect(message).toContain('start walking');
  });

  it('should display motivational message for 50%', () => {
    component.percentage = 50;
    
    const message = component.getMotivationalMessage();
    expect(message).toContain('Halfway');
  });

  it('should display motivational message for 100%', () => {
    component.percentage = 100;
    
    const message = component.getMotivationalMessage();
    expect(message).toContain('reached');
  });

  it('should update when steps are added', () => {
    stepService.addSteps(5000);
    
    expect(component.stepData?.steps).toBe(5000);
  });

  
});