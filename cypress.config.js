import { defineConfig } from 'cypress'

export default defineConfig({
  projectId: '7bd7aw',
  e2e: {
    baseUrl: 'http://localhost:8000',
    chromeWebSecurity: false,
    viewportWidth: 1440,
    viewportHeight: 768,
    pageLoadTimeout: 60000,
    retries: {
      runMode: 3,
    },
    video: false,
    setupNodeEvents(on, config) {
      return config
    },
  },
})
