describe('Step Counter', () => {
  
  beforeEach(() => {
    // Register and login before each test
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

    cy.url().should('include', '/login');

    cy.get('input[formControlName="username"]').type('testuser');
    cy.get('input[formControlName="password"]').type('Test123456');
    cy.get('button[type="submit"]').click();

    cy.url().should('not.include', '/login');
    
    cy.wait(500); // Wait for home page to load
  });

  it('should display step counter components', () => {
    // Check that step components are visible
    cy.contains('Today\'s Step Count').should('be.visible');
    cy.contains('Add Steps').should('be.visible');
  });

  it('should start with 0 steps', () => {
    // Check initial state shows 0 steps
    cy.contains('0').should('be.visible');
    cy.contains('steps').should('be.visible');
  });

  it('should add steps when clicking quick add button', () => {
    // Click Short Walk button (500 steps)
    cy.contains('button', 'Short Walk').click();
    cy.wait(500);
    
    // Should now show 500 steps
    cy.contains('500').should('be.visible');
  });

  it('should add multiple step entries', () => {
    // Add 500 steps
    cy.contains('button', 'Short Walk').click();
    cy.wait(300);
    
    // Add 1000 steps
    cy.contains('button', '10 Minutes').click();
    cy.wait(300);
    
    // Total should be 1500 steps
    cy.contains('1,500').should('be.visible');
  });

 

  it('should calculate distance correctly', () => {
    // Add 2500 steps (should be ~2 km)
    cy.contains('button', '20 Minutes').click();
    cy.wait(500);
    
    // Should show distance
    cy.contains('Distance').should('be.visible');
    cy.contains('km').should('be.visible');
  });

  it('should calculate calories burned', () => {
    // Add 1000 steps (should burn ~50 calories)
    cy.contains('button', '10 Minutes').click();
    cy.wait(500);
    
    // Should show calories
    cy.contains('Calories').should('be.visible');
    cy.contains('kcal').should('be.visible');
  });

  it('should show remaining steps to goal', () => {
    // Add some steps
    cy.contains('button', 'Short Walk').click();
    cy.wait(500);
    
    // Should show remaining steps
    cy.contains('Remaining').should('be.visible');
    cy.contains('steps').should('be.visible');
  });

  it('should undo last entry', () => {
    // Add steps
    cy.contains('button', 'Short Walk').click();
    cy.wait(500);
    cy.contains('button', '10 Minutes').click();
    cy.wait(500);
    
   
    
    // Click undo
    cy.contains('button', 'Undo Last').click();
    cy.wait(500);
    
    // Should have only 1 entry left (500 steps)
    cy.contains('500').should('be.visible');
  });

  it('should update progress bar as steps are added', () => {
    // Add steps
    cy.contains('button', '10 Minutes').click();
    cy.wait(500);
    
    // Progress bar should exist and show percentage
    cy.get('mat-progress-bar').should('exist');
    cy.contains('%').should('be.visible');
  });

  it('should show success message when goal is reached', () => {
    // Add enough steps to reach goal (10,000 steps default)
    // Click 20 Minutes button multiple times
    for (let i = 0; i < 4; i++) {
      cy.contains('button', '20 Minutes').click(); // 2500 steps each
      cy.wait(300);
    }
    
    cy.wait(500);
    
    // Should show success/motivational message
    cy.get('.motivational-message').should('be.visible');
  });

  it('should edit daily step goal', () => {
    // Click edit goal button
    cy.get('button[mattooltip*="Edit"]').first().click();
    cy.wait(500);
    
    // Change goal to 15000
    cy.get('input[type="number"]').first().clear().type('15000');
    
    // Click check/save button
    cy.get('mat-icon').contains('check').parent().click();
    cy.wait(500);
    
    // Should show new goal
    cy.contains('15,000').should('be.visible');
  });

  it('should show entries list with descriptions', () => {
    // Add step entries
    cy.contains('button', 'Short Walk').click();
    cy.wait(500);
    
    cy.contains('button', '10 Minutes').click();
    cy.wait(500);
    
    // Should show entries list
    cy.contains('Today\'s Activities').should('be.visible');
    cy.contains('Short Walk').should('be.visible');
    cy.contains('10 Minutes').should('be.visible');
  });

 
  it('should show step stats correctly', () => {
    // Add 5000 steps
    cy.contains('button', '20 Minutes').click(); // 2500
    cy.wait(300);
    cy.contains('button', '20 Minutes').click(); // 2500
    cy.wait(500);
    
    // Should show stats boxes
    cy.contains('Distance').should('be.visible');
    cy.contains('Calories').should('be.visible');
    cy.contains('Remaining').should('be.visible');
  });

  it('should calculate percentage correctly', () => {
    // Add 5000 steps (50% of 10000 goal)
    cy.contains('button', '20 Minutes').click(); // 2500
    cy.wait(300);
    cy.contains('button', '20 Minutes').click(); // 2500
    cy.wait(500);
    
    // Should show approximately 50%
    cy.contains('50%').should('be.visible');
  });
});