(function () {
  'use strict';

  /* @ngInject */
  function HelpdeskHeaderController($interval, $scope, $translate, FeatureToggleService, HelpdeskSearchHistoryService, HelpdeskSparkStatusService, UrlConfig) {
    var vm = this;
    vm.clearSearchHistory = clearSearchHistory;
    vm.populateHistory = populateHistory;
    vm.loadSearch = loadSearch;
    vm.searchHistory = HelpdeskSearchHistoryService.getAllSearches() || [];
    vm.statusPageUrl = UrlConfig.getStatusPageUrl();

    FeatureToggleService.atlas2017NameChangeGetStatus().then(function (toggle) {
      if (toggle) {
        vm.pageHeader = $translate.instant('helpdesk.navHeaderTitleNew');
      } else {
        vm.pageHeader = $translate.instant('helpdesk.navHeaderTitle');
      }
    });

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
