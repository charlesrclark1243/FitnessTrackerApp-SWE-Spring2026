import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login';
import { AuthService } from '../../../../core/services/auth';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        provideHttpClient(),
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the login component', () => {
    expect(component).toBeTruthy();
  });

  it('should have a login form', () => {
    expect(component.loginForm).toBeTruthy();
  });

  it('should have username field in form', () => {
    const usernameControl = component.loginForm.get('username');
    expect(usernameControl).toBeTruthy();
  });

  it('should have password field in form', () => {
    const passwordControl = component.loginForm.get('password');
    expect(passwordControl).toBeTruthy();
  });

  it('should mark empty form as invalid', () => {
    expect(component.loginForm.valid).toBeFalsy();
  });

  it('should mark filled form as valid', () => {
    component.loginForm.controls['username'].setValue('testuser');
    component.loginForm.controls['password'].setValue('password123');
    
    expect(component.loginForm.valid).toBeTruthy();
  });
});
