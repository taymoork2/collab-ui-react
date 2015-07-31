(function () {
  'use strict';

  angular
    .module('Core')
    .controller('PartnerReportCtrl', PartnerReportCtrl);

  /* @ngInject */
  function PartnerReportCtrl($scope, $translate, $q, PartnerReportService, GraphService, DonutChartService) {
    var vm = this;

    var ABORT = 'ABORT';
    var REFRESH = 'refresh';
    var SET = 'set';
    var EMPTY = 'empty';

    // variables for the active users section
    var activeUserRefreshDiv = 'activeUsersRefreshDiv';
    var activeUsersSort = ['userName', 'orgName', 'numCalls', 'totalActivity'];
    var activeUsersChart = null;
    var mediaQualityChart = null;
    var callMetricsDonutChart = null;
    var activeUserPopulationChart = null;

    vm.activeUsersRefresh = REFRESH;
    vm.activeUserPopulationRefresh = REFRESH;
    vm.showMostActiveUsers = false;
    vm.activeUserReverse = true;
    vm.activeUsersTotalPages = 0;
    vm.activeUserCurrentPage = 0;
    vm.activeUserPredicate = activeUsersSort[3];
    vm.activeButton = [1, 2, 3];
    vm.mostActiveUsers = [];
    vm.displayMostActive = false;
    vm.populationDescription = "";
    vm.activeUserDescription = "";
    vm.mostActiveDescription = "";

    vm.recentUpdate = "";
    vm.customerOptions = [];
    vm.customerSelected = null;

    vm.mediaQualityRefresh = REFRESH;
    vm.callMetricsRefresh = REFRESH;

    vm.registeredEndpoints = [];
    vm.endpointRefresh = REFRESH;
    vm.endpointDescription = "";
    vm.trend = "";
    vm.devices = "";

    vm.timeOptions = [{
      value: 0,
      label: $translate.instant('reportsPage.week'),
      description: $translate.instant('reportsPage.week2')
    }, {
      value: 1,
      label: $translate.instant('reportsPage.month'),
      description: $translate.instant('reportsPage.month2')
    }, {
      value: 2,
      label: $translate.instant('reportsPage.threeMonths'),
      description: $translate.instant('reportsPage.threeMonths2')
    }];
    vm.timeSelected = vm.timeOptions[0];

    vm.customersSet = function () {
      return vm.customerSelected === null;
    };

    vm.activePage = function (num) {
      return vm.activeUserCurrentPage === Math.ceil((num + 1) / 5);
    };

    vm.changePage = function (num) {
      vm.activeUserCurrentPage = num;
    };

    vm.isRefresh = function (tab) {
      return tab === REFRESH;
    };

    vm.isEmpty = function (tab) {
      return tab === EMPTY;
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
      vm.activeUsersRefresh = REFRESH;
      vm.activeUserPopulationRefresh = REFRESH;
      vm.populationDescription = "";
      vm.activeUserDescription = "";
      vm.mostActiveDescription = "";
      getActiveUserReports();

      vm.callMetricsRefresh = REFRESH;
      getCallMetricsReports();

      vm.endpointRefresh = REFRESH;
      vm.registeredEndpoints = [];
      getRegisteredEndpoints();
    };

    init();

    function init() {
      setRegisteredEndpointText();
      PartnerReportService.getOverallActiveUserData(vm.timeSelected);
      PartnerReportService.getCustomerList().then(function (response) {
        updateCustomerFilter(response);

        getRegisteredEndpoints();

        getMediaQualityReports().then(function () {
          invalidateChartSize(mediaQualityChart);
        });

        getActiveUserReports().then(function () {
          invalidateChartSize(activeUsersChart);
          vm.recentUpdate = PartnerReportService.getMostRecentUpdate();
        });

        getCallMetricsReports();
      });

      setGraphResizing();
    }

    function updateCustomerFilter(orgsData) {
      var customers = [];
      // add all customer names to the customerOptions list
      angular.forEach(orgsData, function (org) {
        customers.push({
          value: org.customerOrgId,
          label: org.customerName
        });
      });

      vm.customerOptions = customers.sort(function (a, b) {
        return a.label.localeCompare(b.label);
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
        if (response.tableData !== ABORT && response.graphData !== ABORT) {
          var graphData = response.graphData;
          var populationGraph = response.populationGraph;

          if (activeUsersChart === null || activeUsersChart === undefined) {
            activeUsersChart = GraphService.createActiveUsersGraph(graphData);
          } else {
            GraphService.updateActiveUsersGraph(graphData, activeUsersChart);
            invalidateChartSize(activeUsersChart);
          }

          if (activeUserPopulationChart === null || activeUserPopulationChart === undefined) {
            activeUserPopulationChart = GraphService.createActiveUserPopulationGraph(populationGraph, response.overallPopulation);
          } else {
            GraphService.updateActiveUserPopulationGraph(populationGraph, activeUserPopulationChart, response.overallPopulation);
            invalidateChartSize(activeUserPopulationChart);
          }

          vm.mostActiveUsers = response.tableData;
          vm.displayMostActive = false;
          if (vm.mostActiveUsers.length > 0) {
            vm.displayMostActive = true;
          }

          if (vm.mostActiveUsers !== undefined && vm.mostActiveUsers !== null) {
            var totalUsers = vm.mostActiveUsers.length;
            vm.activeUsersTotalPages = Math.ceil(totalUsers / 5);
          } else {
            vm.activeUsersTotalPages = 0;
          }
          vm.activeUserCurrentPage = 1;
          vm.activeButton = [1, 2, 3];
          vm.activeUserPredicate = activeUsersSort[3];

          vm.activeUsersRefresh = SET;
          if (graphData.length === 0) {
            vm.activeUsersRefresh = EMPTY;
          }

          vm.activeUserDescription = $translate.instant('activeUsers.description', {
            time: vm.timeSelected.description,
            customer: vm.customerSelected.label
          });
          vm.mostActiveDescription = $translate.instant('activeUsers.mostActiveDescription', {
            time: vm.timeSelected.description,
            customer: vm.customerSelected.label
          });
          vm.populationDescription = $translate.instant('activeUserPopulation.description', {
            percentage: response.overallPopulation,
            time: vm.timeSelected.description,
            customer: vm.customerSelected.label
          });

          vm.activeUserPopulationRefresh = EMPTY;
          if (populationGraph.length !== 0) {
            vm.activeUserPopulationRefresh = SET;
          }
        }
        return;
      });
    }

    function setGraphResizing() {
      angular.element('#engagementTab').on("click", function () {
        if (vm.activeUsersRefresh !== EMPTY) {
          invalidateChartSize(activeUsersChart);
          invalidateChartSize(activeUserPopulationChart);
        }
      });

      angular.element('#qualityTab').on("click", function () {
        if (vm.mediaQualityRefresh !== EMPTY) {
          invalidateChartSize(mediaQualityChart);
        }

        if (vm.callMetricsRefresh !== EMPTY) {
          invalidateChartSize(callMetricsDonutChart);
        }
      });
    }

    function getMediaQualityReports() {
      return PartnerReportService.getMediaQualityMetrics(vm.customerSelected, vm.timeSelected).then(function (response) {
        var graphData = response;
        if (mediaQualityChart === null) {
          mediaQualityChart = GraphService.createMediaQualityGraph(graphData);
        } else {
          GraphService.updateMediaQualityGraph(graphData, mediaQualityChart);
          invalidateChartSize(mediaQualityChart);
        }
        if (graphData.length === 0) {
          vm.mediaQualityRefresh = EMPTY;
        } else {
          vm.mediaQualityRefresh = SET;
        }
        return;
      });
    }

    function getCallMetricsReports() {
      return PartnerReportService.getCallMetricsData(vm.customerSelected, vm.timeSelected).then(function (data) {
        if (data !== ABORT) {
          if (callMetricsDonutChart === null) {
            callMetricsDonutChart = DonutChartService.createCallMetricsDonutChart(data);
          } else {
            DonutChartService.updateCallMetricsDonutChart(data, callMetricsDonutChart);
            invalidateChartSize(callMetricsDonutChart);
          }

          if (angular.isArray(data) && data.length === 0) {
            vm.callMetricsRefresh = EMPTY;
          } else {
            vm.callMetricsRefresh = SET;
          }
        }
        return;
      });
    }

    function invalidateChartSize(chart) {
      if (chart !== null && chart !== undefined) {
        chart.invalidateSize();
      }
    }

    function getRegisteredEndpoints() {
      setRegisteredEndpointText();
      PartnerReportService.getRegisteredEndpoints(vm.customerSelected, vm.timeSelected).then(function (response) {
        if (response !== ABORT) {
          vm.registeredEndpoints = response;
          if (!angular.isArray(response) || response.length === 0) {
            vm.endpointRefresh = EMPTY;
          } else {
            vm.endpointRefresh = SET;
          }
        }
      });
    }

    function setRegisteredEndpointText() {
      vm.endpointDescription = $translate.instant('registeredEndpoints.description', {
        time: vm.timeSelected.description
      });
      vm.trend = $translate.instant('registeredEndpoints.trend', {
        time: vm.timeSelected.label
      });
      vm.devices = $translate.instant('registeredEndpoints.maxRegisteredDevices', {
        time: vm.timeSelected.label
      });
    }
  }
})();
