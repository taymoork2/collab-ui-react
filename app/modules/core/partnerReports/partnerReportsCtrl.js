(function () {
  'use strict';

  angular
    .module('Core')
    .controller('PartnerReportCtrl', PartnerReportCtrl);

  /* @ngInject */
  function PartnerReportCtrl($scope, $translate, $q, PartnerReportService, GraphService, DonutChartService) {
    var vm = this;

    // variables for the active users section
    var activeUserRefreshDiv = 'activeUsersRefreshDiv';
    var noActiveUserDataDiv = '<div class="no-data-center"><h3 class="no-data">' + $translate.instant('reportsPage.noData') + '</h3></div>';
    var isActiveUsersRefreshDiv = '<div class="timechartDiv clear-graph"></div><i class="active-user-status icon icon-spinner icon-2x"></i>';
    var activeUsersSort = ['userName', 'orgName', 'numCalls', 'totalActivity'];

    var activeUsersChart = null;
    var mediaQualityChart = null;
    var callMetricsDonutChart = null;

    vm.activeUsersRefresh = 'refresh';
    vm.showMostActiveUsers = false;
    vm.activeUserReverse = true;
    vm.activeUsersTotalPages = 0;
    vm.activeUserCurrentPage = 0;
    vm.activeUserPredicate = activeUsersSort[3];
    vm.activeButton = [1, 2, 3];
    vm.mostActiveUsers = [];

    vm.recentUpdate = "";
    vm.customerOptions = [];
    vm.customerSelected = null;

    vm.mediaQualityRefresh = 'refresh';
    var mediaQualityRefreshDiv = 'mediaQualityRefreshDiv';
    var noMediaQualityDataDiv = '<div class="no-data-center"><h3 class="no-data">' + $translate.instant('reportsPage.noData') + '</h3></div>';
    var isMediaQualityRefreshDiv = '<div class="timechartDiv clear-graph"></div><i class="mediaQuality-status icon icon-spinner icon-2x"></i>';
    vm.callMetricsRefresh = 'refresh';
    var callMetricsRefreshDiv = 'callMetricsRefreshDiv';
    var noCallMetricsRefreshDiv = '<div class="no-data-center"><h3 class="no-data">' + $translate.instant('reportsPage.noData') + '</h3></div>';
    var isCallMetricsRefreshDiv = '<div class="timechartDiv clear-graph"></div><i class="call-metrics-status icon icon-spinner icon-2x"></i>';

    vm.timeOptions = [{
      value: 0,
      label: $translate.instant('reportsPage.week')
    }, {
      value: 1,
      label: $translate.instant('reportsPage.month')
    }, {
      value: 2,
      label: $translate.instant('reportsPage.threeMonths')
    }];
    vm.timeSelected = vm.timeOptions[0];

    vm.activePage = function (num) {
      return vm.activeUserCurrentPage === Math.ceil((num + 1) / 5);
    };

    vm.changePage = function (num) {
      vm.activeUserCurrentPage = num;
    };

    vm.isRefresh = function (tab) {
      return tab === 'refresh';
    };

    vm.isEmpty = function (tab) {
      return tab === 'empty';
    };

    vm.mostActiveSort = function (num) {
      if (vm.activeUserPredicate === activeUsersSort[num]) {
        vm.activeUserReverse = !vm.activeUserReverse;
      } else {
        if (num >= 2) {
          vm.activeUserReverse = true;
        } else {
          vm.activeUserReverse = false;
        }
        vm.activeUserPredicate = activeUsersSort[num];
      }
    };

    vm.pageForward = function () {
      if ((vm.activeUserCurrentPage === vm.activeButton[2]) && (vm.activeButton[2] !== vm.activeUsersTotalPages)) {
        vm.activeButton[0] += 1;
        vm.activeButton[1] += 1;
        vm.activeButton[2] += 1;
      }
      if (vm.activeUserCurrentPage !== vm.activeUsersTotalPages) {
        vm.changePage(vm.activeUserCurrentPage + 1);
      }
    };

    vm.pageBackward = function () {
      if ((vm.activeUserCurrentPage === vm.activeButton[0]) && (vm.activeButton[0] !== 1)) {
        vm.activeButton[0] -= 1;
        vm.activeButton[1] -= 1;
        vm.activeButton[2] -= 1;
      }
      if (vm.activeUserCurrentPage !== 1) {
        vm.changePage(vm.activeUserCurrentPage - 1);
      }
    };

    vm.updateReports = function () {
      vm.activeUsersRefresh = 'refresh';
      angular.element('#' + activeUserRefreshDiv).html(isActiveUsersRefreshDiv);
      getActiveUserReports();
      vm.callMetricsRefresh = 'refresh';
      angular.element('#' + callMetricsRefreshDiv).html(isCallMetricsRefreshDiv);
      getCallMetricsReports();
    };

    init();

    function init() {
      PartnerReportService.getCustomerList().then(function (response) {
        updateCustomerFilter(response);

        var promises = [];
        var activeUserPromise = getActiveUserReports().then(function () {
          invalidateChartSize(activeUsersChart);
        });
        promises.push(activeUserPromise);

        var mediaQualityPromise = getMediaQualityReports().then(function () {
          invalidateChartSize(mediaQualityChart);
        });
        promises.push(mediaQualityPromise);
        var callMetricsPromise = getCallMetricsReports();
        promises.push(callMetricsPromise);
        $q.all(promises).then(function () {
          vm.recentUpdate = PartnerReportService.getMostRecentUpdate();
          setGraphResizing();
        });
      });
    }

    function updateCustomerFilter(orgsData) {
      // add all customer names to the customerOptions list
      angular.forEach(orgsData, function (org) {
        vm.customerOptions.push({
          value: org.customerOrgId,
          label: org.customerName
        });
      });

      if (vm.customerOptions[0] !== null && vm.customerOptions[0] !== undefined) {
        vm.customerSelected = vm.customerOptions[0];
      } else {
        vm.customerSelected = {
          value: 0,
          label: ""
        };
      }
    }

    function getActiveUserReports() {
      return PartnerReportService.getActiveUserData(vm.customerSelected, vm.timeSelected).then(function (response) {
        var graphData = response.graphData;

        if (activeUsersChart === null) {
          activeUsersChart = GraphService.createActiveUsersGraph(graphData);
        } else {
          GraphService.updateActiveUsersGraph(graphData, activeUsersChart);
          invalidateChartSize(activeUsersChart);
        }
        vm.mostActiveUsers = response.tableData;

        if (vm.mostActiveUsers !== undefined && vm.mostActiveUsers !== null) {
          var totalUsers = vm.mostActiveUsers.length;
          vm.activeUsersTotalPages = Math.ceil(totalUsers / 5);
        } else {
          vm.activeUsersTotalPages = 0;
        }
        vm.activeUserCurrentPage = 1;
        vm.activeButton = [1, 2, 3];
        vm.activeUserPredicate = activeUsersSort[3];

        if (graphData.length === 0) {
          angular.element('#' + activeUserRefreshDiv).html(noActiveUserDataDiv);
          vm.activeUsersRefresh = 'empty';
        } else {
          vm.activeUsersRefresh = 'set';
        }

        return;
      });
    }

    function setGraphResizing() {
      angular.element('#engagementTab').on("click", function () {
        if (vm.activeUsersRefresh !== 'empty') {
          invalidateChartSize(activeUsersChart);
        }
      });

      angular.element('#qualityTab').on("click", function () {
        if (vm.mediaQualityRefresh !== 'empty') {
          invalidateChartSize(mediaQualityChart);
        }

        if (vm.callMetricsRefresh !== 'empty') {
          invalidateChartSize(callMetricsDonutChart);
        }
      });
    }

    function getMediaQualityReports() {
      return PartnerReportService.getMediaQualityMetrics().then(function (response) {
        var graphData = response.data;
        if (mediaQualityChart === null) {
          mediaQualityChart = GraphService.createMediaQualityGraph(graphData);
        } else {
          GraphService.updateMediaQualityGraph(graphData, mediaQualityChart);
          invalidateChartSize(mediaQualityChart);
        }
        if (graphData.length === 0) {
          angular.element('#' + mediaQualityRefreshDiv).html(noMediaQualityDataDiv);
          vm.mediaQualityRefresh = 'empty';
        } else {
          vm.mediaQualityRefresh = 'set';
        }
        return;
      });
    }

    function getCallMetricsReports() {
      return PartnerReportService.getCallMetricsData().then(function (data) {
        if (callMetricsDonutChart === null) {
          callMetricsDonutChart = DonutChartService.createCallMetricsDonutChart(data);
        } else {
          DonutChartService.updateCallMetricsDonutChart(data, callMetricsDonutChart);
          invalidateChartSize(callMetricsDonutChart);
        }

        if (angular.isArray(data) && data.length === 0) {
          angular.element('#' + callMetricsRefreshDiv).html(noCallMetricsRefreshDiv);
          vm.callMetricsRefresh = 'empty';
        } else {
          vm.callMetricsRefresh = 'set';
        }
        return;
      });
    }

    function invalidateChartSize(chart) {
      if (chart !== null && chart !== undefined) {
        chart.invalidateSize();
      }
    }
  }
})();
