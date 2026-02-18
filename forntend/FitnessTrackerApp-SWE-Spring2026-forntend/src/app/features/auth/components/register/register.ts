import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { AuthService } from '../../../../core/services/auth';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    MatOptionModule  
  ],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class RegisterComponent {
  registerForm: FormGroup;
  loading = false;
  errorMessage = '';
  
  // Options for sex dropdown
  sexOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' },
    { value: 'prefer-not-to-say', label: 'Prefer not to say' }
  ];

  // Maximum date (today - can't be born in the future)
  maxDate = new Date();
  
  // Minimum date (reasonable limit - 120 years ago)
  minDate = new Date(new Date().getFullYear() - 120, 0, 1);

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    // Create form with validation rules
    this.registerForm = this.formBuilder.group({
      username: ['', [
        Validators.required,
        Validators.minLength(3)
      ]],
      password: ['', [
        Validators.required,
        Validators.minLength(6)
      ]],
      confirmPassword: ['', Validators.required],
      height: ['', [
        Validators.required,
        Validators.min(50),   // minimum 50 cm
        Validators.max(300)   // maximum 300 cm
      ]],
      weight: ['', [
        Validators.required,
        Validators.min(20),   // minimum 20 kg
        Validators.max(500)   // maximum 500 kg
      ]],
      dateOfBirth: ['', Validators.required],
      sex: ['', Validators.required]
    }, {
      // Custom validator to check if passwords match
      validators: this.passwordMatchValidator
    });
  }

  // Custom validator function
  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    return null;
  }

  // Getter for easy access to form fields in template
  get f() {
    return this.registerForm.controls;
  }

  onSubmit() {
    // Reset error message
    this.errorMessage = '';
    
    // Stop if form is invalid
    if (this.registerForm.invalid) {
      return;
    }

    // Set loading state
    this.loading = true;

    // Prepare data to send
    const formData = {
      username: this.registerForm.value.username,
      password: this.registerForm.value.password,
      height: this.registerForm.value.height,
      weight: this.registerForm.value.weight,
      dateOfBirth: this.registerForm.value.dateOfBirth,
      sex: this.registerForm.value.sex
    };

    // Call auth service to register
    this.authService.register(formData).subscribe({
      next: () => {
        // Success - redirect to home/dashboard
        this.router.navigate(['/']);
      },
      error: (error) => {
        // Error - show message
        this.errorMessage = error.error?.message || 'Registration failed. Please try again.';
        this.loading = false;
      }
    });
  }
}