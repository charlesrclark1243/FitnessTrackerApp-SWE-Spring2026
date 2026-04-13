describe('Weight logging on Home page', () => {
  beforeEach(() => {
    cy.intercept('POST', '**/api/auth/login', {
      statusCode: 200,
      body: {
        id: 1,
        username: 'demo',
        token: 'demo-token'
      }
    }).as('login');

    cy.intercept('GET', '**/api/weight/logs', {
      statusCode: 200,
      body: {
        entries: [
          {
            id: 201,
            user_id: 1,
            weight: 75.2,
            unit: 'metric',
            logged_at: '2026-04-01T08:00:00.000Z'
          },
          {
            id: 202,
            user_id: 1,
            weight: 75.4,
            unit: 'metric',
            logged_at: '2026-04-01T18:00:00.000Z'
          },
          {
            id: 203,
            user_id: 1,
            weight: 74.9,
            unit: 'metric',
            logged_at: '2026-04-02T08:00:00.000Z'
          }
        ]
      }
    }).as('getWeights');

    cy.visit('/login');
    cy.get('[data-cy="login-username"]').type('demo');
    cy.get('[data-cy="login-password"]').type('demo');
    cy.get('[data-cy="login-submit"]').click();

    cy.wait('@login');
    cy.wait('@getWeights');
  });

  it('shows weight logs in table tab', () => {
    cy.get('[data-cy="weight-history"]').should('be.visible');
    cy.contains('View Logs').should('be.visible');
    cy.get('[data-cy="weight-log-row"]').should('have.length', 3);
    cy.contains('75.2 kg').should('exist');
  });

  it('renders the graph tab with plotted weight records and date markers', () => {
    cy.contains('.mdc-tab__text-label', 'Graphs').click();

    cy.get('[data-cy="weight-graph"]').should('be.visible');
    cy.get('[data-cy="weight-graph"] svg polyline')
      .should('have.attr', 'points')
      .and('not.equal', '');

    cy.get('[data-cy="weight-graph"] svg circle').should('have.length', 3);

    // Two unique days should produce two day-start date markers.
    cy.get('[data-cy="weight-graph"] .x-axis-marker').should('have.length', 2);
  });

  it('logs a new weight and keeps graph view available', () => {
    cy.intercept('PUT', '**/api/weight/add', {
      statusCode: 200,
      body: {
        message: 'Weight log added successfully',
        log: {
          id: 204,
          user_id: 1,
          weight_kg: 74.6,
          logged_at: '2026-04-03T08:00:00.000Z'
        }
      }
    }).as('addWeight');

    cy.intercept('PUT', '**/api/profile', {
      statusCode: 200,
      body: {
        id: 1,
        username: 'demo',
        token: 'demo-token'
      }
    }).as('updateProfile');

    cy.get('[data-cy="weight-input"]').type('74.6');
    cy.get('[data-cy="log-weight-btn"]').click();

    cy.wait('@addWeight');
    cy.wait('@getWeights');
    cy.wait('@updateProfile');

    cy.contains('.mdc-tab__text-label', 'Graphs').click();
    cy.get('[data-cy="weight-graph"]').should('be.visible');
  });
});