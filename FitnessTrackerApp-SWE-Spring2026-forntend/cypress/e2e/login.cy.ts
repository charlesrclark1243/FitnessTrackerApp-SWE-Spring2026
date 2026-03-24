
describe('Login Flow', () => {
  
  beforeEach(() => {
    // Visit the app before each test
    cy.visit('/');
  });

  it('should display login link when not authenticated', () => {
    // Check that "Login" link exists
    cy.contains('Login').should('be.visible');
  });

  it('should navigate to login page when clicking login link', () => {
    // Click the login link
    cy.contains('Login').click();
    
    // Check URL changed to /login
    cy.url().should('include', '/login');
    
    // Check login page elements are visible
    cy.contains('Login').should('be.visible');
    cy.get('input[formControlName="username"]').should('be.visible');
    cy.get('input[formControlName="password"]').should('be.visible');
  });

  it('should show error with invalid credentials', () => {
    // Go to login page
    cy.visit('/login');
    
    // Fill in wrong credentials
    cy.get('input[formControlName="username"]').type('wronguser');
    cy.get('input[formControlName="password"]').type('wrongpass');
    
    // Click submit
    cy.get('button[type="submit"]').click();
    
    // Check for error message
    cy.contains('Invalid username or password').should('be.visible');
  });

  it('should successfully login with valid credentials and logout successfully', () => {
    // First, register a user
    cy.visit('/register');
    
    cy.get('input[formControlName="username"]').type('testuser');
    cy.get('input[formControlName="password"]').type('Test123456');
    cy.get('input[formControlName="confirmPassword"]').type('Test123456');
    cy.get('input[formControlName="height"]').type('175');
    cy.get('input[formControlName="weight"]').type('70');
    cy.get('input[formControlName="dateOfBirth"]').type('1990-01-01');
    cy.get('mat-select[formControlName="sex"]').click();
    cy.get('mat-option').contains('Male').click();
    
    cy.get('button[type="submit"]').click();
    
    // Should redirect to login
    cy.url().should('include', '/login');
    
    // Now login with those credentials
    cy.get('input[formControlName="username"]').type('testuser');
    cy.get('input[formControlName="password"]').type('Test123456');
    cy.get('button[type="submit"]').click();
    
    // Should redirect to home page
    cy.url().should('eq', 'http://localhost:4200/');
    
    // Should see welcome message
    cy.contains('Welcome, testuser!').should('be.visible');
    
    // Should see logout button
    cy.contains('Logout').should('be.visible');

    cy.contains('Logout').click();
    
    // Should redirect to login
    cy.url().should('include', '/login');
    
    // Should see login link again
    cy.contains('Login').should('be.visible');


  });

  
});