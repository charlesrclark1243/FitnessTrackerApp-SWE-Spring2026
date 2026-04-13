/// <reference types="cypress" />

describe('Profile page and profile stats', () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.visit('/login');

    // Prevent unrelated home-page API calls from returning 401 and interfering with routing/state.
    cy.intercept('GET', '**/api/weight/logs*', {
      statusCode: 200,
      body: { entries: [] }
    }).as('weightLogs');

    cy.intercept('POST', '**/api/caloriegoal', {
      statusCode: 200,
      body: { adjusted_calories: 2000 }
    }).as('calorieGoal');

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

    cy.intercept('GET', '**/api/profile*', {
      statusCode: 200,
      body: {
        user_id: 1,
        date_of_birth: '2005-07-07T00:00:00.000Z',
        sex: 'female',
        height_cm: 170,
        weight_kg: 56,
        neck_cm: 45,
        waist_cm: 70,
        hips_cm: 95
      }
    }).as('loadProfile');

    cy.intercept('GET', '**/api/profile/stats*', {
      statusCode: 200,
      body: {
        age: 20,
        bmi: 19.4,
        bfp: 22.1,
        bmr: 1400,
        tdee: 2000
      }
    }).as('loadStats');

    cy.get('[data-cy="login-username"]').type('demo');
    cy.get('[data-cy="login-password"]').type('demo');
    cy.get('[data-cy="login-submit"]').click();

    cy.wait('@login');

    cy.visit('/profile');
    cy.url().should('include', '/profile');
    cy.wait('@loadProfile');
    cy.wait('@loadStats');
    cy.get('[data-cy="health-profile-form"]', { timeout: 10000 }).should('be.visible');
  });

  it('renders the profile page with stats and form', () => {
    cy.get('[data-cy="profile-stats-card"]').should('be.visible');
    cy.get('[data-cy="health-profile-card"]').should('be.visible');
    cy.get('[data-cy="health-profile-form"]').should('be.visible');
  });

  it('shows profile stats correctly from backend user data', () => {
    cy.get('[data-cy="stat-age"]').should('contain.text', 'Age');
    cy.get('[data-cy="stat-age"]').should('contain.text', 'yrs');

    cy.get('[data-cy="stat-bmi"]').should('contain.text', 'BMI');
    cy.get('[data-cy="stat-bmi"]').should('not.contain.text', 'N/A');

    cy.get('[data-cy="stat-bfp"]').should('contain.text', 'Deurenberg BFP');
    cy.get('[data-cy="stat-bfp"]').should('not.contain.text', 'N/A');
  });

  it('allows editing profile and saving changes', () => {
    cy.intercept('PUT', '**/api/profile', {
      statusCode: 200,
      body: {
        user_id: 1,
        height_cm: 172,
        weight_kg: 58,
        date_of_birth: '2005-07-07T00:00:00.000Z',
        sex: 'female',
        neck_cm: 44,
        waist_cm: 71,
        hips_cm: 96
      }
    }).as('saveProfile');

    cy.intercept('GET', '**/api/profile/stats*', {
      statusCode: 200,
      body: {
        age: 20,
        bmi: 19.6,
        bfp: 22.8,
        bmr: 1410,
        tdee: 2010
      }
    }).as('reloadStats');

    cy.get('[data-cy="profile-height-cm"]').clear().type('172');
    cy.get('[data-cy="profile-weight-kg"]').clear().type('58');
    cy.get('[data-cy="profile-save-btn"]').click();

    cy.wait('@saveProfile')
      .its('request.body')
      .should((body) => {
        expect(body.height_cm).to.eq(172);
        expect(body.weight_kg).to.eq(58);
      });

    cy.wait('@reloadStats');

    cy.get('[data-cy="profile-save-msg"]').should('contain.text', 'Saved');
  });

  it('shows BFP as N/A for unsupported sex', () => {
    cy.intercept('PUT', '**/api/profile', {
      statusCode: 200,
      body: {
        user_id: 1,
        height_cm: 170,
        weight_kg: 56,
        date_of_birth: '2005-07-07T00:00:00.000Z',
        sex: 'na',
        neck_cm: 45,
        waist_cm: 70
      }
    }).as('saveProfileNa');

    cy.intercept('GET', '**/api/profile/stats*', {
      statusCode: 200,
      body: {
        age: 20,
        bmi: 19.4,
        bfp: null,
        bmr: 1380,
        tdee: 1980
      }
    }).as('reloadStatsNa');

    cy.get('[data-cy="health-profile-form"]').should('be.visible');
    cy.get('[data-cy="profile-sex"]').click();
    cy.get('mat-option').contains('Prefer not to say').click();

    cy.get('[data-cy="profile-save-btn"]').click();
    cy.wait('@saveProfileNa');
    cy.wait('@reloadStatsNa');

    cy.get('[data-cy="stat-bfp"]').should('contain.text', 'N/A');
  });
});
