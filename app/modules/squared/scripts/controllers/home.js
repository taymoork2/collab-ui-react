'use strict';

/* global AmCharts, $ */

angular.module('Squared')
  .controller('HomeCtrl', ['$scope', '$rootScope', '$timeout', 'ReportsService', 'Log', 'Auth', 'Authinfo', '$dialogs', 'Config',
    function($scope, $rootScope, $timeout, ReportsService, Log, Auth, Authinfo, $dialogs, Config) {

      $('#au-graph-refresh').html('<i class=\'fa fa-refresh fa-spin fa-2x\'></i>');
      $('#au-refresh').html('<i class=\'fa fa-refresh fa-spin fa-2x\'></i>');
      $('#calls-refresh').html('<i class=\'fa fa-refresh fa-spin fa-2x\'></i>');
      $('#convo-refresh').html('<i class=\'fa fa-refresh fa-spin fa-2x\'></i>');
      $('#share-refresh').html('<i class=\'fa fa-refresh fa-spin fa-2x\'></i>');

      $('#activeUsersChart').addClass('chart-border');

      $scope.statusPageUrl = Config.getStatusPageUrl();

      var chartValuesLoaded = false;
      var callMetricLoaded = false;
      var convMetricLoaded = false;
      var contentLoaded = false;
      var auMetricLoaded = false;

      var chartVals = [];
      $scope.isAdmin = false;
      var responseTime;

      var allValuesLoaded = function(){
        if(chartValuesLoaded && callMetricLoaded && convMetricLoaded && contentLoaded && auMetricLoaded){
          $scope.homeRefreshTime = responseTime;
        }
      };

      $scope.manualReload = function(backendCache){

        if(backendCache === null){
          backendCache = true;
        }

        chartValuesLoaded = false;
        callMetricLoaded = false;
        convMetricLoaded = false;
        contentLoaded = false;
        auMetricLoaded = false;

        ReportsService.getAllMetrics(backendCache);
        getHealthMetrics();

        $scope.showAUGraphRefresh = true;
        $scope.showAURefresh = true;
        $scope.showCallsRefresh = true;
        $scope.showConvoRefresh = true;
        $scope.showShareRefresh = true;

        $scope.showAUGraph = false;
        $scope.showAUContent = false;
        $scope.showCallsContent = false;
        $scope.showConvoContent = false;
        $scope.showShareContent = false;
      };

      $scope.$on('ActiveUserCountLoaded', function(event, response){
        $scope.activeUserCount = 0;
        auMetricLoaded = true;
        if (response.data.success) {
          if (response.data.length !== 0) {
            responseTime = response.data.date;
            $scope.showAURefresh = false;
            $scope.showAUContent = true;
            $scope.activeUserCount = response.data.data;
          } else {
            $('#au-refresh').html('<span>No results available.</span>');
          }
        } else {
          Log.debug('Query active users failed. Status: ' + response.status);
          $('#au-refresh').html('<span>Error processing request</span>');
        }
      });

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
        chartValuesLoaded = true;
        allValuesLoaded();
        return count;
      };

      $scope.$on('CallsLoaded', function(event, response){
        $scope.callsCount = 0;
        callMetricLoaded = true;
        allValuesLoaded();
        if (response.data.success) {
          if (response.data.length !== 0) {
            responseTime = response.data.date;
            var calls = response.data.data;
            if (calls.length >= 0) {
              $scope.callsCount = getMetricData(calls, 'calls');
            }
            $scope.showCallsRefresh = false;
            $scope.showCallsContent = true;
          } else {
            $('#calls-refresh').html('<span>No results available.</span>');
          }
          makeChart(chartVals);
        } else {
          Log.debug('Query calls metrics failed. Status: ' + response.status);
          $('#calls-refresh').html('<span>Error processing request</span>');
        }
      });

      $scope.$on('ConvLoaded', function(event, response){
        $scope.convoCount = 0;
        convMetricLoaded = true;
        allValuesLoaded();
        if (response.data.success) {
          if (response.data.length !== 0) {
            responseTime = response.data.date;
            var convos = response.data.data;
            if (convos.length >= 0) {
              $scope.convoCount = getMetricData(convos, 'convos');
            }
            $scope.showConvoRefresh = false;
            $scope.showConvoContent = true;
          } else {
            $('#convo-refresh').html('<span>No results available.</span>');
          }
          makeChart(chartVals);
        } else {
          Log.debug('Query conversation metrics failed. Status: ' + response.status);
          $('#convo-refresh').html('<span>Error processing request</span>');
        }
      });

      $scope.$on('ContentShareLoaded', function(event, response){
        $scope.cShareCount = 0;
        contentLoaded = true;
        allValuesLoaded();
        if (response.data.success) {
          if (response.data.length !== 0) {
            responseTime = response.data.date;
            var cShares = response.data.data;
            if (cShares.length >= 0) {
              var countVal = getMetricData(cShares, 'share');
              $scope.cShareCount = countVal.toFixed(4);
            }
            $scope.showShareRefresh = false;
            $scope.showShareContent = true;
          } else {
            $('#share-refresh').html('<span>No results available.</span>');
          }
          makeChart(chartVals);
        } else {
          Log.debug('Query content share metrics failed. Status: ' + response.status);
          $('#share-refresh').html('<span>Error processing request</span>');
        }
      });

      $scope.$on('ActiveUserMetricsLoaded', function(event, response){
        var auCount = 0;
        allValuesLoaded();
        if (response.data.success) {
          if (response.data.length !== 0) {
            responseTime = response.data.date;
            var aUsers = response.data.data;
            if (aUsers.length >= 0) {
              auCount = getMetricData(aUsers, 'users');
            }
            makeChart(chartVals);
          } else {
            Log.debug('No results for active users metrics.');
          }
        } else {
          Log.debug('Query active users metrics failed. Status: ' + response.status);
        }
      });

      var getHealthMetrics = function() {
        ReportsService.healthMonitor(function(data, status) {
          if (data.success) {
            $scope.healthMetrics = data.components;
          } else {
            Log.debug('Query active users metrics failed. Status: ' + status);
          }
        });
      };

      $scope.inviteUsers = function() {
        var dlg = $dialogs.create('modules/squared/views/quicksetup_dialog.html', 'quicksetupDialogCtrl');
        dlg.result.then(function() {

        });
      };

      var makeChart = function(sdata) {
        $scope.showAUGraph = true;
        $scope.showAUGraphRefresh = false;
        var homeChart = AmCharts.makeChart('activeUsersChart', {
          'type': 'serial',
          'theme': 'chalk',
          'pathToImages': 'http://www.amcharts.com/lib/3/images/',
          'colors': ['#CC0000', '#FF9900', '#009933', '#3333CC'],
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
            'title': 'Activity'
          }],
          'graphs': [{
            'fillAlphas': 0.6,
            'hidden': false,
            'lineAlpha': 0.4,
            'title': 'Active Users',
            'valueField': 'users'
          }, {
            'fillAlphas': 0.6,
            'lineAlpha': 0.4,
            'hidden': false,
            'title': 'Calls',
            'valueField': 'calls'
          }, {
            'fillAlphas': 0.6,
            'lineAlpha': 0.4,
            'hidden': false,
            'title': 'Conversations',
            'valueField': 'convos'
          }, {
            'fillAlphas': 0.6,
            'lineAlpha': 0.4,
            'hidden': false,
            'title': 'Content Share',
            'valueField': 'share'
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

      if (Auth.isAuthorized($scope)) {
        $scope.manualReload(true);
        $scope.isAdmin = Auth.isUserAdmin();
      }

      $scope.$on('AuthinfoUpdated', function() {
        $scope.manualReload(true);
        $scope.isAdmin = Auth.isUserAdmin();
      });


      var chart = makeChart(chartVals);
    }
  ]);
