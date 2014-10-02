'use strict';
/* global AmCharts, $:false */

angular.module('Squared')
  .controller('ReportsCtrl', ['$scope', '$parse', 'ReportsService', 'Log',
    function($scope, $parse, ReportsService, Log) {

      $('#avgEntitlementsdiv').addClass('chart-border');
      $('#avgCallsdiv').addClass('chart-border');
      $('#avgConversationsdiv').addClass('chart-border');
      $('#activeUsersdiv').addClass('chart-border');

      var chartVals = [];

      var entitlementsLoaded = false;
      var avgCallsLoaded = false;
      var avgConvLoaded = false;
      var auLoaded = false;

      var responseTime;

      var checkAllValues = function() {
        if (entitlementsLoaded && avgCallsLoaded && avgConvLoaded && auLoaded) {
          $scope.reportsRefreshTime = responseTime;
        }
      };

      var checkDataLoaded = function(data) {
        if (data === 'entitlements') {
          entitlementsLoaded = true;
          checkAllValues();
        }
        if (data === 'avgCalls') {
          avgCallsLoaded = true;
          checkAllValues();
        }
        if (data === 'avgConversations') {
          avgConvLoaded = true;
          checkAllValues();
        }
        if (data === 'activeUsers') {
          auLoaded = true;
          checkAllValues();
        }
      };

      $scope.$on('EntitlementsLoaded', function(event, response){
        getTimeCharts(response, 'entitlements', 'avgEntitlementsdiv', 'avg-entitlements-refresh', 'showAvgEntitlementsRefresh', 'Entitlements', '#3333CC');
      });

      $scope.$on('AvgCallsLoaded', function(event, response){
        getTimeCharts(response, 'avgCalls', 'avgCallsdiv', 'avg-calls-refresh', 'showAvgCallsRefresh', 'Calls', '#FF9900');
      });

      $scope.$on('AvgConversationsLoaded', function(event, response){
        getTimeCharts(response, 'avgConversations', 'avgConversationsdiv', 'avg-conversations-refresh', 'showAvgConversationsRefresh', 'Conversations', '#009933');
      });

      $scope.$on('AvgConversationsLoaded', function(event, response){
        getTimeCharts(response, 'activeUsers','activeUsersdiv', 'active-users-refresh', 'showActiveUsersRefresh', 'Active Users', '#CC0000');
      });

      $scope.manualReload = function(backendCache) {

        if(backendCache === null){
          backendCache = true;
        }

        entitlementsLoaded = false;
        avgCallsLoaded = false;
        avgConvLoaded = false;
        auLoaded = false;

        ReportsService.getAllMetrics(backendCache);

        $('#avg-entitlements-refresh').html('<i class=\'fa fa-refresh fa-spin fa-2x\'></i>');
        $('#avg-calls-refresh').html('<i class=\'fa fa-refresh fa-spin fa-2x\'></i>');
        $('#avg-conversations-refresh').html('<i class=\'fa fa-refresh fa-spin fa-2x\'></i>');
        $('#active-users-refresh').html('<i class=\'fa fa-refresh fa-spin fa-2x\'></i>');

        $scope.showAvgEntitlementsRefresh = true;
        $scope.showAvgCallsRefresh = true;
        $scope.showAvgConversationsRefresh = true;
        $scope.showActiveUsersRefresh = true;
      };

      var getMetricData = function(dataList, metric) {
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

      var getTimeCharts = function(response, type, divName, refreshDivName, refreshVarName, title, color) {
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
              makeTimeChart(chartVals, divName, type, title, color);
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

      var makeTimeChart = function(sdata, divName, metricName, title, color) {
        var homeChart = AmCharts.makeChart(divName, {
          'type': 'serial',
          'theme': 'chalk',
          'pathToImages': 'http://www.amcharts.com/lib/3/images/',
          'colors': [color],
          'legend': {
            'equalWidths': false,
            'periodValueText': 'total: [[value.sum]]',
            'position': 'top',
            'valueAlign': 'left',
            'valueWidth': 100
          },
          'dataProvider': sdata,
          'valueAxes': [{
            'stackType': 'regular',
            'gridAlpha': 0.07,
            'position': 'left',
            'title': title
          }],
          'graphs': [{
            'fillAlphas': 0.6,
            'hidden': false,
            'lineAlpha': 0.4,
            'title': title,
            'valueField': metricName
          }],
          'plotAreaBorderAlpha': 0,
          'marginTop': 10,
          'marginLeft': 0,
          'marginBottom': 0,
          'chartScrollbar': {},
          'chartCursor': {
            'cursorAlpha': 0
          },
          'categoryField': 'week',
          'categoryAxis': {
            'startOnAxis': true,
            'axisColor': '#DADADA',
            'gridAlpha': 0.07
          }
        });
      };

      $scope.manualReload(true);

      $scope.$on('AuthinfoUpdated', function() {
        $scope.manualReload(true);
      });
    }
  ]);
