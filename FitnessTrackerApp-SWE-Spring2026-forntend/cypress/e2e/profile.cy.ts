describe('Profile page and profile stats', () => {
  beforeEach(() => {
    cy.visit('/login');

    cy.intercept('POST', '**/api/auth/login', {
      statusCode: 200,
      body: {
        id: 1,
        username: 'demo',
        token: 'demo-token',
        height: 170,
        weight: 56,
        dateOfBirth: '2005-07-07T00:00:00.000Z',
        sex: 'female',
        neckCm: 45,
        waistCm: 70,
        hipsCm: 95
      }
    }).as('login');

    cy.get('[data-cy="login-username"]').type('demo');
    cy.get('[data-cy="login-password"]').type('demo');
    cy.get('[data-cy="login-submit"]').click();

    cy.wait('@login');

    cy.visit('/profile');
  });

  it('renders the profile page with stats and form', () => {
    cy.get('[data-cy="profile-stats-card"]').should('be.visible');
    cy.get('[data-cy="health-profile-card"]').should('be.visible');
    cy.get('[data-cy="health-profile-form"]').should('be.visible');
  });

  it('shows profile stats correctly from mocked user data', () => {
    cy.get('[data-cy="stat-age"]').should('contain.text', 'Age');
    cy.get('[data-cy="stat-age"]').should('contain.text', 'yrs');

    cy.get('[data-cy="stat-bmi"]').should('contain.text', 'BMI');
    cy.get('[data-cy="stat-bmi"]').should('not.contain.text', 'N/A');

    cy.get('[data-cy="stat-bfp"]').should('contain.text', 'Deurenberg BFP');
    cy.get('[data-cy="stat-bfp"]').should('not.contain.text', 'N/A');
  });

  it('allows editing profile and saving changes', () => {
    cy.intercept('PATCH', '**/api/users/1', {
      statusCode: 200,
      body: {
        id: 1,
        username: 'demo',
        token: 'demo-token',
        height: 172,
        weight: 58,
        dateOfBirth: '2005-07-07T00:00:00.000Z',
        sex: 'female',
        neckCm: 44,
        waistCm: 71,
        hipsCm: 96
      }
    }).as('saveProfile');

    cy.get('[data-cy="profile-height-cm"]').clear().type('172');
    cy.get('[data-cy="profile-weight-kg"]').clear().type('58');
    cy.get('[data-cy="profile-save-btn"]').click();

    cy.wait('@saveProfile')
      .its('request.body')
      .should((body) => {
        expect(body.height).to.eq(172);
        expect(body.weight).to.eq(58);
      });

    cy.get('[data-cy="profile-save-msg"]').should('contain.text', 'Saved');
  });

  it('shows BFP as N/A for unsupported sex', () => {
    cy.intercept('PATCH', '**/api/users/1', {
      statusCode: 200,
      body: {
        id: 1,
        username: 'demo',
        token: 'demo-token',
        height: 170,
        weight: 56,
        dateOfBirth: '2005-07-07T00:00:00.000Z',
        sex: 'na',
        neckCm: 45,
        waistCm: 70
      }
    }).as('saveProfileNa');

    cy.get('[data-cy="profile-sex"]').click();
    cy.get('mat-option').contains('Prefer not to say').click();

    cy.get('[data-cy="profile-save-btn"]').click();
    cy.wait('@saveProfileNa');

    cy.get('[data-cy="stat-bfp"]').should('contain.text', 'N/A');
  });
});

describe('Profile stats missing state', () => {
  it('shows missing message when required profile data is incomplete', () => {
    cy.visit('/login');

    cy.intercept('POST', '**/api/auth/login', {
      statusCode: 200,
      body: {
        id: 1,
        username: 'demo',
        token: 'demo-token'
      }
    }).as('login');

    cy.get('[data-cy="login-username"]').type('demo');
    cy.get('[data-cy="login-password"]').type('demo');
    cy.get('[data-cy="login-submit"]').click();

    cy.wait('@login');
    cy.visit('/profile');

    cy.get('[data-cy="profile-stats-missing"]').should('be.visible');
    cy.get('[data-cy="profile-stats-missing"]').should('contain.text', 'Complete your');
  });
});