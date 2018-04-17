module.exports = angular
  .module('core.analytics', [
    require('angular-ui-router'),
    require('modules/core/config/config').default,
    require('modules/core/trials/trial.module'),
    require('modules/core/scripts/services/org.service'),
    require('modules/core/scripts/services/authinfo'),
  ])
  .factory('Analytics', require('./analytics.service'))
  .name;
