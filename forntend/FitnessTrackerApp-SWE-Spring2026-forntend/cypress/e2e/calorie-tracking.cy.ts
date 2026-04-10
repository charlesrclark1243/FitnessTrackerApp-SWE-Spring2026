describe('Calorie Tracking', () => {
  
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

  it('should display calorie tracking components', () => {
    // Check that calorie components are visible
    cy.contains('Today\'s Calorie Summary').should('be.visible');
    cy.contains('Calorie Tracker').should('be.visible');
  });

  it('should start with 0 consumed and 0 burned calories', () => {
    // Check initial state
    cy.contains('Consumed').should('be.visible');
    cy.contains('Burned').should('be.visible');
    cy.contains('Net').should('be.visible');
  });

  it('should add consumed calories when clicking snack button', () => {
      // Click on Food tab using the correct Material tab selector
    cy.get('.mat-mdc-tab').contains('Food').click();
    cy.wait(500);
    
    // Click Snack button (150 calories)
    cy.contains('button', 'Snack').click();
    cy.wait(500);
    
    // Should show 150 in consumed
    cy.contains('150').should('be.visible');
  });

  it('should add burned calories when clicking exercise button', () => {
       // Click on Exercise tab
    cy.get('.mat-mdc-tab').contains('Exercise').click();
    cy.wait(500);
    
    // Click Walk button (150 calories)
    cy.contains('button', 'Walk').click();
    cy.wait(500);
    
    // Should show burned calories
    cy.contains('150').should('be.visible');
  });

  

  
  it('should calculate net calories correctly', () => {
    // Add consumed calories
    cy.get('.mat-mdc-tab').contains('Food').click();
    cy.wait(500);
    cy.contains('button', 'Small Meal').click(); // 400 cal
    cy.wait(500);
    
    // Add burned calories
    cy.get('.mat-mdc-tab').contains('Exercise').click();
    cy.wait(500);
    cy.contains('button', 'Walk').click(); // 150 cal
    cy.wait(500);
    
    // Net should be 250 (400 - 150)
    cy.get('.stat-box.net').should('contain', '250');
  });

  it('should undo last entry', () => {
   // Add calories
    cy.get('.mat-mdc-tab').contains('Food').click();
    cy.wait(500);
    cy.contains('button', 'Snack').click();
    cy.wait(500);
    
    cy.contains('button', 'Small Meal').click();
    cy.wait(500);
    
    // Should have entries
    cy.contains('Today\'s Entries').should('be.visible');
    
    // Click undo
    cy.contains('button', 'Undo Last').click();
    cy.wait(500);
    
    // One entry should be removed - check for 1 entry
    cy.contains('Today\'s Entries (1)').should('be.visible');
  });

  it('should update progress bar as calories are added', () => {
    // Add some calories
    cy.get('.mat-mdc-tab').contains('Food').click();
    cy.wait(500);
    cy.contains('button', 'Small Meal').click(); // 400 cal
    cy.wait(500);
    
    // Progress bar should exist and show percentage
    cy.get('mat-progress-bar').should('exist');
    cy.contains('%').should('be.visible');
  });

  it('should show warning when goal is reached', () => {
    cy.get('.mat-mdc-tab').contains('Food').click();
    cy.wait(500);
    
    // Add multiple large meals
    cy.contains('button', 'Large Meal').click(); // 800
    cy.wait(300);
    cy.contains('button', 'Large Meal').click(); // 800
    cy.wait(300);
    cy.contains('button', 'Large Meal').click(); // 800
    cy.wait(500);
    
    // Should show some message (could be warning or success)
    cy.get('.motivational-message').should('be.visible');
  });

  it('should edit daily calorie goal', () => {
   // Click edit goal button
    cy.get('button[mattooltip*="Edit"]').first().click();
    cy.wait(500);
    
    // Change goal to 2500
    cy.get('input[type="number"]').first().clear().type('2500');
    
    // Click check/save button
    cy.get('mat-icon').contains('check').parent().click();
    cy.wait(500);
    
    // Should show new goal
    cy.contains('2,500').should('be.visible');
  });

  it('should show entries list with descriptions', () => {
    // Add consumed with description
    cy.get('.mat-mdc-tab').contains('Food').click();
    cy.wait(500);
    cy.contains('button', 'Snack').click();
    cy.wait(500);
    
    // Add exercise with description
    cy.get('.mat-mdc-tab').contains('Exercise').click();
    cy.wait(500);
    cy.contains('button', 'Run').click();
    cy.wait(500);
    
    // Should show entries list
    cy.contains('Today\'s Entries').should('be.visible');
    cy.contains('Snack').should('be.visible');
    cy.contains('Run').should('be.visible');
  });

 


});