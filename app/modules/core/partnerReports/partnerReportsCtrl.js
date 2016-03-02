(function () {
  'use strict';

  angular
    .module('Core')
    .controller('PartnerReportCtrl', PartnerReportCtrl);

  /* @ngInject */
  function PartnerReportCtrl($scope, $timeout, $translate, $q, PartnerReportService, GraphService, DonutChartService, DummyReportService, Authinfo) {
    var vm = this;

    var ABORT = 'ABORT';
    var REFRESH = 'refresh';
    var SET = 'set';
    var EMPTY = 'empty';
    var loadingCustomer = $translate.instant('activeUserPopulation.loadingCustomer');

    // variables for the active users section
    var activeUserRefreshDiv = 'activeUsersRefreshDiv';
    var activeUsersSort = ['userName', 'orgName', 'numCalls', 'sparkMessages', 'totalActivity'];
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
    vm.activeUserPredicate = activeUsersSort[4];
    vm.activeButton = [1, 2, 3];
    vm.mostActiveUsers = [];
    vm.mostActiveTitle = "";
    vm.displayMostActive = false;
    vm.showMostActiveUsers = false;
    vm.activeUserDescription = "";
    vm.mostActiveDescription = "";
    vm.mediaQualityPopover = $translate.instant('mediaQuality.packetLossDefinition');

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

    vm.showHideCards = showHideCards;
    var activeUsers = null;
    var regEndpoints = null;
    var userPopulation = null;
    var callMetrics = null;
    var mediaQuality = null;

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

    // Graph data status checks
    vm.isRefresh = function (tab) {
      return tab === REFRESH;
    };

    vm.isEmpty = function (tab) {
      return tab === EMPTY;
    };

    // Controls for Most Active Users Table
    vm.openCloseMostActive = function () {
      vm.showMostActiveUsers = !vm.showMostActiveUsers;
      resizeCards();
    };

    vm.activePage = function (num) {
      return vm.activeUserCurrentPage === Math.ceil((num + 1) / 5);
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

    vm.changePage = function (num) {
      if ((num > 1) && (num < vm.activeUsersTotalPages)) {
        vm.activeButton[0] = (num - 1);
        vm.activeButton[1] = num;
        vm.activeButton[2] = (num + 1);
      }
      vm.activeUserCurrentPage = num;
      resizeCards();
    };

    vm.pageForward = function () {
      if (vm.activeUserCurrentPage < vm.activeUsersTotalPages) {
        vm.changePage(vm.activeUserCurrentPage + 1);
      }
    };

    vm.pageBackward = function () {
      if (vm.activeUserCurrentPage > 1) {
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
      resizeCards();
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
        resizeCards();
      });
    }

    function setAllNoData() {
      vm.activeUserPopulationRefresh = EMPTY;
      vm.activeUsersRefresh = EMPTY;
      vm.mediaQualityRefresh = EMPTY;
      vm.callMetricsRefresh = EMPTY;
      vm.endpointRefresh = EMPTY;
    }

    function resizeCards() {
      setTimeout(function () {
        $('.cs-card-layout').masonry('layout');
      }, 300);
    }

    function showHideCards(filter) {
      var engagementElems = [activeUsers, regEndpoints, userPopulation];
      var qualityElems = [callMetrics, mediaQuality];
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
      resizeCards();
    }

    function updateCustomerFilter(orgsData) {
      var customers = [];
      // add all customer names to the customerOptions list
      customers.push({
        value: Authinfo.getOrgId(),
        label: Authinfo.getOrgName(),
        isAllowedToManage: true
      });
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

      vm.customerSelected = vm.customerOptions[0];
      resizeCards();
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
      userPopulation = document.getElementById('userPopulation');
    }

    function getActiveUserReports() {
      return PartnerReportService.getActiveUserData(vm.customerSelected, vm.timeSelected).then(function (response) {
        if (response.tableData !== ABORT && response.graphData !== ABORT) {
          vm.mostActiveUsers = [];
          vm.displayMostActive = false;
          vm.activeUsersTotalPages = 0;
          vm.activeUserCurrentPage = 1;
          vm.activeButton = [1, 2, 3];
          vm.activeUserPredicate = activeUsersSort[4];
          if (angular.isArray(response.tableData) && (response.tableData.length > 0)) {
            vm.mostActiveUsers = response.tableData;
            vm.displayMostActive = true;
            var totalUsers = vm.mostActiveUsers.length;
            vm.activeUsersTotalPages = Math.ceil(totalUsers / 5);
          }

          vm.mostActiveDescription = $translate.instant('activeUsers.mostActiveDescription', {
            time: vm.timeSelected.description,
            customer: vm.customerSelected.label
          });

          vm.activeUsersRefresh = EMPTY;
          vm.activeUserPopulationRefresh = EMPTY;
          if (response.graphData.length > 0) {
            vm.activeUsersRefresh = SET;
            setActiveUserGraph(response.graphData);
            if (response.populationGraph.length > 0) {
              setActivePopulationGraph(response.populationGraph, response.overallPopulation);
              vm.activeUserPopulationRefresh = SET;
              resizeCards();
            }
          }
        }
        activeUsers = document.getElementById('activeUser');
        resizeCards();
        return;
      });
    }

    function setMediaQualityGraph(data) {
      if (mediaQualityChart === null || mediaQualityChart === undefined) {
        mediaQualityChart = GraphService.createMediaQualityGraph(data);
      } else {
        GraphService.updateMediaQualityGraph(data, mediaQualityChart);
      }
      mediaQuality = document.getElementById('mediaQuality');
    }

    function getMediaQualityReports() {
      return PartnerReportService.getMediaQualityMetrics(vm.customerSelected, vm.timeSelected).then(function (response) {
        if (response !== ABORT) {
          setMediaQualityGraph(response);

          if (response.length === 0) {
            vm.mediaQualityRefresh = EMPTY;
          } else {
            vm.mediaQualityRefresh = SET;
            resizeCards();
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
      callMetrics = document.getElementById('callMetrics');
    }

    function getCallMetricsReports() {
      return PartnerReportService.getCallMetricsData(vm.customerSelected, vm.timeSelected).then(function (response) {
        if (response !== ABORT) {
          setCallMetricsGraph(response);

          if (angular.isArray(response) && response.length === 0) {
            vm.callMetricsRefresh = EMPTY;
          } else {
            vm.callMetricsRefresh = SET;
            resizeCards();
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
            resizeCards();
          }
        }
      });
      regEndpoints = document.getElementById('reg-endpoints');
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
