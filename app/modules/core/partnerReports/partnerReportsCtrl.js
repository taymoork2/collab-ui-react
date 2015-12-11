(function () {
  'use strict';

  angular
    .module('Core')
    .controller('PartnerReportCtrl', PartnerReportCtrl);

  /* @ngInject */
  function PartnerReportCtrl($scope, $timeout, $translate, $q, PartnerReportService, GraphService, DonutChartService, DummyReportService) {
    var vm = this;

    var ABORT = 'ABORT';
    var REFRESH = 'refresh';
    var SET = 'set';
    var EMPTY = 'empty';
    var loadingCustomer = $translate.instant('activeUserPopulation.loadingCustomer');

    // variables for the active users section
    var activeUserRefreshDiv = 'activeUsersRefreshDiv';
    var activeUsersSort = ['userName', 'orgName', 'numCalls', 'totalActivity'];
    var activeUsersChart = null;
    var mediaQualityChart = null;
    var callMetricsDonutChart = null;
    var activeUserPopulationChart = null;

    vm.showEngagement = true;
    vm.showQuality = true;

    vm.activeUsersRefresh = REFRESH;
    vm.activeUserPopulationRefresh = REFRESH;
    vm.activeUserReverse = true;
    vm.activeUsersTotalPages = 0;
    vm.activeUserCurrentPage = 0;
    vm.activeUserPredicate = activeUsersSort[3];
    vm.activeButton = [1, 2, 3];
    vm.mostActiveUsers = [];
    vm.mostActiveTitle = "";
    vm.displayMostActive = false;
    vm.showMostActiveUsers = false;
    vm.activeUserDescription = "";
    vm.mostActiveDescription = "";

    vm.customerOptions = [];
    vm.customerSelected = null;
    vm.mediaQualityRefresh = REFRESH;
    vm.callMetricsRefresh = REFRESH;
    vm.callMetricsDescription = "";
    vm.endpointRefresh = REFRESH;
    vm.registeredEndpoints = [];
    vm.dummyTable = true;
    vm.endpointDescription = "";
    vm.trend = "";
    vm.devices = "";
    vm.resizeCards = resizeCards;
    vm.showHideCards = showHideCards;
    vm.activeUsers = null;
    vm.regEndpoints = null;
    vm.userPopulation = null;
    vm.callMetrics = null;
    vm.mediaQuality = null;

    function resizeCards() {
      setTimeout(function () {
        $('.cs-card-layout').masonry('layout');
      }, 300);
    }

    function showHideCards(filter) {
      var engagementElems = [vm.activeUsers, vm.regEndpoints, vm.userPopulation];
      var qualityElems = [vm.callMetrics, vm.mediaQuality];
      if (filter === 'all') {
        if (!vm.showEngagement) {
          $('.cs-card-layout').prepend(engagementElems).masonry('prepended', engagementElems);
          vm.showEngagement = true;
        }
        if (!vm.showQuality) {
          $('.cs-card-layout').append(qualityElems).masonry('appended', qualityElems);
          vm.showQuility = true;
        }
      } else if (filter === 'engagement') {
        if (vm.showQuality === true) {
          $('.cs-card-layout').masonry('remove', qualityElems);
          vm.showQuality = false;
        }
        if (vm.showEngagement === false) {
          $('.cs-card-layout').append(engagementElems).masonry('appended', engagementElems);
          vm.showEngagement = true;
        }
      } else if (filter === 'quality') {
        if (vm.showQuality === false) {
          $('.cs-card-layout').append(qualityElems).masonry('appended', qualityElems);
          vm.showQuality = true;
        }
        if (vm.showEngagement === true) {
          $('.cs-card-layout').masonry('remove', engagementElems);
          vm.showEngagement = false;
        }
      }
      vm.resizeCards();
    }

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
      setAllDummyData();
      setTimeBasedText();

      if (vm.customerSelected.value !== 0) {
        vm.activeUsersRefresh = REFRESH;
        vm.activeUserPopulationRefresh = REFRESH;
        vm.mostActiveDescription = "";
        getActiveUserReports();

        vm.callMetricsRefresh = REFRESH;
        getCallMetricsReports();

        vm.mediaQualityRefresh = REFRESH;
        getMediaQualityReports();

        vm.endpointRefresh = REFRESH;
        getRegisteredEndpoints();
      } else {
        setAllNoData();
      }
      vm.resizeCards();
    };

    init();

    function init() {
      $timeout(function () {
        setAllDummyData();
      }, 30);

      setTimeBasedText();
      PartnerReportService.getOverallActiveUserData(vm.timeSelected);
      PartnerReportService.getCustomerList().then(function (response) {
        updateCustomerFilter(response);
        if (vm.customerSelected.value !== 0) {
          getRegisteredEndpoints();
          getMediaQualityReports();
          getActiveUserReports();
          getCallMetricsReports();
        } else {
          setAllNoData();
        }
      });
    }

    function setAllNoData() {
      vm.activeUserPopulationRefresh = EMPTY;
      vm.activeUsersRefresh = EMPTY;
      vm.mediaQualityRefresh = EMPTY;
      vm.callMetricsRefresh = EMPTY;
      vm.endpointRefresh = EMPTY;
    }

    function updateCustomerFilter(orgsData) {
      var customers = [];
      // add all customer names to the customerOptions list
      angular.forEach(orgsData, function (org) {
        customers.push({
          value: org.customerOrgId,
          label: org.customerName,
          isAllowedToManage: org.isAllowedToManage
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
          label: "",
          isAllowedToManage: false
        };
      }
      vm.resizeCards();

    }

    function setAllDummyData() {
      setActiveUserGraph(DummyReportService.dummyActiveUserData(vm.timeSelected));
      setMediaQualityGraph(DummyReportService.dummyMediaQualityData(vm.timeSelected));
      setCallMetricsGraph(DummyReportService.dummyCallMetricsData());

      vm.dummyTable = true;
      setActivePopulationGraph(DummyReportService.dummyActivePopulationData({
        label: loadingCustomer
      }, 50), 50);
      vm.registeredEndpoints = DummyReportService.dummyEndpointData({
        label: loadingCustomer
      });
    }

    function setActiveUserGraph(data) {
      if (activeUsersChart === null || activeUsersChart === undefined) {
        activeUsersChart = GraphService.createActiveUsersGraph(data);
      } else {
        GraphService.updateActiveUsersGraph(data, activeUsersChart);
      }
    }

    function setActivePopulationGraph(data, overallPopulation) {
      if (activeUserPopulationChart === null || activeUserPopulationChart === undefined) {
        activeUserPopulationChart = GraphService.createActiveUserPopulationGraph(data, overallPopulation);
      } else {
        GraphService.updateActiveUserPopulationGraph(data, activeUserPopulationChart, overallPopulation);
      }
      vm.userPopulation = document.getElementById('userPopulation');
    }

    function getActiveUserReports() {
      return PartnerReportService.getActiveUserData(vm.customerSelected, vm.timeSelected).then(function (response) {
        if (response.tableData !== ABORT && response.graphData !== ABORT) {
          setActiveUserGraph(response.graphData);
          setActivePopulationGraph(response.populationGraph, response.overallPopulation);

          vm.mostActiveUsers = [];
          if (vm.customerSelected.isAllowedToManage && angular.isDefined(response.tableData)) {
            vm.mostActiveUsers = response.tableData;
          }

          vm.displayMostActive = false;
          if (angular.isArray(vm.mostActiveUsers) && (vm.mostActiveUsers.length > 0)) {
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
          if (response.graphData.length === 0) {
            vm.activeUsersRefresh = EMPTY;
          }

          vm.mostActiveDescription = $translate.instant('activeUsers.mostActiveDescription', {
            time: vm.timeSelected.description,
            customer: vm.customerSelected.label
          });

          vm.activeUserPopulationRefresh = EMPTY;
          if (response.populationGraph.length !== 0) {
            vm.activeUserPopulationRefresh = SET;
          }
        }
        vm.activeUsers = document.getElementById('activeUser');
        return;
      });
    }

    function setMediaQualityGraph(data) {
      if (mediaQualityChart === null || mediaQualityChart === undefined) {
        mediaQualityChart = GraphService.createMediaQualityGraph(data);
      } else {
        GraphService.updateMediaQualityGraph(data, mediaQualityChart);
      }
      vm.mediaQuality = document.getElementById('mediaQuality');
    }

    function getMediaQualityReports() {
      return PartnerReportService.getMediaQualityMetrics(vm.customerSelected, vm.timeSelected).then(function (response) {
        if (response !== ABORT) {
          setMediaQualityGraph(response);

          if (response.length === 0) {
            vm.mediaQualityRefresh = EMPTY;
          } else {
            vm.mediaQualityRefresh = SET;
          }
        }
        return;
      });
    }

    function setCallMetricsGraph(data) {
      if (callMetricsDonutChart === null || callMetricsDonutChart === undefined) {
        callMetricsDonutChart = DonutChartService.createCallMetricsDonutChart(data);
      } else {
        DonutChartService.updateCallMetricsDonutChart(data, callMetricsDonutChart);
      }
      vm.callMetrics = document.getElementById('callMetrics');
    }

    function getCallMetricsReports() {
      return PartnerReportService.getCallMetricsData(vm.customerSelected, vm.timeSelected).then(function (response) {
        if (response !== ABORT) {
          setCallMetricsGraph(response);

          if (angular.isArray(response) && response.length === 0) {
            vm.callMetricsRefresh = EMPTY;
          } else {
            vm.callMetricsRefresh = SET;
          }
        }
        return;
      });
    }

    function getRegisteredEndpoints() {
      PartnerReportService.getRegisteredEndpoints(vm.customerSelected, vm.timeSelected).then(function (response) {
        if (response !== ABORT) {
          if (!angular.isArray(response) || response.length === 0) {
            vm.endpointRefresh = EMPTY;
          } else {
            vm.registeredEndpoints = response;
            vm.endpointRefresh = SET;
            vm.dummyTable = false;
          }
        }
      });
      vm.regEndpoints = document.getElementById('reg-endpoints');
    }

    function setTimeBasedText() {
      vm.endpointDescription = $translate.instant('registeredEndpoints.description', {
        time: vm.timeSelected.description
      });
      vm.trend = $translate.instant('registeredEndpoints.trend', {
        time: vm.timeSelected.label
      });
      vm.devices = $translate.instant('registeredEndpoints.maxRegisteredDevices', {
        time: vm.timeSelected.label
      });
      vm.activeUserDescription = $translate.instant('activeUsers.description', {
        time: vm.timeSelected.description
      });
      vm.callMetricsDescription = $translate.instant("callMetrics.callMetricsDesc", {
        time: vm.timeSelected.description
      });
      vm.mostActiveTitle = $translate.instant("activeUsers.mostActiveUsers", {
        time: vm.timeSelected.label
      });
    }
  }
})();
