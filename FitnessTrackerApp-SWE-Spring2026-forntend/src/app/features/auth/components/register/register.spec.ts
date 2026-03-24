import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegisterComponent } from './register';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterComponent],
      providers: [
        provideHttpClient(),
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the register component', () => {
    expect(component).toBeTruthy();
  });

  it('should have a registration form', () => {
    expect(component.registerForm).toBeTruthy();
  });

  it('should have username field', () => {
    expect(component.registerForm.get('username')).toBeTruthy();
  });

  it('should have password field', () => {
    expect(component.registerForm.get('password')).toBeTruthy();
  });

  it('should have confirmPassword field', () => {
    expect(component.registerForm.get('confirmPassword')).toBeTruthy();
  });

  it('should have height field', () => {
    expect(component.registerForm.get('height')).toBeTruthy();
  });

  it('should have weight field', () => {
    expect(component.registerForm.get('weight')).toBeTruthy();
  });

  it('should have dateOfBirth field', () => {
    expect(component.registerForm.get('dateOfBirth')).toBeTruthy();
  });

  it('should have sex field', () => {
    expect(component.registerForm.get('sex')).toBeTruthy();
  });

  it('should mark empty form as invalid', () => {
    expect(component.registerForm.valid).toBeFalsy();
  });

  it('should validate password mismatch', () => {
    component.registerForm.controls['password'].setValue('password123');
    component.registerForm.controls['confirmPassword'].setValue('different');
    
    expect(component.registerForm.controls['confirmPassword'].errors?.['passwordMismatch']).toBeTruthy();
  });
});
