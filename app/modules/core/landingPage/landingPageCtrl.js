'use strict';

/* global AmCharts, $ */

angular.module('Core')
  .controller('LandingPageCtrl', ['$scope', '$rootScope', '$timeout', 'ReportsService', 'Log', 'Auth', 'Authinfo', '$dialogs', 'Config', '$translate',
    function ($scope, $rootScope, $timeout, ReportsService, Log, Auth, Authinfo, $dialogs, Config, $translate) {

      $scope.isAdmin = false;
      var responseTime;
      var callsChart, conversationsChart, contentSharedChart;

      $scope.counts = {};
      $scope.refreshTime = null;

      $scope.statusPageUrl = Config.getStatusPageUrl();

      $scope.reportStatus = {
        calls: 'refresh',
        conversations: 'refresh',
        contentShared: 'refresh'
      };

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
        $scope.reportStatus['calls'] = 'refresh';
        $scope.reportStatus['conversations'] = 'refresh';
        $scope.reportStatus['contentShared'] = 'refresh';
        ReportsService.getAllMetrics(useCache);
      };

      ReportsService.getAllMetrics(true);

      var makeChart = function (id, colors) {
        return AmCharts.makeChart(id, {
          'type': 'serial',
          'theme': 'none',
          'fontFamily': 'CiscoSansTT Thin',
          'colors': colors,
          'graphs': [{
            'type': 'column',
            'fillAlphas': 1,
            'lineAlpha': 0,
            'hidden': false,
            'valueField': 'count',
            'ballooonText': '[[value]]'
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
            'color': '#999999'
          },
          'valueAxes': [{
            'axisColor': '#DDDDDD',
            'gridAlpha': 0,
            'axisAlpha': 1,
            'color': '#999999'
          }]
        });
      };

      var buildChart = function (id, data) {
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
            // $scope.healthMetricsSections = [{
            //   "name": "Network",
            //   "status": "operational",
            //   "healthMetrics": [{
            //     "status": "operational",
            //     "name": "External Networks",
            //     "created_at": "2014-07-24T17:41:24.922Z",
            //     "updated_at": "2014-09-15T16:37:13.469Z",
            //     "position": 3,
            //     "description": "External network events which may impact Squared users",
            //     "group_id": null,
            //     "id": "j54d6vsjp6m2",
            //     "page_id": "hxh0qmnx70tn"
            //   }]
            // }, {
            //   "name": "Services",
            //   "status": "no",
            //   "healthMetrics": [{
            //     "status": "operational",
            //     "name": "Administration Portal",
            //     "created_at": "2014-07-24T17:41:24.922Z",
            //     "updated_at": "2014-09-15T16:37:13.469Z",
            //     "position": 1,
            //     "description": null,
            //     "group_id": null,
            //     "id": "kdy73b0dwzr0",
            //     "page_id": "hxh0qmnx70tn"
            //   }, {
            //     "status": "operational",
            //     "name": "Conversations",
            //     "created_at": "2014-07-24T17:41:24.922Z",
            //     "updated_at": "2014-09-15T16:37:13.469Z",
            //     "position": 2,
            //     "description": null,
            //     "group_id": null,
            //     "id": "2p7k5h7wc114",
            //     "page_id": "hxh0qmnx70tn"
            //   }, {
            //     "status": "no",
            //     "name": "Media / Calling",
            //     "created_at": "2014-07-24T17:41:24.922Z",
            //     "updated_at": "2014-09-15T16:37:13.469Z",
            //     "position": 3,
            //     "description": null,
            //     "group_id": null,
            //     "id": "q8qzmmqhhjwp",
            //     "page_id": "hxh0qmnx70tn"
            //   }, {
            //     "status": "operational",
            //     "name": "Mobile Clients",
            //     "created_at": "2014-07-24T17:41:24.922Z",
            //     "updated_at": "2014-09-15T16:37:13.469Z",
            //     "position": 4,
            //     "description": "iOS and Android clients",
            //     "group_id": null,
            //     "id": "kdsghl9qr3nn",
            //     "page_id": "hxh0qmnx70tn"
            //   }, {
            //     "status": "operational",
            //     "name": "Profile Pictures",
            //     "created_at": "2014-07-24T17:41:24.922Z",
            //     "updated_at": "2014-09-15T16:37:13.469Z",
            //     "position": 5,
            //     "description": null,
            //     "group_id": null,
            //     "id": "4b2vkf1c7yqs",
            //     "page_id": "hxh0qmnx70tn"
            //   }, {
            //     "status": "operational",
            //     "name": "Web and Desktop Clients",
            //     "created_at": "2014-07-24T17:41:24.922Z",
            //     "updated_at": "2014-09-15T16:37:13.469Z",
            //     "position": 6,
            //     "description": null,
            //     "group_id": null,
            //     "id": "028z71zrzf6b",
            //     "page_id": "hxh0qmnx70tn"
            //   }]
            // }];

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
