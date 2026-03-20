describe('Water Intake Tracker', () => {
  
  beforeEach(() => {
    // Register and login before each test
    cy.visit('/register');
    
    const username = 'wateruser' + Date.now(); // Unique username each time
    
    cy.get('input[formControlName="username"]').type('testuser');
    cy.get('input[formControlName="password"]').type('Test123456');
    cy.get('input[formControlName="confirmPassword"]').type('Test123456');
    cy.get('input[formControlName="height"]').type('175');
    cy.get('input[formControlName="weight"]').type('70');
    cy.get('input[formControlName="dateOfBirth"]').type('1990-01-01');
    cy.get('mat-select[formControlName="sex"]').click();
    cy.get('mat-option').contains('Male').click();
    cy.get('button[type="submit"]').click();
    
    // Login
    cy.get('input[formControlName="username"]').type('testuser');
    cy.get('input[formControlName="password"]').type('Test123456');
    cy.get('button[type="submit"]').click();
  });

  it('should display water intake components', () => {
    // Check that water components are visible
    cy.contains('Today\'s Water Intake').should('be.visible');
    cy.contains('Quick Add Water').should('be.visible');
  });

  it('should start with 0ml and show 0%', () => {
    // Check initial state
    cy.contains('0ml').should('be.visible');
    cy.contains('0%').should('be.visible');
  });

  it('should add 250ml when clicking 250ml button', () => {
    // Click 250ml button
    cy.contains('button', '250ml').click();
    
    // Wait a moment for UI to update
    cy.wait(500);
    
    // Should now show 250ml
    cy.contains('250ml').should('be.visible');
    
    // Progress should be greater than 0%
    cy.get('mat-progress-bar').should('exist');
  });

  it('should add multiple water entries', () => {
    // Add 250ml
    cy.contains('button', '250ml').click();
    cy.wait(300);
    
    // Add 500ml
    cy.contains('button', '500ml').click();
    cy.wait(300);
    
    // Total should be 750ml
    cy.contains('750ml').should('be.visible');
    
    // Should show entries list
    cy.contains('Today\'s Entries').should('be.visible');
  });

  it('should add custom amount', () => {
    // Click custom amount button
    cy.contains('Custom Amount').click();
    
    // Type custom amount
    cy.get('input[type="number"]').type('300');
    
    // Click add button
    cy.contains('button', 'Add').click();
    
    cy.wait(500);
    
    // Should show 300ml
    cy.contains('300ml').should('be.visible');
  });

  it('should undo last entry', () => {
    // Add water
    cy.contains('button', '250ml').click();
    cy.wait(300);
    cy.contains('button', '500ml').click();
    cy.wait(300);
    
    // Should show 750ml
    cy.contains('750ml').should('be.visible');
    
    // Click undo
    cy.contains('Undo Last').click();
    cy.wait(300);
    
    // Should now show 250ml (500ml removed)
    cy.contains('250ml').should('be.visible');
  });

  it('should update progress bar as water is added', () => {
    // Add 1L (should be 50% of 2L goal)
    cy.contains('button', '1L').click();
    cy.wait(500);
    
    // Progress bar should show approximately 50%
    cy.contains('50%').should('be.visible');
  });

  it('should show success message when goal is reached', () => {
    // Add enough water to reach goal (2000ml)
    cy.contains('button', '1L').click();
    cy.wait(300);
    cy.contains('button', '1L').click();
    cy.wait(500);
    
    // Should show success message
    cy.contains('Great job').should('be.visible');
  });

  it('should persist data after page refresh', () => {
    // Add water
    cy.contains('button', '500ml').click();
    cy.wait(500);
    
    // Refresh page
    cy.reload();
    
    // Data should still be there
    cy.contains('500ml').should('be.visible');
  });
});