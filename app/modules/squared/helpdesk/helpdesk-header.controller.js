(function () {
  'use strict';

  /* @ngInject */
  function HelpdeskHeaderController($interval, $scope, HelpdeskSearchHistoryService, HelpdeskSparkStatusService, UrlConfig) {

    var vm = this;
    vm.clearSearchHistory = clearSearchHistory;
    vm.populateHistory = populateHistory;
    vm.loadSearch = loadSearch;
    vm.searchHistory = HelpdeskSearchHistoryService.getAllSearches() || [];
    vm.statusPageUrl = UrlConfig.getStatusPageUrl();

    getHealthMetrics();
    var healthStatusPoller = $interval(getHealthMetrics, 60000);
    $scope.$on('$destroy', function () {
      $interval.cancel(healthStatusPoller);
    });

    function loadSearch(search) {
      $scope.$broadcast('helpdeskLoadSearchEvent', {
        message: search
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
      HelpdeskSparkStatusService.getHealthStatuses().then(function (result) {
        vm.healthMetrics = result;
        vm.overallSparkStatus = HelpdeskSparkStatusService.highestSeverity(vm.healthMetrics);
      });
    }
  }

  angular
    .module('Squared')
    .controller('HelpdeskHeaderController', HelpdeskHeaderController);
}());
