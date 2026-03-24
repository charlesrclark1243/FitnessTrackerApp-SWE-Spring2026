describe('Weight logging on Home page', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  it('logs a weight and displays the updated history', () => {
    cy.intercept('POST', '**/api/auth/login', {
      statusCode: 200,
      body: {
        id: 1,
        username: 'demo',
        token: 'demo-token',
        height: 170,
        weight: 56,
        dateOfBirth: '2000-01-01T00:00:00.000Z',
        sex: 'male'
      }
    }).as('login');

    cy.intercept('POST', '**/api/weight', {
      statusCode: 201,
      body: {
        id: 101,
        userId: 1,
        weightKG: 57.2,
        loggedAt: '2026-03-20T10:00:00.000Z'
      }
    }).as('postWeight');

    cy.intercept('GET', '**/api/weight*', {
      statusCode: 200,
      body: [
        {
          id: 101,
          userId: 1,
          weightKG: 57.2,
          loggedAt: '2026-03-20T10:00:00.000Z'
        },
        {
          id: 100,
          userId: 1,
          weightKG: 56.8,
          loggedAt: '2026-03-18T10:00:00.000Z'
        }
      ]
    }).as('getWeights');

    cy.get('[data-cy="login-username"]').type('demo');
    cy.get('[data-cy="login-password"]').type('demo');
    cy.get('[data-cy="login-submit"]').click();

    cy.wait('@login');

    cy.get('[data-cy="weight-input"]').type('57.2');
    cy.get('[data-cy="log-weight-btn"]').click();

    cy.wait('@postWeight');

    cy.get('[data-cy="toggle-weight-logs-btn"]').click();

    cy.wait('@getWeights');

    cy.get('[data-cy="weight-history"]').should('be.visible');
    cy.get('[data-cy="weight-log-row"]').should('have.length', 2);
    cy.contains('57.2 kg').should('exist');
  });

  it('shows the last 30 logs when user clicks the toggle', () => {
    cy.intercept('POST', '**/api/auth/login', {
      statusCode: 200,
      body: {
        id: 1,
        username: 'demo',
        token: 'demo-token',
        height: 170,
        weight: 56,
        dateOfBirth: '2000-01-01T00:00:00.000Z',
        sex: 'male'
      }
    }).as('login');

    cy.intercept('GET', '**/api/weight*', {
      statusCode: 200,
      body: [
        {
          id: 1,
          userId: 1,
          weightKG: 56.0,
          loggedAt: '2026-03-01T08:00:00.000Z'
        },
        {
          id: 2,
          userId: 1,
          weightKG: 56.4,
          loggedAt: '2026-03-10T08:00:00.000Z'
        }
      ]
    }).as('getWeights');

    cy.get('[data-cy="login-username"]').type('demo');
    cy.get('[data-cy="login-password"]').type('demo');
    cy.get('[data-cy="login-submit"]').click();

    cy.wait('@login');

    cy.get('[data-cy="toggle-weight-logs-btn"]').click();
    cy.wait('@getWeights');

    cy.get('[data-cy="weight-log-row"]').should('have.length', 2);
  });
});