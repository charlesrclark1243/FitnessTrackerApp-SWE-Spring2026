const EMPTY_SUMMARY = {
  median_heart_rate: 0,
  median_systolic: 0,
  median_diastolic: 0,
  heart_rate_entries: [],
  blood_pressure_entries: []
};

const POPULATED_SUMMARY = {
  median_heart_rate: 72,
  median_systolic: 118,
  median_diastolic: 78,
  heart_rate_entries: [
    { id: 10, user_id: 1, rate: 68, logged_at: '2026-04-25T08:00:00Z' },
    { id: 11, user_id: 1, rate: 72, logged_at: '2026-04-26T09:30:00Z' },
    { id: 12, user_id: 1, rate: 76, logged_at: '2026-04-27T07:15:00Z' }
  ],
  blood_pressure_entries: [
    { id: 20, user_id: 1, systolic: 115, diastolic: 76, logged_at: '2026-04-25T08:05:00Z' },
    { id: 21, user_id: 1, systolic: 118, diastolic: 78, logged_at: '2026-04-26T09:35:00Z' },
    { id: 22, user_id: 1, systolic: 121, diastolic: 80, logged_at: '2026-04-27T07:20:00Z' }
  ]
};

function setupCommonIntercepts() {
  cy.intercept('POST', '**/api/auth/login', {
    statusCode: 200,
    body: { id: 1, username: 'demo', token: 'demo-token' }
  }).as('login');

  // Stub unrelated home-page endpoints so they don't cause noise
  cy.intercept('GET', '**/api/weight/logs', { statusCode: 200, body: { entries: [] } });
  cy.intercept('GET', '**/api/calories**', { statusCode: 200, body: {} });
  cy.intercept('GET', '**/api/water**', { statusCode: 200, body: { entries: [] } });
  cy.intercept('GET', '**/api/steps**', { statusCode: 200, body: {} });
  cy.intercept('GET', '**/api/profile**', { statusCode: 200, body: {} });
}

function loginWithIntercepts() {
  cy.visit('/login');
  cy.get('input[formControlName="username"]').type('demo');
  cy.get('input[formControlName="password"]').type('demo');
  cy.get('button[type="submit"]').click();
  cy.wait('@login');
}

// ─────────────────────────────────────────────────────────────
// DISPLAY CARD
// ─────────────────────────────────────────────────────────────
describe('Heart Health Display Card', () => {
  beforeEach(() => {
    setupCommonIntercepts();
    cy.intercept('GET', '**/api/heart/summary', { statusCode: 200, body: EMPTY_SUMMARY }).as('heartSummary');
    loginWithIntercepts();
    cy.wait('@heartSummary');
  });

  it('renders the Heart Health Summary card', () => {
    cy.contains('Heart Health Summary').should('be.visible');
  });

  it('shows empty state when no data has been logged', () => {
    cy.contains('No heart data logged yet.').should('be.visible');
  });

  it('shows median heart rate box when data exists', () => {
    cy.intercept('GET', '**/api/heart/summary', {
      statusCode: 200,
      body: POPULATED_SUMMARY
    }).as('heartSummaryPopulated');

    cy.get('app-heart-display').contains('button', 'refresh').click({ force: true });
    cy.wait('@heartSummaryPopulated');

    cy.contains('Median Heart Rate').should('be.visible');
    cy.contains('72').should('be.visible');
    cy.contains('BPM').should('be.visible');
  });

  it('shows median blood pressure box when data exists', () => {
    cy.intercept('GET', '**/api/heart/summary', {
      statusCode: 200,
      body: POPULATED_SUMMARY
    }).as('heartSummaryPopulated');

    cy.get('app-heart-display').contains('button', 'refresh').click({ force: true });
    cy.wait('@heartSummaryPopulated');

    cy.contains('Median Blood Pressure').should('be.visible');
    cy.contains('118').should('be.visible');
    cy.contains('78').should('be.visible');
    cy.contains('mmHg').should('be.visible');
  });

  it('shows category badge for heart rate', () => {
    cy.intercept('GET', '**/api/heart/summary', {
      statusCode: 200,
      body: POPULATED_SUMMARY
    }).as('heartSummaryPopulated');

    cy.get('app-heart-display').contains('button', 'refresh').click({ force: true });
    cy.wait('@heartSummaryPopulated');

    cy.get('.median-box.heart-rate .category-badge').should('be.visible').and('not.be.empty');
  });

  it('shows category badge for blood pressure', () => {
    cy.intercept('GET', '**/api/heart/summary', {
      statusCode: 200,
      body: POPULATED_SUMMARY
    }).as('heartSummaryPopulated');

    cy.get('app-heart-display').contains('button', 'refresh').click({ force: true });
    cy.wait('@heartSummaryPopulated');

    cy.get('.median-box.blood-pressure .category-badge').should('be.visible').and('not.be.empty');
  });

  it('shows a motivational message for heart rate', () => {
    cy.intercept('GET', '**/api/heart/summary', {
      statusCode: 200,
      body: POPULATED_SUMMARY
    }).as('heartSummaryPopulated');

    cy.get('app-heart-display').contains('button', 'refresh').click({ force: true });
    cy.wait('@heartSummaryPopulated');

    cy.get('.motivational-message.hr-message').should('be.visible').and('not.be.empty');
  });

  it('shows a motivational message for blood pressure', () => {
    cy.intercept('GET', '**/api/heart/summary', {
      statusCode: 200,
      body: POPULATED_SUMMARY
    }).as('heartSummaryPopulated');

    cy.get('app-heart-display').contains('button', 'refresh').click({ force: true });
    cy.wait('@heartSummaryPopulated');

    cy.get('.motivational-message.bp-message').should('be.visible').and('not.be.empty');
  });

  it('lists all heart rate entries', () => {
    cy.intercept('GET', '**/api/heart/summary', {
      statusCode: 200,
      body: POPULATED_SUMMARY
    }).as('heartSummaryPopulated');

    cy.get('app-heart-display').contains('button', 'refresh').click({ force: true });
    cy.wait('@heartSummaryPopulated');

    cy.contains('Heart Rate Entries').should('be.visible');
    cy.contains('68 BPM').should('be.visible');
    cy.contains('72 BPM').should('be.visible');
    cy.contains('76 BPM').should('be.visible');
  });

  it('lists all blood pressure entries', () => {
    cy.intercept('GET', '**/api/heart/summary', {
      statusCode: 200,
      body: POPULATED_SUMMARY
    }).as('heartSummaryPopulated');

    cy.get('app-heart-display').contains('button', 'refresh').click({ force: true });
    cy.wait('@heartSummaryPopulated');

    cy.contains('Blood Pressure Entries').should('be.visible');
    cy.contains('115 / 76 mmHg').should('be.visible');
    cy.contains('118 / 78 mmHg').should('be.visible');
    cy.contains('121 / 80 mmHg').should('be.visible');
  });

  it('shows error message when summary request fails', () => {
    cy.intercept('GET', '**/api/heart/summary', { statusCode: 500, body: {} }).as('heartSummaryError');

    cy.get('app-heart-display').contains('button', 'refresh').click({ force: true });
    cy.wait('@heartSummaryError');

    cy.contains('Failed to load heart data').should('be.visible');
  });

});

// ─────────────────────────────────────────────────────────────
// LOG CARD – HEART RATE
// ─────────────────────────────────────────────────────────────
describe('Heart Health Log Card – Heart Rate', () => {
  beforeEach(() => {
    setupCommonIntercepts();
    cy.intercept('GET', '**/api/heart/summary', { statusCode: 200, body: EMPTY_SUMMARY }).as('heartSummary');
    loginWithIntercepts();
    cy.wait('@heartSummary');
  });

  it('renders the Log Heart Data card with Heart Rate tab', () => {
    cy.contains('Log Heart Data').should('be.visible');
    cy.contains('Heart Rate').should('be.visible');
  });

  it('Heart Rate tab is active by default', () => {
    cy.get('app-heart-log .mat-mdc-tab.mdc-tab--active').should('contain.text', 'Heart Rate');
  });

  it('Log Heart Rate button is disabled when input is empty', () => {
    cy.contains('button', 'Log Heart Rate').should('be.disabled');
  });

  it('Log Heart Rate button becomes enabled when a valid BPM is entered', () => {
    cy.get('.mat-mdc-tab').contains('Heart Rate').click();
    cy.get('app-heart-log input[type="number"]').first().clear().type('72');
    cy.contains('button', 'Log Heart Rate').should('not.be.disabled');
  });

  it('logs a heart rate successfully and shows snackbar', () => {
    cy.intercept('POST', '**/api/heart/rate', {
      statusCode: 200,
      body: { id: 99, user_id: 1, rate: 72, logged_at: '2026-04-27T10:00:00Z' }
    }).as('logHR');
    cy.intercept('GET', '**/api/heart/summary', {
      statusCode: 200,
      body: {
        ...POPULATED_SUMMARY,
        heart_rate_entries: [{ id: 99, user_id: 1, rate: 72, logged_at: '2026-04-27T10:00:00Z' }]
      }
    }).as('heartSummaryAfter');

    cy.get('.mat-mdc-tab').contains('Heart Rate').click();
    cy.get('app-heart-log input[type="number"]').first().clear().type('72');
    cy.contains('button', 'Log Heart Rate').click();

    cy.wait('@logHR');
    cy.contains('Heart rate logged!').should('be.visible');
  });

  it('clears heart rate input after successful log', () => {
    cy.intercept('POST', '**/api/heart/rate', {
      statusCode: 200,
      body: { id: 99, user_id: 1, rate: 72, logged_at: '2026-04-27T10:00:00Z' }
    }).as('logHR');
    cy.intercept('GET', '**/api/heart/summary', { statusCode: 200, body: EMPTY_SUMMARY });

    cy.get('.mat-mdc-tab').contains('Heart Rate').click();
    cy.get('app-heart-log input[type="number"]').first().clear().type('72');
    cy.contains('button', 'Log Heart Rate').click();

    cy.wait('@logHR');
    cy.get('app-heart-log input[type="number"]').first().should('have.value', '');
  });

  it('shows Undo Last button after logging heart rate', () => {
    cy.intercept('POST', '**/api/heart/rate', {
      statusCode: 200,
      body: { id: 99, user_id: 1, rate: 72, logged_at: '2026-04-27T10:00:00Z' }
    }).as('logHR');
    cy.intercept('GET', '**/api/heart/summary', { statusCode: 200, body: EMPTY_SUMMARY });

    cy.get('.mat-mdc-tab').contains('Heart Rate').click();
    cy.get('app-heart-log input[type="number"]').first().clear().type('72');
    cy.contains('button', 'Log Heart Rate').click();

    cy.wait('@logHR');
    cy.get('app-heart-log').contains('button', 'Undo Last').should('be.visible');
  });

  it('undoes last heart rate entry and hides Undo button', () => {
    cy.intercept('POST', '**/api/heart/rate', {
      statusCode: 200,
      body: { id: 99, user_id: 1, rate: 72, logged_at: '2026-04-27T10:00:00Z' }
    }).as('logHR');
    cy.intercept('DELETE', '**/api/heart/heart_rate/99', { statusCode: 200, body: {} }).as('deleteHR');
    cy.intercept('GET', '**/api/heart/summary', { statusCode: 200, body: EMPTY_SUMMARY }).as('summaryAfterUndo');

    cy.get('.mat-mdc-tab').contains('Heart Rate').click();
    cy.get('app-heart-log input[type="number"]').first().clear().type('72');
    cy.contains('button', 'Log Heart Rate').click();
    cy.wait('@logHR');

    cy.get('app-heart-log').contains('button', 'Undo Last').click();
    cy.wait('@deleteHR');

    cy.get('app-heart-log').contains('button', 'Undo Last').should('not.exist');
  });

  it('shows snackbar error when heart rate logging fails', () => {
    cy.intercept('POST', '**/api/heart/rate', { statusCode: 500, body: {} }).as('logHRFail');

    cy.get('.mat-mdc-tab').contains('Heart Rate').click();
    cy.get('app-heart-log input[type="number"]').first().clear().type('72');
    cy.contains('button', 'Log Heart Rate').click();

    cy.wait('@logHRFail');
    cy.contains('Failed to log heart rate.').should('be.visible');
  });
});

// ─────────────────────────────────────────────────────────────
// LOG CARD – BLOOD PRESSURE
// ─────────────────────────────────────────────────────────────
describe('Heart Health Log Card – Blood Pressure', () => {
  beforeEach(() => {
    setupCommonIntercepts();
    cy.intercept('GET', '**/api/heart/summary', { statusCode: 200, body: EMPTY_SUMMARY }).as('heartSummary');
    loginWithIntercepts();
    cy.wait('@heartSummary');
    // Switch to Blood Pressure tab once
    cy.get('.mat-mdc-tab').contains('Blood Pressure').click();
  });

  it('Blood Pressure tab is reachable and shows two inputs', () => {
    cy.get('app-heart-log input[type="number"]').should('have.length.at.least', 2);
  });

  it('Log Blood Pressure button is disabled when inputs are empty', () => {
    cy.contains('button', 'Log Blood Pressure').should('be.disabled');
  });

});

// ─────────────────────────────────────────────────────────────
// INTEGRATION: log → display refresh
// ─────────────────────────────────────────────────────────────
describe('Heart Health – log updates display', () => {
  beforeEach(() => {
    setupCommonIntercepts();
    cy.intercept('GET', '**/api/heart/summary', { statusCode: 200, body: EMPTY_SUMMARY }).as('heartSummaryEmpty');
    loginWithIntercepts();
    cy.wait('@heartSummaryEmpty');
  });

  it('display refreshes with new heart rate after logging', () => {
    cy.intercept('POST', '**/api/heart/rate', {
      statusCode: 200,
      body: { id: 99, user_id: 1, rate: 65, logged_at: '2026-04-27T10:00:00Z' }
    }).as('logHR');
    cy.intercept('GET', '**/api/heart/summary', {
      statusCode: 200,
      body: {
        median_heart_rate: 65,
        median_systolic: 0,
        median_diastolic: 0,
        heart_rate_entries: [{ id: 99, user_id: 1, rate: 65, logged_at: '2026-04-27T10:00:00Z' }],
        blood_pressure_entries: []
      }
    }).as('heartSummaryAfterHR');

    cy.get('.mat-mdc-tab').contains('Heart Rate').click();
    cy.get('app-heart-log input[type="number"]').first().clear().type('65');
    cy.contains('button', 'Log Heart Rate').click();

    cy.wait('@logHR');
    cy.wait('@heartSummaryAfterHR');

    cy.contains('Median Heart Rate').should('be.visible');
    cy.contains('65').should('be.visible');
    cy.contains('65 BPM').should('be.visible');
  });

  it('deleting a heart rate entry from display triggers a refresh', () => {
    cy.intercept('GET', '**/api/heart/summary', {
      statusCode: 200,
      body: POPULATED_SUMMARY
    }).as('heartSummaryPopulated');

    cy.get('app-heart-display').contains('button', 'refresh').click({ force: true });
    cy.wait('@heartSummaryPopulated');

    cy.intercept('DELETE', '**/api/heart/heart_rate/10', { statusCode: 200, body: {} }).as('deleteEntry');
    cy.intercept('GET', '**/api/heart/summary', {
      statusCode: 200,
      body: {
        ...POPULATED_SUMMARY,
        heart_rate_entries: POPULATED_SUMMARY.heart_rate_entries.filter(e => e.id !== 10)
      }
    }).as('heartSummaryAfterDelete');

    cy.get('app-heart-display .entry-row').first().find('button.mat-warn').click({ force: true });
    cy.wait('@deleteEntry');
    cy.wait('@heartSummaryAfterDelete');

    cy.get('app-heart-display .section').contains('68 BPM').should('not.exist');
  });

});
