(function () {
  'use strict';

  var HealthStatusType = require('modules/core/health-monitor').HealthStatusType;

  /* @ngInject */
  function HelpdeskHeaderController($interval, $scope, $translate, HealthService, HelpdeskSearchHistoryService, UrlConfig) {
    var vm = this;
    vm.clearSearchHistory = clearSearchHistory;
    vm.populateHistory = populateHistory;
    vm.loadSearch = loadSearch;
    vm.searchHistory = HelpdeskSearchHistoryService.getAllSearches() || [];
    vm.statusPageUrl = UrlConfig.getStatusPageUrl();
    vm.pageHeader = $translate.instant('helpdesk.navHeaderTitleNew');

    getHealthMetrics();
    var healthStatusPoller = $interval(getHealthMetrics, 60000);
    $scope.$on('$destroy', function () {
      $interval.cancel(healthStatusPoller);
    });

    function loadSearch(search) {
      $scope.$broadcast('helpdeskLoadSearchEvent', {
        message: search,
      });
    }

    function clearSearchHistory() {
      HelpdeskSearchHistoryService.clearSearchHistory();
      vm.searchHistory = [];
    }

    function populateHistory() {
      vm.searchHistory = HelpdeskSearchHistoryService.getAllSearches() || [];
    }

    function getHealthMetrics() {
      HealthService.getHealthCheck().then(function (data) {
        vm.healthMetrics = data.components;
        vm.overallSparkStatus = getHighestSeverity(vm.healthMetrics);
      });
    }

    function getHighestSeverity(healthStatuses) {
      var degraded_performance = _.find(healthStatuses, function (data) {
        return data.status === HealthStatusType.DEGRADED_PERFORMANCE;
      });
      var error = _.find(healthStatuses, function (data) {
        return data.status === HealthStatusType.ERROR;
      });
      var warning = _.find(healthStatuses, function (data) {
        return data.status === HealthStatusType.WARNING;
      });
      var major_outage = _.find(healthStatuses, function (data) {
        return data.status === HealthStatusType.MAJOR_OUTAGE;
      });
      var partialOutage = _.find(healthStatuses, function (data) {
        return data.status === HealthStatusType.PARTIAL_OUTAGE;
      });
      var operational = _.find(healthStatuses, function (data) {
        return data.status === HealthStatusType.OPERATIONAL;
      });

      var highestSeverity = error || major_outage || warning || partialOutage || degraded_performance || operational;
      if (highestSeverity) {
        return highestSeverity.status;
      }
      return HealthStatusType.UNKNOWN;
    }
  }

  angular
    .module('Squared')
    .controller('HelpdeskHeaderController', HelpdeskHeaderController);
}());
