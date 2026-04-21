import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StepInputComponent } from './step-input';
import { StepService } from '../../../../core/services/step';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';

describe('StepInputComponent', () => {
  let component: StepInputComponent;
  let fixture: ComponentFixture<StepInputComponent>;
  let stepService: StepService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StepInputComponent],
      providers: [
        provideHttpClient(),
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(StepInputComponent);
    component = fixture.componentInstance;
    stepService = TestBed.inject(StepService);
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should have quick step amounts', () => {
    expect(component.quickSteps).toBeTruthy();
    expect(component.quickSteps.length).toBe(3);
  });

  it('should have correct quick step values', () => {
    expect(component.quickSteps[0].value).toBe(500);
    expect(component.quickSteps[1].value).toBe(1000);
    expect(component.quickSteps[2].value).toBe(2500);
  });

  
});