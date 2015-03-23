(function () {
  'use strict';

  angular
    .module('Core')
    .controller('PartnerReportCtrl', PartnerReportCtrl);

  /* @ngInject */
  function PartnerReportCtrl($scope, $translate, Config, Notification, Log, PartnerReportService) {
    var vm = this;

    // Base variables for building grids and charts
    var columnBase = {
      'type': 'column',
      'fillAlphas': 1,
      'lineAlpha': 0,
      'balloonColor': Config.chartColors.grayLight
    };
    var axis = {
      'axisColor': Config.chartColors.grayLight,
      'gridAlpha': 0,
      'axisAlpha': 1,
      'tickLength': 0,
      'color': Config.chartColors.grayDarkest
    };
    var legendBase = {
      'align': 'center',
      'marginTop': 15,
      'autoMargins': false,
      'switchable': false,
      'fontSize': 13,
      'color': Config.chartColors.grayDarkest,
      'markerLabelGap': 10
    };
    var numFormatBase = {
      'precision': 0,
      'decimalSeparator': '.',
      'thousandsSeparator': ','
    };

    // variables for the active users section
    var activeUserDiv = 'activeUsersdiv';
    var activeUserRefreshDiv = 'activeUsersRefreshDiv';
    var activeUsersBalloonText = '<span class="graph-text">' + $translate.instant('activeUsers.registeredUsers') + ' <span class="graph-number">[[totalUsers]]</span></span><br><span class="graph-text">' + $translate.instant('activeUsers.active') + ' <span class="graph-number">[[percentage]]%</span></span>';
    var noActiveUserDataDiv = '<div class="no-data-center"><h3 class="no-data">' + $translate.instant('reportsPage.noData') + '</h3></div>';
    var isActiveUsersRefreshDiv = '<div class="timechartDiv clear-graph"></div><i class="active-user-status icon icon-spinner icon-2x"></i>';
    var usersTitle = $translate.instant('activeUsers.users');
    var activeUsersTitle = $translate.instant('activeUsers.activeUsers');
    var activeUsersSort = ['userName', 'orgName', 'totalCalls', 'totalPosts'];

    vm.activeUsersRefresh = 'refresh';
    vm.showMostActiveUsers = false;
    vm.activeUserReverse = true;
    vm.activeUsersTotalPages = 0;
    vm.activeUserCurrentPage = 0;
    vm.activeUserPredicate = activeUsersSort[2];
    vm.activeButton = [1, 2, 3];
    vm.mostActiveUsers = [];
    vm.activeUsersChart = null;

    vm.recentUpdate = "";
    vm.qualityTab = 'refresh';
    vm.customerOptions = [];
    vm.customerSelected = null;

    vm.timeOptions = [{
      id: 0,
      label: $translate.instant('reportsPage.week')
    }, {
      id: 1,
      label: $translate.instant('reportsPage.month')
    }, {
      id: 2,
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
      if (vm.activeButton[2] !== vm.activeUsersTotalPages) {
        vm.activeButton[0] += 1;
        vm.activeButton[1] += 1;
        vm.activeButton[2] += 1;
      }
    };

    vm.pageBackward = function () {
      if (vm.activeButton[0] !== 1) {
        vm.activeButton[0] -= 1;
        vm.activeButton[1] -= 1;
        vm.activeButton[2] -= 1;
      }
    };

    vm.updateReports = function () {
      vm.activeUsersRefresh = 'refresh';
      var savedFilter = PartnerReportService.getPreviousFilter();
      angular.element('#' + activeUserRefreshDiv).html(isActiveUsersRefreshDiv);

      if (savedFilter !== vm.timeSelected) {
        PartnerReportService.getActiveUsersData(vm.timeSelected).then(function (response) {
          updateGraphTable(response);
        });
      } else {
        var response = PartnerReportService.getSavedActiveUsers();
        updateGraphTable(response);
      }
    };

    init();

    function init() {
      setActiveUserReports();
      setGraphResizing();
      vm.qualityTab = 'set';
    }

    function setGraphResizing() {
      angular.element('#engagementTab').on("click", function () {
        if ((vm.activeUsersChart !== null) && (vm.activeUsersRefresh !== 'empty')) {
          vm.activeUsersChart.invalidateSize();
        }
      });
    }

    function updateGraphTable(data) {
      var customerData = retrieveSelectedOrg(data);
      var graphData = customerData.graphData;

      if (graphData.length === 0) {
        vm.activeUsersChart.dataProvider = dummyData(activeUserDiv);
      } else if (vm.timeSelected.id === 0) { // added for dealing with dummy data
        var replacement = [];
        for (var i = 0; i < 7; i++) {
          replacement.push(data[data.length - 7 + i]);
        }
        data = replacement;
      } else if (vm.timeSelected.id === 1) { // added for dealing with dummy data
        var replacementTwo = [];
        for (var x = 0; x < 4; x++) {
          replacementTwo.push(graphData[Math.floor(graphData.length / 4) * x]);
        }
        vm.activeUsersChart.dataProvider = replacementTwo;
      } else if (vm.timeSelected.id === 2) { // added for dealing with dummy data
        var replacementThree = [];
        for (var y = 0; y < 3; y++) {
          replacementThree.push(graphData[Math.floor(graphData.length / 3) * y]);
        }
        vm.activeUsersChart.dataProvider = replacementThree;
      } else {
        vm.activeUsersChart.dataProvider = graphData;
      }
      vm.activeUsersChart.validateData();
      vm.mostActiveUsers = modifyActiveChart(customerData.chartData);

      if (vm.mostActiveUsers !== undefined && vm.mostActiveUsers !== null) {
        var totalUsers = vm.mostActiveUsers.length;
        vm.activeUsersTotalPages = Math.ceil(totalUsers / 5);
      } else {
        vm.activeUsersTotalPages = 0;
      }
      vm.activeUserCurrentPage = 1;
      vm.activeButton = [1, 2, 3];

      vm.recentUpdate = PartnerReportService.getMostRecentUpdate();
      vm.activeUsersChart.invalidateSize();

      if (customerData.graphData === undefined || customerData.graphData === null || customerData.graphData.length === 0) {
        angular.element('#' + activeUserRefreshDiv).html(noActiveUserDataDiv);
        vm.activeUsersRefresh = 'empty';
      } else {
        vm.activeUsersRefresh = 'set';
      }
    }

    function updateCustomerFilter(orgsData) {
      // if there are fewer than 5 orgs, then these options are unnecessary
      if (orgsData.length > 5) {
        vm.customerOptions.push({
          id: 0,
          label: $translate.instant('reportsPage.mostEngaged')
        });
        vm.customerOptions.push({
          id: 1,
          label: $translate.instant('reportsPage.leastEngaged')
        });
        vm.customerOptions.push({
          id: 2,
          label: $translate.instant('reportsPage.highQuality')
        });
        vm.customerOptions.push({
          id: 3,
          label: $translate.instant('reportsPage.leastQuality')
        });
      }

      // add all customer names to the customerOptions list
      for (var orgNum in orgsData) {
        vm.customerOptions.push({
          id: orgsData[orgNum].customerOrgId,
          label: orgsData[orgNum].customerName
        });
      }
      vm.customerSelected = vm.customerOptions[0];
    }

    function setActiveUserReports() {
      PartnerReportService.getActiveUsersData(vm.timeSelected).then(function (response) {
        updateCustomerFilter(PartnerReportService.getCustomerList());

        var customerData = retrieveSelectedOrg(response);
        vm.activeUsersChart = createGraph(customerData.graphData, activeUserDiv, [usersTitle, activeUsersTitle], activeUsersBalloonText, [Config.chartColors.brandSuccessLight, Config.chartColors.brandSuccessDark], 'serial');
        vm.mostActiveUsers = modifyActiveChart(customerData.chartData);

        if (vm.mostActiveUsers !== undefined && vm.mostActiveUsers !== null) {
          var totalUsers = vm.mostActiveUsers.length;
          vm.activeUsersTotalPages = Math.ceil(totalUsers / 5);
        } else {
          vm.activeUsersTotalPages = 0;
        }
        vm.activeUserCurrentPage = 1;
        vm.activeButton = [1, 2, 3];

        vm.recentUpdate = PartnerReportService.getMostRecentUpdate();
        vm.activeUsersChart.invalidateSize();

        if (customerData.graphData.length === 0) {
          angular.element('#' + activeUserRefreshDiv).html(noActiveUserDataDiv);
          vm.activeUsersRefresh = 'empty';
        } else {
          vm.activeUsersRefresh = 'set';
        }
      });
    }

    function modifyActiveChart(data) {
      for (var index in data) {
        if (data[index].userName === "") {
          data[index].userName = PartnerReportService.getUserName(data[index].orgId, data[index].userId);
        }
      }
      return data;
    }

    function retrieveSelectedOrg(data) {
      var option = vm.customerSelected.id;

      if (option === 0) {
        return PartnerReportService.getCombinedActiveUsers(0);
      } else if (option === 1) {
        return PartnerReportService.getCombinedActiveUsers(1);
      } else if (option === 2) {
        return PartnerReportService.getCombinedActiveUsers(2);
      } else if (option === 3) {
        return PartnerReportService.getCombinedActiveUsers(3);
      } else {
        var orgId = vm.customerSelected.label;
        for (var index in data) {
          if (data[index].orgId === orgId) {
            return data[index];
          }
        }
      }

      return {
        'graphData': [],
        'chartData': []
      };
    }

    function createGraph(data, div, title, balloonText, colors, chartType) {
      var graphs = [];
      var valueAxes = [];
      var catAxis = {};
      var legend = {};
      var numFormat = {};

      if (div === activeUserDiv) {
        var graphOne = angular.copy(columnBase);
        var graphTwo = angular.copy(columnBase);

        graphOne.title = title[0];
        graphOne.fillColors = colors[0];
        graphOne.colorField = colors[0];
        graphOne.valueField = 'totalUsers';
        graphOne.balloonText = balloonText;

        graphTwo.title = title[1];
        graphTwo.fillColors = colors[1];
        graphTwo.colorField = colors[1];
        graphTwo.valueField = 'count';
        graphTwo.balloonText = balloonText;
        graphTwo.clustered = false;

        graphs.push(graphOne);
        graphs.push(graphTwo);

        valueAxes.push(angular.copy(axis));
        catAxis = axis;
        catAxis.gridPosition = 'start';

        legend = angular.copy(legendBase);
        legend.markerType = 'square';
        legend.labelText = '[[title]]';
        legend.position = 'bottom';

        numFormat = angular.copy(numFormatBase);

        if (data.length === 0) {
          data = dummyData(div);
        } else { // added for dealing with dummy data; starting time load will always be 1 week
          var replacement = [];
          for (var i = 0; i < 7; i++) {
            replacement.push(data[data.length - 7 + i]);
          }
          data = replacement;
        }
      }

      return AmCharts.makeChart(div, {
        'type': chartType,
        'theme': 'none',
        'addClassNames': true,
        'fontFamily': 'Arial',
        'backgroundColor': Config.chartColors.brandWhite,
        'backgroundAlpha': 1,
        "dataProvider": data,
        "valueAxes": valueAxes,
        "graphs": graphs,
        'balloon': {
          'adjustBorderColor': true,
          'borderThickness': 1,
          'fillAlpha': 1,
          'fillColor': Config.chartColors.brandWhite,
          'fixedPosition': true,
          'shadowAlpha': 0
        },
        'numberFormatter': numFormat,
        'plotAreaBorderAlpha': 0,
        'plotAreaBorderColor': Config.chartColors.grayLight,
        'marginTop': 20,
        'marginRight': 20,
        'marginLeft': 10,
        'marginBottom': 10,
        'categoryField': 'date',
        'categoryAxis': catAxis,
        'legend': legend
      });
    }

    function dummyData(div) {
      var dataPoint = {
        "date": "",
        "count": 0
      };

      if (div === activeUserDiv) {
        dataPoint.totalUsers = 0;
        dataPoint.percentage = 0;
      }

      return [dataPoint];
    }
  }
})();
