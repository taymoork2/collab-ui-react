require('./ediscovery.scss');

//TODO agendel: need to address the use of babel-polyfil which is required by spark-core.
require('@ciscospark/internal-plugin-search');
require('angular-ui-grid/ui-grid.js');

var EdiscoverySearchResultDirectiveFactory = require('./ediscovery-search-result.directive').EdiscoverySearchResultDirectiveFactory;

(function () {
  'use strict';

  module.exports = angular
    .module('Ediscovery', [
      require('angular-ui-router'),
      require('angular-translate'),
      require('angular-cache'),
      require('modules/core/analytics'),
      require('modules/core/featureToggle').default,
      require('modules/core/notifications').default,
      require('modules/core/proPack').default,
      require('modules/core/config/config').default,
      require('modules/core/auth/token.service'),
      require('modules/core/scripts/services/org.service'),
      require('modules/core/scripts/services/authinfo'),
      require('modules/ediscovery/bytes_filter'),
      'ui.grid',
    ])
    .factory('EdiscoveryService', require('./ediscovery.service'))
    .factory('ReportUtilService', require('./report.util.service'))
    .factory('EdiscoveryNotificationService', require('./ediscovery-notification.service'))
    .service('EdiscoveryMockData', require('./mock-data'))
    .controller('EdiscoverySearchController', require('./ediscovery-search.controller'))
    .controller('EdiscoveryReportsController', require('./ediscovery-reports.controller'))
    .directive('searchResultsComplete', require('./search-results/search-results-complete.directive'))
    .directive('searchResultsGenerate', require('./search-results/search-results-generate.directive'))
    .directive('searchResultsReport', require('./search-results/search-results-report.directive'))
    .directive('ediscoverySearchResult', EdiscoverySearchResultDirectiveFactory)
    .name;
})();

