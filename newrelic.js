/**
 * New Relic agent configuration.
 *
 * See lib/config.defaults.js in the agent distribution for a more complete
 * description of configuration variables and their potential values.
 */
exports.config = {
  agent_enabled: (process.env.NEW_RELIC_APP_NAME && process.env.NEW_RELIC_LICENSE_KEY) ? true : false,
  app_name: [process.env.NEW_RELIC_APP_NAME],
  license_key: process.env.NEW_RELIC_LICENSE_KEY,
  logging: {
    level: 'info'
  },
  capture_params: true,
  browser_monitoring : {
    enable : true
  }
};
