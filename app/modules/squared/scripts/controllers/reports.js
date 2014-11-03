'use strict';
/* global AmCharts, $:false */

angular.module('Squared')
  .controller('ReportsCtrl', ['$scope', '$parse', 'ReportsService', 'Log', 'Authinfo',
    function ($scope, $parse, ReportsService, Log, Authinfo) {

      $('#avgEntitlementsdiv').addClass('chart-border');
      $('#avgCallsdiv').addClass('chart-border');
      $('#avgConversationsdiv').addClass('chart-border');
      $('#activeUsersdiv').addClass('chart-border');
      $('#convOneOnOnediv').addClass('chart-border');
      $('#convGroupdiv').addClass('chart-border');
      $('#callsdiv').addClass('chart-border');
      $('#callsAvgDurationdiv').addClass('chart-border');
      $('#contentShareddiv').addClass('chart-border');
      $('#contentShareSizesdiv').addClass('chart-border');

      var chartVals = [];

      var entitlementsLoaded = false;
      var avgCallsLoaded = false;
      var avgConvLoaded = false;
      var auLoaded = false;
      var convOneOnOneLoaded = false;
      var convGroupLoaded = false;
      var callsLoaded = false;
      var callsAvgDurationLoaded = false;
      var contentSharedLoaded = false;
      var contentShareSizesLoaded = false;

      var responseTime;

      var checkAllValues = function () {
        if (entitlementsLoaded && avgCallsLoaded && avgConvLoaded && auLoaded && convOneOnOneLoaded && convGroupLoaded && callsLoaded && callsAvgDurationLoaded && contentSharedLoaded && contentShareSizesLoaded) {
          $scope.reportsRefreshTime = responseTime;
        }
      };

      var checkDataLoaded = function (data) {
        switch (data) {
        case 'entitlements':
          entitlementsLoaded = true;
          break;
        case 'avgCalls':
          avgCallsLoaded = true;
          break;
        case 'avgConversations':
          avgConvLoaded = true;
          break;
        case 'activeUsers':
          auLoaded = true;
          break;
        case 'convOneOnOne':
          convOneOnOneLoaded = true;
          break;
        case 'convGroup':
          convGroupLoaded = true;
          break;
        case 'calls':
          callsLoaded = true;
          break;
        case 'callsAvgDuration':
          callsAvgDurationLoaded = true;
          break;
        case 'contentShared':
          contentSharedLoaded = true;
          break;
        case 'contentShareSizes':
          contentShareSizesLoaded = true;
          break;
        }
        checkAllValues();
      };

      var blue = '#1EA7D1';
      var red = '#F46315';
      var yellow = '#EBC31C';
      var green = '#50D71D';

      $scope.$on('entitlementsLoaded', function (event, response) {
        getTimeCharts(response, 'entitlements', 'avgEntitlementsdiv', 'avg-entitlements-refresh', 'showAvgEntitlementsRefresh', 'Entitlements', blue, 'sum');
      });

      $scope.$on('avgCallsPerUserLoaded', function (event, response) {
        getTimeCharts(response, 'avgCalls', 'avgCallsdiv', 'avg-calls-refresh', 'showAvgCallsRefresh', 'Avg Calls Per User', red, 'average');
      });

      $scope.$on('avgConversationsLoaded', function (event, response) {
        getTimeCharts(response, 'avgConversations', 'avgConversationsdiv', 'avg-conversations-refresh', 'showAvgConversationsRefresh', 'Avg Conversations Per User', yellow, 'average');
      });

      $scope.$on('activeUsersLoaded', function (event, response) {
        getTimeCharts(response, 'activeUsers', 'activeUsersdiv', 'active-users-refresh', 'showActiveUsersRefresh', 'Active Users', green, 'sum');
      });

      $scope.$on('convOneOnOneLoaded', function (event, response) {
        getTimeCharts(response, 'convOneOnOne', 'convOneOnOnediv', 'conv-one-on-one-refresh', 'showConvOneOnOneRefresh', 'One On One Conversations', blue, 'sum');
      });

      $scope.$on('convGroupLoaded', function (event, response) {
        getTimeCharts(response, 'convGroup', 'convGroupdiv', 'conv-group-refresh', 'showConvGroupRefresh', 'Group Conversations', red, 'sum');
      });

      $scope.$on('callsLoaded', function (event, response) {
        getTimeCharts(response, 'calls', 'callsdiv', 'calls-refresh', 'showCallsRefresh', 'Video Calls', yellow, 'sum');
      });

      $scope.$on('callsAvgDurationLoaded', function (event, response) {
        getTimeCharts(response, 'callsAvgDuration', 'callsAvgDurationdiv', 'calls-avg-duration-refresh', 'showCallsAvgDurationRefresh', 'Avg Duration of Calls', green, 'average');
      });

      $scope.$on('contentSharedLoaded', function (event, response) {
        getTimeCharts(response, 'contentShared', 'contentShareddiv', 'content-shared-refresh', 'showContentSharedRefresh', 'Content Shared', blue, 'sum');
      });

      $scope.$on('contentShareSizesLoaded', function (event, response) {
        getTimeCharts(response, 'contentShareSizes', 'contentShareSizesdiv', 'content-share-sizes-refresh', 'showContentShareSizesRefresh', 'Amount of Content Shared', red, 'sum');
      });

      $scope.manualReload = function (backendCache) {

        if (backendCache === null) {
          backendCache = true;
        }

        entitlementsLoaded = false;
        avgCallsLoaded = false;
        avgConvLoaded = false;
        auLoaded = false;
        convOneOnOneLoaded = false;
        convGroupLoaded = false;
        callsLoaded = false;
        callsAvgDurationLoaded = false;
        contentSharedLoaded = false;
        contentShareSizesLoaded = false;

        if (Authinfo.isPartner()) {
          ReportsService.getPartnerMetrics(backendCache);
        } else {
          ReportsService.getAllMetrics(backendCache);
        }

        $scope.showAvgEntitlementsRefresh = true;
        $scope.showAvgCallsRefresh = true;
        $scope.showAvgConversationsRefresh = true;
        $scope.showActiveUsersRefresh = true;
        $scope.showConvOneOnOneRefresh = true;
        $scope.showConvGroupRefresh = true;
        $scope.showCallsRefresh = true;
        $scope.showCallsAvgDurationRefresh = true;
        $scope.showContentSharedRefresh = true;
        $scope.showContentShareSizesRefresh = true;
      };

      var getMetricData = function (dataList, metric) {
        var count = 0;
        for (var i = 0; i < dataList.length; i++) {
          var val = {};
          if (chartVals[i]) {
            val = chartVals[i];
          }

          val[metric] = dataList[i].count;
          var dateVal = new Date(dataList[i].date);
          dateVal = dateVal.toDateString();
          val.week = dateVal.substring(dateVal.indexOf(' ') + 1);
          chartVals[i] = val;
          count += dataList[i].count;
        }
        return count;
      };

      var getTimeCharts = function (response, type, divName, refreshDivName, refreshVarName, title, color, operation) {
        var avCount = 0;
        checkDataLoaded(type);
        if (response.data.success) {
          if (response.data.data.length !== 0) {
            responseTime = response.data.date;
            $('#' + divName).removeClass('chart-border');
            var result = response.data.data;
            if (result.length > 0) {
              avCount = getMetricData(result, type);
            }
            makeTimeChart(chartVals, divName, type, title, color, operation);
            $scope[refreshVarName] = false;

          } else {
            $('#' + refreshDivName).html('<h3>No results available.</h3>');
            Log.debug('No results for ' + type + ' metrics.');
          }
        } else {
          $('#' + refreshDivName).html('<h3>Error processing request</h3>');
          Log.debug('Query ' + type + ' metrics failed. Status: ' + status);
        }
      };

      var makeTimeChart = function (sdata, divName, metricName, title, color, operation) {
        var homeChart = AmCharts.makeChart(divName, {
          'type': 'serial',
          'theme': 'none',
          'fontFamily': 'CiscoSansTT Thin',
          'colors': [color],
          'backgroundColor': '#ffffff',
          'backgroundAlpha': 1,
          'legend': {
            'equalWidths': false,
            'periodValueText': '[[value.' + [operation] + ']]',
            'precision': 2,
            'position': 'top',
            'valueWidth': 10,
            'fontSize': 30,
            'markerType': 'none',
            'spacing': 0,
            'valueAlign': 'right',
            'useMarkerColorForLabels': true,
            'useMarkerColorForValues': true,
            'marginLeft': -20,
            'marginRight': 0
          },
          'dataProvider': sdata,
          'valueAxes': [{
            'axisColor': '#DDDDDD',
            'gridAlpha': 0,
            'axisAlpha': 1,
            'color': '#999999'
          }],
          'graphs': [{
            'type': 'column',
            'fillAlphas': 1,
            'hidden': false,
            'lineAlpha': 0,
            'title': title,
            'valueField': metricName
          }],
          'chartCursor': {
            'valueLineEnabled': true,
            'valueLineBalloonEnabled': true,
            'cursorColor': '#AFB0B3',
            'valueBalloonsEnabled': false,
            'cursorPosition': 'mouse'
          },
          'plotAreaBorderAlpha': 0,
          'plotAreaBorderColor': '#DDDDDD',
          'marginTop': 20,
          'marginRight': 20,
          'marginLeft': 10,
          'marginBottom': 10,
          'categoryField': 'week',
          'categoryAxis': {
            'gridPosition': 'start',
            'axisColor': '#DDDDDD',
            'gridAlpha': 1,
            'gridColor': '#DDDDDD',
            'color': '#999999'
          }
        });
      };

      $scope.manualReload(true);

      $scope.$on('AuthinfoUpdated', function () {
        $scope.manualReload(true);
      });
    }
  ]);
