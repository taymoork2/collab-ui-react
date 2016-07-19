(function () {
  'use strict';

  angular
    .module('Core')
    .controller('PartnerReportCtrl', PartnerReportCtrl);

  /* @ngInject */
  function PartnerReportCtrl($timeout, $translate, $q, PartnerReportService, GraphService, DummyReportService, Authinfo) {
    var vm = this;

    var ABORT = 'ABORT';
    var REFRESH = 'refresh';
    var SET = 'set';
    var EMPTY = 'empty';
    var initialized = false;

    // variables for the active users section
    var activeUsersSort = ['userName', 'orgName', 'numCalls', 'sparkMessages', 'totalActivity'];
    var activeUsersChart = null;
    var mediaQualityChart = null;
    var callMetricsDonutChart = null;
    var activeUserPopulationChart = null;

    vm.showEngagement = true;
    vm.showQuality = true;
    vm.allReports = 'all';
    vm.engagement = 'engagement';
    vm.quality = 'quality';
    var currentFilter = vm.allReports;

    vm.customerPlaceholder = $translate.instant('reportsPage.customerSelect');
    vm.customerSingular = $translate.instant('reportsPage.customer');
    vm.customerPlural = $translate.instant('reportsPage.customers');
    vm.customerMax = 5;
    vm.customerOptions = [];
    vm.customerSelected = [];

    vm.activeUsersRefresh = REFRESH;
    vm.mostActiveRefresh = REFRESH;
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
    vm.mediaQualityRefresh = REFRESH;

    vm.callMetricsRefresh = REFRESH;
    vm.callMetricsDescription = "";

    vm.endpointRefresh = REFRESH;
    vm.registeredEndpoints = [];
    vm.dummyTable = true;
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
    vm.showHideCards = showHideCards;

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
      delayedResize();
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
      if (!initialized) {
        return;
      }

      setAllDummyData();
      setTimeBasedText();

      if (vm.customerSelected.length > 0) {
        vm.activeUsersRefresh = REFRESH;
        vm.mostActiveRefresh = REFRESH;
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
      setTimeBasedText();
      PartnerReportService.getOverallActiveUserData(vm.timeSelected);
      PartnerReportService.getCustomerList().then(function (response) {
        setAllDummyData();
        updateCustomerFilter(response);
        if (vm.customerSelected.length > 0) {
          getRegisteredEndpoints();
          getMediaQualityReports();
          getActiveUserReports();
          getCallMetricsReports();
        } else {
          setAllDummyData();
          setAllNoData();
        }
        resizeCards();
        initialized = true;
      });
    }

    function setAllNoData() {
      vm.activeUserPopulationRefresh = EMPTY;
      vm.activeUsersRefresh = EMPTY;
      vm.mostActiveRefresh = EMPTY;
      vm.mediaQualityRefresh = EMPTY;
      vm.callMetricsRefresh = EMPTY;
      vm.endpointRefresh = EMPTY;
    }

    function resizeCards() {
      $timeout(function () {
        $('.cs-card-layout').masonry('destroy');
        $('.cs-card-layout').masonry({
          itemSelector: '.cs-card',
          columnWidth: '.cs-card',
          isResizable: true,
          percentPosition: true
        });
      }, 0);
    }

    function delayedResize() {
      // delayed resize necessary to fix any overlapping cards on smaller screens
      $timeout(function () {
        $('.cs-card-layout').masonry('layout');
      }, 500);
    }

    function showHideCards(filter) {
      if (currentFilter !== filter) {
        vm.showEngagement = false;
        vm.showQuality = false;
        if (filter === vm.allReports || filter === vm.engagement) {
          vm.showEngagement = true;
        }
        if (filter === vm.allReports || filter === vm.quality) {
          vm.showQuality = true;
        }
        resizeCards();
        delayedResize();
        currentFilter = filter;
      }
    }

    function updateCustomerFilter(orgsData) {
      var customers = [];
      // add all customer names to the customerOptions list
      customers.push({
        value: Authinfo.getOrgId(),
        label: Authinfo.getOrgName(),
        isAllowedToManage: true,
        isSelected: false
      });
      angular.forEach(orgsData, function (org) {
        customers.push({
          value: org.customerOrgId,
          label: org.customerName,
          isAllowedToManage: org.isAllowedToManage,
          isSelected: false
        });
      });

      customers = customers.sort(function (a, b) {
        return a.label.localeCompare(b.label);
      });

      angular.forEach(customers, function (item, index, array) {
        if (index < vm.customerMax) {
          item.isSelected = true;
          vm.customerSelected.push(item);
        }
      });
      vm.customerOptions = customers;

      resizeCards();
    }

    function setAllDummyData() {
      setActiveUserGraph(DummyReportService.dummyActiveUserData(vm.timeSelected));
      setMediaQualityGraph(DummyReportService.dummyMediaQualityData(vm.timeSelected));
      setCallMetricsGraph(DummyReportService.dummyCallMetricsData());

      vm.dummyTable = true;
      setActivePopulationGraph(DummyReportService.dummyActivePopulationData(vm.customerSelected), 50);
      vm.registeredEndpoints = DummyReportService.dummyEndpointData();
    }

    function setActiveUserGraph(data) {
      var tempActiveUsersChart = GraphService.getActiveUsersGraph(data, activeUsersChart);
      if (angular.isDefined(tempActiveUsersChart) && tempActiveUsersChart) {
        activeUsersChart = tempActiveUsersChart;
        resizeCards();
      }
    }

    function setActivePopulationGraph(data, overallPopulation) {
      var tempActivePopChart = GraphService.getActiveUserPopulationGraph(data, activeUserPopulationChart, overallPopulation);
      if (angular.isDefined(tempActivePopChart) && tempActivePopChart) {
        activeUserPopulationChart = tempActivePopChart;
        resizeCards();
      }
    }

    function getActiveUserReports() {
      // reset defaults
      vm.mostActiveUsers = [];
      vm.displayMostActive = false;
      vm.activeUsersTotalPages = 0;
      vm.activeUserCurrentPage = 1;
      vm.activeButton = [1, 2, 3];
      vm.activeUserPredicate = activeUsersSort[4];

      var promises = [];
      var activePromise = PartnerReportService.getActiveUserData(vm.customerSelected, vm.timeSelected).then(function (response) {
        if (response.popData !== ABORT && response.graphData !== ABORT) {
          vm.activeUsersRefresh = EMPTY;
          vm.activeUserPopulationRefresh = EMPTY;
          if (angular.isArray(response.graphData) && response.graphData.length > 0) {
            vm.activeUsersRefresh = SET;
            setActiveUserGraph(response.graphData);
            vm.displayMostActive = response.isActiveUsers;

            // only display population graph if there is data in the active user graph
            if (angular.isArray(response.popData) && response.popData.length > 0) {
              setActivePopulationGraph(response.popData, response.overallPopulation);
              vm.activeUserPopulationRefresh = SET;
            }
          }
        }
        resizeCards();
        return;
      });
      promises.push(activePromise);

      var tablePromise = PartnerReportService.getActiveTableData(vm.customerSelected, vm.timeSelected).then(function (response) {
        vm.mostActiveRefresh = EMPTY;
        if (angular.isArray(response) && (response.length > 0)) {
          vm.mostActiveUsers = response;
          var totalUsers = response.length;
          vm.activeUsersTotalPages = Math.ceil(totalUsers / 5);
          vm.mostActiveRefresh = SET;
        }
        resizeCards();
        return;
      });
      promises.push(tablePromise);

      return $q.all(promises);
    }

    function setMediaQualityGraph(data) {
      var tempMediaChart = GraphService.getMediaQualityGraph(data, mediaQualityChart);
      if (angular.isDefined(tempMediaChart) && tempMediaChart !== null) {
        mediaQualityChart = tempMediaChart;
        resizeCards();
      }
    }

    function getMediaQualityReports() {
      return PartnerReportService.getMediaQualityMetrics(vm.customerSelected, vm.timeSelected).then(function (response) {
        if (response !== ABORT) {
          setMediaQualityGraph(response);

          vm.mediaQualityRefresh = EMPTY;
          if (response.length > 0) {
            vm.mediaQualityRefresh = SET;
          }
        }
        return;
      });
    }

    function setCallMetricsGraph(data) {
      var tempMetricsChart = GraphService.getCallMetricsDonutChart(data, callMetricsDonutChart);
      if (angular.isDefined(tempMetricsChart) && tempMetricsChart !== null) {
        callMetricsDonutChart = tempMetricsChart;
        resizeCards();
      }
    }

    function getCallMetricsReports() {
      return PartnerReportService.getCallMetricsData(vm.customerSelected, vm.timeSelected).then(function (response) {
        if (response !== ABORT) {
          vm.callMetricsRefresh = EMPTY;
          if (angular.isArray(response.dataProvider) && response.dataProvider.length > 0) {
            setCallMetricsGraph(response);
            vm.callMetricsRefresh = SET;
          }
          resizeCards();
        }
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
            delayedResize();
          }
        }
      });
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
      vm.mostActiveDescription = $translate.instant('activeUsers.mostActiveDescription', {
        time: vm.timeSelected.description
      });
    }
  }
})();
