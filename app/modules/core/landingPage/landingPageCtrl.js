'use strict';

/* global AmCharts, moment */

angular.module('Core')
  .controller('LandingPageCtrl', ['$scope', '$rootScope', '$timeout', 'ReportsService', 'Log', 'Auth', 'Authinfo', '$dialogs', 'Config', '$translate', 'CannedDataService', '$state',
    function ($scope, $rootScope, $timeout, ReportsService, Log, Auth, Authinfo, $dialogs, Config, $translate, CannedDataService, $state) {

      $scope.isAdmin = false;
      var callsChart, conversationsChart, contentSharedChart;

      $scope.counts = {};
      $scope.refreshTime = null;
      $scope.statusPageUrl = Config.getStatusPageUrl();

      $scope.reportStatus = {
        calls: 'refresh',
        conversations: 'refresh',
        contentShared: 'refresh'
      };

      $scope.currentDate = moment().subtract(1, 'months').format('LL');
      var weekOf = $translate.instant('reports.weekOf');

      var todaysDate = new Date();
      var dummyChartVals = [{
        'date': todaysDate.setDate(todaysDate.getDate() + 1)
      }, {
        'date': todaysDate.setDate(todaysDate.getDate() + 1)
      }, {
        'date': todaysDate.setDate(todaysDate.getDate() + 1)
      }, {
        'date': todaysDate.setDate(todaysDate.getDate() + 1)
      }, {
        'date': todaysDate.setDate(todaysDate.getDate() + 1)
      }];

      $scope.isRefresh = function (property) {
        return $scope.reportStatus[property] === 'refresh';
      };

      $scope.reloadReports = function (useCache) {
        $scope.reportStatus.calls = 'refresh';
        $scope.reportStatus.conversations = 'refresh';
        $scope.reportStatus.contentShared = 'refresh';
        if (CannedDataService.isDemoAccount(Authinfo.getOrgId())) {
          CannedDataService.getCustomerCounts();
          CannedDataService.getIndCustomerData();
        } else {
          ReportsService.getLandingMetrics(useCache);
        }
      };

      $scope.reloadReports(true);

      $scope.openFirstTimeSetupWiz = function () {
        $state.go('firsttimewizard');
      };

      $scope.setupNotDone = function () {
        if (!Authinfo.isSetupDone() && Authinfo.isCustomerAdmin()) {
          return true;
        }
        return false;
      };

      var makeChart = function (id, colors) {
        return AmCharts.makeChart(id, {
          'type': 'serial',
          'theme': 'none',
          'fontFamily': 'CiscoSansTT Thin',
          'colors': Config.chartColors.blue,
          'graphs': [{
            'type': 'line',
            'bullet': 'round',
            'lineColor': Config.chartColors.blue,
            'fillAlphas': 0,
            'lineAlpha': 1,
            'lineThickness': 3,
            'hidden': false,
            'valueField': 'count',
          }],
          'plotAreaBorderAlpha': 1,
          'plotAreaBorderColor': '#DDDDDD',
          'marginTop': 10,
          'marginLeft': 0,
          'marginBottom': 0,
          'categoryField': 'date',
          'categoryAxis': {
            'gridPosition': 'start',
            'axisColor': '#DDDDDD',
            'gridAlpha': 1,
            'gridColor': '#DDDDDD',
            'color': '#999999',
            'title': weekOf,
            'titleColor': '#999999'
          },
          'numberFormatter': {
            'precision': 0,
            'decimalSeparator': '.',
            'thousandsSeparator': ','
          },
          'valueAxes': [{
            'axisColor': '#DDDDDD',
            'gridAlpha': 0,
            'axisAlpha': 1,
            'color': '#999999'
          }]
        });
      };

      var buildChart = function (id) {
        return makeChart(id, ['#FF5F44']);
      };

      var formatDates = function (dataList) {
        if (angular.isArray(dataList)) {
          for (var i = 0; i < dataList.length; i++) {
            var dateVal = new Date(dataList[i].date);
            dateVal = dateVal.toDateString();
            dataList[i].date = dateVal.substring(dateVal.indexOf(' ') + 1);
          }
        }
      };

      var updateChart = function (chart, data) {
        if (chart) {
          if (data.length === 0) {
            formatDates(dummyChartVals);
            chart.dataProvider = dummyChartVals;
          } else {
            formatDates(data);
            chart.dataProvider = data;
          }
          chart.validateData();
        }
      };

      var loadDataCallback = function (chart, response, property, refreshDivName) {
        if (response.data.success) {
          $scope.refreshTime = response.data.date;
          var data = response.data.data;
          updateChart(chart, data);

          if (response.data.data.length === 0) {
            $scope.reportStatus[property] = 'refresh';
            angular.element('#' + refreshDivName).addClass('dummy-data');
            angular.element('#' + refreshDivName).html('<h3 class="dummy-data-message">No Data</h3>');
          } else {
            $scope.reportStatus[property] = 'ready';
            angular.element('#' + refreshDivName).html('');
          }
        } else {
          $scope.reportStatus[property] = 'refresh';
          angular.element('#' + refreshDivName).addClass('dummy-data');
          angular.element('#' + refreshDivName).html('<h3 class="dummy-data-message">Error processing request.</h3>');
        }
      };

      var buildCallsChart = function () {
        if (!callsChart) {
          callsChart = buildChart('callsChart');
        }
      };

      var buildConversationsChart = function () {
        if (!conversationsChart) {
          conversationsChart = buildChart('conversationsChart');
        }
      };

      var buildContentSharedChart = function () {
        if (!contentSharedChart) {
          contentSharedChart = buildChart('contentSharedChart');
        }
      };

      var loadCalls = function (event, response) {
        buildCallsChart();
        loadDataCallback(callsChart, response, 'calls', 'callsRefreshDiv');
      };

      var loadConversations = function (event, response) {
        buildConversationsChart();
        loadDataCallback(conversationsChart, response, 'conversations', 'convRefreshDiv');
      };

      var loadContentShared = function (event, response) {
        buildContentSharedChart();
        loadDataCallback(contentSharedChart, response, 'contentShared', 'contentRefreshDiv');
      };

      var loadCallsCount = function (event, response) {
        if (response.data.success) {
          $scope.counts.calls = Math.round(response.data.data);
        }
      };

      var loadConversationsCount = function (event, response) {
        if (response.data.success) {
          $scope.counts.conversations = Math.round(response.data.data);
        }
      };

      var loadContentSharedCount = function (event, response) {
        if (response.data.success) {
          $scope.counts.contentShared = Math.round(response.data.data);
        }
      };

      $scope.$on('callsLoaded', loadCalls);
      $scope.$on('conversationsLoaded', loadConversations);
      $scope.$on('contentSharedLoaded', loadContentShared);
      $scope.$on('callsCountLoaded', loadCallsCount);
      $scope.$on('conversationsCountLoaded', loadConversationsCount);
      $scope.$on('contentSharedCountLoaded', loadContentSharedCount);

      $scope.resizeCallsChart = function () {
        if (callsChart) {
          callsChart.invalidateSize();
        }
      };

      $scope.resizeConversationsChart = function () {
        if (conversationsChart) {
          conversationsChart.invalidateSize();
        }
      };

      $scope.resizeContentSharedChart = function () {
        if (contentSharedChart) {
          contentSharedChart.invalidateSize();
        }
      };

      var getHealthMetrics = function () {
        ReportsService.healthMonitor(function (data, status) {
          if (data.success) {
            $scope.healthMetrics = data.components;
            $scope.isCollapsed = true;
          } else {
            Log.debug('Query active users metrics failed. Status: ' + status);
          }
        });
      };

      $scope.inviteUsers = function () {
        var dlg = $dialogs.create('modules/squared/views/quicksetup_dialog.html', 'quicksetupDialogCtrl');
        dlg.result.then(function () {

        });
      };

      $scope.isAdmin = Auth.isUserAdmin();
      getHealthMetrics();

      $scope.$on('AuthinfoUpdated', function () {
        $scope.isAdmin = Auth.isUserAdmin();
      });

      $scope.getTrialProgress = function (obj) {
        if (obj.termRemaining <= 5) {
          return 'danger';
        } else if (obj.termRemaining < (obj.termMax / 2)) {
          return 'warning';
        } else {
          return 'success';
        }
      };

      $scope.getLicenseProgress = function (obj) {
        var remaining = obj.total - obj.used;
        if (remaining <= 5) {
          return 'danger';
        } else if (obj.used > (obj.total / 2)) {
          return 'warning';
        } else {
          return 'success';
        }
      };

      $scope.getUnusedLicense = function (obj) {
        var remaining = obj.total - obj.used;
        if (remaining >= 0) {
          return remaining + ' ' + $translate.instant('customerPage.unused');
        } else {
          return Math.abs(remaining) + ' ' + $translate.instant('customerPage.overPlan');
        }
      };

    }
  ]);
