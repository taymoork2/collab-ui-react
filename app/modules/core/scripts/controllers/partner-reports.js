'use strict';

angular.module('Core')

.controller('PartnerReportsCtrl', ['$scope', 'ReportsService',
  function ($scope, ReportsService) {
    var activeUsersChart, averageCallsChart, contentSharedChart, entitlementsChart;

    $scope.counts = {};
    $scope.refreshTime;

    $scope.reportStatus = {
      entitlements: 'refresh',
      activeUsers: 'refresh',
      averageCalls: 'refresh',
      contentShared: 'refresh'
    };

    $scope.isRefresh = function (property) {
      return $scope.reportStatus[property] === 'refresh';
    };

    $scope.isEmpty = function (property) {
      return $scope.reportStatus[property] === 'empty';
    };

    $scope.hasError = function (property) {
      return $scope.reportStatus[property] === 'error';
    };

    $scope.reloadReports = function (useCache) {
      $scope.reportStatus['entitlements'] = 'refresh';
      $scope.reportStatus['activeUsers'] = 'refresh';
      $scope.reportStatus['averageCalls'] = 'refresh';
      $scope.reportStatus['contentShared'] = 'refresh';
      ReportsService.getPartnerMetrics(useCache);
    };

    ReportsService.getPartnerMetrics(true);

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
        'numberFormatter': {
          'precision': 0,
          'decimalSeparator': '.',
          'thousandsSeparator': ','
        },
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

    var makeEntitlementChart = function () {
      var chart = makeChart('entitlementsChart', ['#1EA7D1']);
      // chart.addLegend(new AmCharts.AmLegend({
      //   'equalWidths': false,
      //   'periodValueText': '[[value.sum]]',
      //   'position': 'top',
      //   'align': 'left',
      //   'valueWidth': 10,
      //   'fontSize': 30,
      //   'markerType': 'none',
      //   'spacing': 0,
      //   'valueAlign': 'right',
      //   'useMarkerColorForLabels': true,
      //   'useMarkerColorForValues': true,
      //   'marginLeft': -20,
      //   'marginRight': 0
      // }));
      return chart;
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
      formatDates(data);
      if (chart) {
        chart.dataProvider = data;
        chart.validateData();
      }
    };

    var loadDataCallback = function (chart, response, property) {
      if (response.data.success) {
        if (response.data.length !== 0) {
          $scope.refreshTime = response.data.date;
          var data = response.data.data;
          if (data.length >= 0) {
            updateChart(chart, data);
          }
          $scope.reportStatus[property] = 'ready';
        } else {
          $scope.reportStatus[property] = 'empty';
        }
      } else {
        $scope.reportStatus[property] = 'error';
      }

    };

    var buildActiveUsersChart = function () {
      if (!activeUsersChart) {
        activeUsersChart = buildChart('dailyActiveUsersChart');
      }
    };

    var buildAverageCallsChart = function () {
      if (!averageCallsChart) {
        averageCallsChart = buildChart('averageCallsChart');
      }
    };

    var buildContentSharedChart = function () {
      if (!contentSharedChart) {
        contentSharedChart = buildChart('contentSharedChart');
      }
    };

    var buildEntitlementChart = function () {
      if (!entitlementsChart) {
        entitlementsChart = makeEntitlementChart();
      }
    };

    var loadActiveUsers = function (event, response) {
      buildActiveUsersChart();
      loadDataCallback(activeUsersChart, response, 'activeUsers');
    };

    var loadAverageCalls = function (event, response) {
      buildAverageCallsChart();
      loadDataCallback(averageCallsChart, response, 'averageCalls');
    };

    var loadContentShared = function (event, response) {
      buildContentSharedChart();
      loadDataCallback(contentSharedChart, response, 'contentShared');
    };

    var loadEntitlements = function (event, response) {
      buildEntitlementChart();
      loadDataCallback(entitlementsChart, response, 'entitlements');
    };

    var loadActiveUserCount = function (event, response) {
      if (response.data.success) {
        $scope.counts.activeUsers = Math.round(response.data.data);
      }
    };

    var loadAverageCallCount = function (event, response) {
      if (response.data.success) {
        $scope.counts.averageCalls = Math.round(response.data.data);
      }
    };

    var loadContentSharedCount = function (event, response) {
      if (response.data.success) {
        $scope.counts.contentShared = Math.round(response.data.data);
      }
    };

    var loadEntitlementCount = function (event, response) {
      if (response.data.success) {
        $scope.counts.entitlements = Math.round(response.data.data);
      }
    };

    $scope.$on('activeUsersLoaded', loadActiveUsers);
    $scope.$on('avgCallsPerUserLoaded', loadAverageCalls);
    $scope.$on('contentSharedLoaded', loadContentShared);
    $scope.$on('entitlementsLoaded', loadEntitlements);
    $scope.$on('activeUserCountLoaded', loadActiveUserCount);
    $scope.$on('averageCallCountLoaded', loadAverageCallCount);
    $scope.$on('contentSharedCountLoaded', loadContentSharedCount);
    $scope.$on('entitlementCountLoaded', loadEntitlementCount);

    $scope.resizeActiveUsersChart = function () {
      if (activeUsersChart) {
        activeUsersChart.invalidateSize();
      }
    };

    $scope.resizeAverageCallsChart = function () {
      if (averageCallsChart) {
        averageCallsChart.invalidateSize();
      }
    };

    $scope.resizeContentSharedChart = function () {
      if (contentSharedChart) {
        contentSharedChart.invalidateSize();
      }
    };
  }
]);
