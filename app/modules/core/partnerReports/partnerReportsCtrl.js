(function () {
  'use strict';

  angular
    .module('Core')
    .controller('PartnerReportCtrl', PartnerReportCtrl);

  /* @ngInject */
  function PartnerReportCtrl($rootScope, $timeout, $translate, $q, ReportService, GraphService, DummyReportService, Authinfo) {
    var vm = this;

    var ABORT = 'ABORT';
    var REFRESH = 'refresh';
    var SET = 'set';
    var EMPTY = 'empty';
    var BARCHART = 'barchart';
    var DONUT = 'donut';
    var TABLE = 'table';
    var UNDEF = 'undefined';
    var initialized = false;

    // variables for the active users section
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

    // customer filter variables
    vm.customerPlaceholder = $translate.instant('reportsPage.customerSelect');
    vm.customerSingular = $translate.instant('reportsPage.customer');
    vm.customerPlural = $translate.instant('reportsPage.customers');
    vm.customerMax = 5;
    vm.customerOptions = [];
    vm.customerSelected = [];

    // Active User Options
    vm.activeUserReportOptions = {
      animate: false,
      description: 'activeUsers.description',
      headerTitle: 'activeUsers.activeUsers',
      id: 'activeUsers',
      reportType: BARCHART,
      state: REFRESH,
      table: undefined,
      titlePopover: UNDEF
    };

    vm.activeUserSecondaryReportOptions = {
      broadcast: 'ReportCard::UpdateSecondaryReport',
      description: 'activeUsers.mostActiveDescription',
      display: false,
      state: REFRESH,
      sortOptions: [{
        option: 'userName',
        direction: false
      }, {
        option: 'orgName',
        direction: false
      }, {
        option: 'numCalls',
        direction: false
      }, {
        option: 'sparkMessages',
        direction: true
      }, {
        option: 'totalActivity',
        direction: true
      }],
      table: {
        headers: [{
          title: 'activeUsers.user',
          class: 'col-md-4 pointer'
        }, {
          title: 'activeUsers.customer',
          class: 'col-md-4 pointer'
        }, {
          title: 'activeUsers.calls',
          class: 'horizontal-center col-md-2 pointer'
        }, {
          title: 'activeUsers.sparkMessages',
          class: 'horizontal-center col-md-2 pointer'
        }],
        data: [],
        dummy: false
      },
      title: 'activeUsers.mostActiveUsers'
    };

    vm.populationReportOptions = {
      animate: false,
      description: 'activeUserPopulation.description',
      headerTitle: 'activeUserPopulation.titleByCompany',
      id: 'userPopulation',
      reportType: BARCHART,
      state: REFRESH,
      table: undefined,
      titlePopover: UNDEF
    };

    vm.mediaReportOptions = {
      animate: true,
      description: 'mediaQuality.description',
      headerTitle: 'mediaQuality.mediaQuality',
      id: 'mediaQuality',
      reportType: BARCHART,
      state: REFRESH,
      table: undefined,
      titlePopover: 'mediaQuality.packetLossDefinition'
    };

    vm.endpointReportOptions = {
      animate: true,
      description: 'registeredEndpoints.description',
      headerTitle: 'registeredEndpoints.registeredEndpoints',
      id: 'reg-endpoints',
      reportType: TABLE,
      state: REFRESH,
      table: {
        headers: [{
          title: 'registeredEndpoints.company',
          class: 'customer-data col-md-4'
        }, {
          title: 'registeredEndpoints.maxRegisteredDevices',
          class: 'horizontal-center col-md-2'
        }, {
          title: 'registeredEndpoints.trend',
          class: 'horizontal-center col-md-2'
        }, {
          title: 'registeredEndpoints.totalRegistered',
          class: 'horizontal-center col-md-2'
        }],
        data: [],
        dummy: true
      },
      titlePopover: UNDEF
    };

    vm.callMetricsReportOptions = {
      animate: false,
      description: 'callMetrics.callMetricsDesc',
      headerTitle: 'callMetrics.callMetrics',
      id: 'callMetrics',
      reportType: DONUT,
      state: REFRESH,
      table: undefined,
      titlePopover: UNDEF
    };

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

    // resizing for Most Active Users Table
    vm.resizeMostActive = function () {
      resizeCards();
      delayedResize();
    };

    vm.updateReports = function () {
      if (!initialized) {
        return;
      }

      setAllDummyData();
      if (vm.customerSelected.length > 0) {
        vm.activeUserReportOptions.state = REFRESH;
        vm.activeUserSecondaryReportOptions.state = REFRESH;
        vm.populationReportOptions.state = REFRESH;
        getActiveUserReports();

        vm.callMetricsReportOptions.state = REFRESH;
        getCallMetricsReports();

        vm.mediaReportOptions.state = REFRESH;
        getMediaQualityReports();

        vm.endpointReportOptions.state = REFRESH;
        getRegisteredEndpoints();
      } else {
        setAllNoData();
      }
      resizeCards();
    };

    init();

    function init() {
      ReportService.getOverallActiveUserData(vm.timeSelected);
      ReportService.getCustomerList().then(function (response) {
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
      vm.populationReportOptions.state = EMPTY;
      vm.activeUserReportOptions.state = EMPTY;
      vm.activeUserSecondaryReportOptions.state = EMPTY;
      vm.mediaReportOptions.state = EMPTY;
      vm.callMetricsReportOptions.state = EMPTY;
      vm.endpointReportOptions.state = EMPTY;
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
      var partnerId = Authinfo.getOrgId();
      var partnerAdded = false;
      // add all customer names to the customerOptions list
      // compensates for when partner's own org is returned by managedOrgs API
      _.forEach(orgsData, function (org) {
        customers.push({
          value: org.customerOrgId,
          label: org.customerName,
          isAllowedToManage: org.isAllowedToManage,
          isSelected: false
        });
        if (partnerId === org.customerOrgId) {
          partnerAdded = true;
        }
      });
      if (!partnerAdded) {
        customers.push({
          value: partnerId,
          label: Authinfo.getOrgName(),
          isAllowedToManage: true,
          isSelected: false
        });
      }

      customers = customers.sort(function (a, b) {
        return a.label.localeCompare(b.label);
      });

      _.forEach(customers, function (item, index) {
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

      setActivePopulationGraph(DummyReportService.dummyActivePopulationData(vm.customerSelected));
      vm.endpointReportOptions.table.dummy = true;
      vm.endpointReportOptions.table.data = DummyReportService.dummyEndpointData();
    }

    function setActiveUserGraph(data) {
      var tempActiveUsersChart = GraphService.getActiveUsersGraph(data, activeUsersChart);
      if (angular.isDefined(tempActiveUsersChart) && tempActiveUsersChart) {
        activeUsersChart = tempActiveUsersChart;
        resizeCards();
      }
    }

    function setActivePopulationGraph(data) {
      var tempActivePopChart = GraphService.getActiveUserPopulationGraph(data, activeUserPopulationChart);
      if (angular.isDefined(tempActivePopChart) && tempActivePopChart) {
        activeUserPopulationChart = tempActivePopChart;
        resizeCards();
      }
    }

    function getActiveUserReports() {
      // reset defaults
      vm.activeUserSecondaryReportOptions.table.data = [];
      vm.activeUserSecondaryReportOptions.display = false;
      $rootScope.$broadcast(vm.activeUserSecondaryReportOptions.broadcast);

      var promises = [];
      var activePromise = ReportService.getActiveUserData(vm.customerSelected, vm.timeSelected).then(function (response) {
        if (response.popData !== ABORT && response.graphData !== ABORT) {
          vm.activeUserReportOptions.state = EMPTY;
          vm.populationReportOptions.state = EMPTY;
          if (angular.isArray(response.graphData) && response.graphData.length > 0) {
            vm.activeUserReportOptions.state = SET;
            setActiveUserGraph(response.graphData);
            vm.activeUserSecondaryReportOptions.display = response.isActiveUsers;

            // only display population graph if there is data in the active user graph
            if (angular.isArray(response.popData) && response.popData.length > 0 && response.isActiveUsers) {
              setActivePopulationGraph(response.popData);
              vm.populationReportOptions.state = SET;
            }
          }
        }
        resizeCards();
        return;
      });
      promises.push(activePromise);

      var tablePromise = ReportService.getActiveTableData(vm.customerSelected, vm.timeSelected).then(function (response) {
        vm.activeUserSecondaryReportOptions.state = EMPTY;
        if (angular.isArray(response) && (response.length > 0)) {
          vm.activeUserSecondaryReportOptions.table.data = response;
          vm.activeUserSecondaryReportOptions.state = SET;
          $rootScope.$broadcast(vm.activeUserSecondaryReportOptions.broadcast);
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
      return ReportService.getMediaQualityMetrics(vm.customerSelected, vm.timeSelected).then(function (response) {
        if (response !== ABORT) {
          setMediaQualityGraph(response);

          vm.mediaReportOptions.state = EMPTY;
          if (response.length > 0) {
            vm.mediaReportOptions.state = SET;
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
      return ReportService.getCallMetricsData(vm.customerSelected, vm.timeSelected).then(function (response) {
        if (response !== ABORT) {
          vm.callMetricsReportOptions.state = EMPTY;
          if (angular.isArray(response.dataProvider) && response.dataProvider.length > 0) {
            setCallMetricsGraph(response);
            vm.callMetricsReportOptions.state = SET;
          }
          resizeCards();
        }
      });
    }

    function getRegisteredEndpoints() {
      ReportService.getRegisteredEndpoints(vm.customerSelected, vm.timeSelected).then(function (response) {
        if (response !== ABORT) {
          if (!angular.isArray(response) || response.length === 0) {
            vm.endpointReportOptions.state = EMPTY;
          } else {
            vm.endpointReportOptions.table.dummy = false;
            vm.endpointReportOptions.table.data = response;
            vm.endpointReportOptions.state = SET;
            resizeCards();
            delayedResize();
          }
        }
      });
    }
  }
})();
