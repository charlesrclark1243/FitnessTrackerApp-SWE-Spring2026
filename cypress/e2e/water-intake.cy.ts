describe('Water Intake Tracker', () => {

  beforeEach(() => {
    // cy.visit restarts the Angular app, which resets the interceptor's
    // in-memory state automatically — no manual reset needed
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
  });

  it('should display water intake components', () => {
    cy.contains('Today\'s Water Intake').should('be.visible');
    cy.contains('Quick Add Water').should('be.visible');
  });

  it('should start with 0ml and show 0%', () => {
    cy.contains('0ml').should('be.visible');
    cy.contains('0%').should('be.visible');
  });

  it('should add 250ml when clicking 250ml button', () => {
    cy.contains('button', '250ml').click();

    cy.contains('250ml').should('be.visible');
    cy.get('mat-progress-bar').should('exist');
  });

  it('should add multiple water entries', () => {
    cy.contains('button', '250ml').click();
    cy.contains('button', '500ml').click();

    cy.contains('750ml').should('be.visible');
    cy.contains('Today\'s Entries').should('be.visible');
  });

  it('should add custom amount', () => {
    cy.contains('Custom Amount').click();

    cy.get('input[type="number"]').type('300');
    cy.contains('button', 'Add').click();

    cy.contains('300ml').should('be.visible');
  });

  it('should undo last entry', () => {
    cy.contains('button', '250ml').click();
    cy.contains('250ml').should('be.visible');

    cy.contains('button', '500ml').click();
    cy.contains('750ml').should('be.visible');

    cy.contains('Undo Last').click();

    cy.contains('250ml').should('be.visible');
    cy.contains('750ml').should('not.exist');
  });

  it('should update progress bar as water is added', () => {
    cy.contains('button', '1L').click();

    cy.contains('50%').should('be.visible');
  });

  it('should show success message when goal is reached', () => {
    cy.contains('button', '1L').click();
    cy.contains('1000ml').should('be.visible');

    cy.contains('button', '1L').click();
    cy.contains('Great job').should('be.visible');
  });

 
});
