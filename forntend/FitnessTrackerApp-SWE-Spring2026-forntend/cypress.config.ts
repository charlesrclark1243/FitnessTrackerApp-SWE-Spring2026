export default {
  allowCypressEnv: false,
  screenshotOnRunFailure: false,
  video: false,

  e2e: {
    setupNodeEvents() {
      // implement node event listeners here
    },
    baseUrl: 'http://localhost:4200',
    supportFile: 'cypress/support/e2e.ts'
  },
};
