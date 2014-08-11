'use strict';

/* global AmCharts, $ */

angular.module('Squared')
  .controller('HomeCtrl', ['$scope', '$timeout', 'ReportsService', 'Log', 'Auth', 'Authinfo', '$dialogs', 'Config', 'homeCache',
    function($scope, $timeout, ReportsService, Log, Auth, Authinfo, $dialogs, Config, homeCache) {

      $('#au-graph-refresh').html('<i class=\'fa fa-refresh fa-spin fa-2x\'></i>');
      $('#au-refresh').html('<i class=\'fa fa-refresh fa-spin fa-2x\'></i>');
      $('#calls-refresh').html('<i class=\'fa fa-refresh fa-spin fa-2x\'></i>');
      $('#convo-refresh').html('<i class=\'fa fa-refresh fa-spin fa-2x\'></i>');
      $('#share-refresh').html('<i class=\'fa fa-refresh fa-spin fa-2x\'></i>');

      $('#activeUsersChart').addClass('chart-border');

      $scope.statusPageUrl = Config.getStatusPageUrl();

      var chartVals = [];
      $scope.isAdmin = false;

      $scope.addToCache = function(key, value){
        homeCache.put(key, value);
      };

      $scope.readFromCache = function(key){
        return homeCache.get(key);
      };

      $scope.getCacheStats = function(){
        return homeCache.info();
      };

      $scope.manualReload = function(){
        $scope.homeRefreshTime = new Date().getTime();
        $scope.addToCache('lastHomeTime', $scope.homeRefreshTime);

        getActiveUsersCount();
        getCallMetrics();
        getConversationMetrics();
        getContentShareMetrics();
        getActiveUsersMetrics();
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

      var displayCacheValue = function(key){
          var cachedValues = $scope.readFromCache(key);

          if(cachedValues.message){
            $(cachedValues.divName).html(cachedValues.message);
            return false;
          }
         
          return true;
      };

      var loadCacheValues = function(){
         $scope.homeRefreshTime = $scope.readFromCache('lastHomeTime');

        if(displayCacheValue('activeUserCount')){
          $scope.activeUserCount = $scope.readFromCache('activeUserCount');
        }
        if(displayCacheValue('callsCount')){
          $scope.callsCount = $scope.readFromCache('callsCount');
        }
        if(displayCacheValue('convoCount')){
          $scope.convoCount = $scope.readFromCache('convoCount');
        }
        if(displayCacheValue('cShareCount')){
          $scope.cShareCount = $scope.readFromCache('cShareCount');
        }

        chartVals = $scope.readFromCache('chartCacheValues');
        
        if(chartVals){
          makeChart(chartVals);
        }

        $scope.showAUContent = true;
        $scope.showCallsContent = true;
        $scope.showConvoContent = true;
        $scope.showShareContent = true;
        $scope.showAUGraph = true;
        $scope.showAUGraphRefresh = false;

        getHealthMetrics();
       };

      var firstLoaded = function(){
        if (!sessionStorage['loadedHome'] || homeCache.info().size === 0){
          $scope.manualReload();
         sessionStorage['loadedHome'] = 'yes';
        }
        else{
            loadCacheValues();
          }
      };

      var getActiveUsersCount = function() {
        var params = {
          'intervalCount': 1,
          'intervalType': 'month'
        };
        ReportsService.getUsageMetrics('activeUserCount', params, function(data, status) {
          if (data.success) {
            if (data.length !== 0) {
              $scope.showAURefresh = false;
              $scope.showAUContent = true;
              $scope.activeUserCount = data.data;
            } else {
              $('#au-refresh').html('<span>No results available.</span>');
            }
          } else {
            Log.debug('Query active users failed. Status: ' + status);
            $('#au-refresh').html('<span>Error processing request</span>');
          }
        });
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
        $scope.addToCache('chartCacheValues', chartVals);
        return count;
      };

      var getCallMetrics = function() {
        var params = {
          'intervalCount': 1,
          'intervalType': 'month',
          'spanCount': 1,
          'spanType': 'week'
        };
        ReportsService.getUsageMetrics('calls', params, function(data, status) {
          $scope.callsCount = 0;
          $scope.addToCache('callsCount', $scope.callsCount); 
          if (data.success) {
            if (data.length !== 0) {
              var calls = data.data;
              if (calls.length > 0) {
                $scope.callsCount = getMetricData(calls, 'calls');
                $scope.addToCache('callsCount', $scope.callsCount);                
              }
              $scope.showCallsRefresh = false;
              $scope.showCallsContent = true;
            } else {
              $('#calls-refresh').html('<span>No results available.</span>');
              var resultsValues = {'divName':'#calls-refresh', 'message':'<span>No results available.</span>'};
              $scope.addToCache('callsCount', resultsValues);
            }
            makeChart(chartVals);
          } else {
            Log.debug('Query calls metrics failed. Status: ' + status);
            $('#calls-refresh').html('<span>Error processing request</span>');
            var resultsValues = {'divName':'#calls-refresh', 'message':'<span>Error processing request</span>'};
            $scope.addToCache('callsCount', resultsValues);
          }
        });
      };

      var getConversationMetrics = function() {
        var params = {
          'intervalCount': 1,
          'intervalType': 'month',
          'spanCount': 1,
          'spanType': 'week'
        };
        ReportsService.getUsageMetrics('conversations', params, function(data, status) {
          $scope.convoCount = 0;
          $scope.addToCache('convoCount', $scope.convoCount);
          if (data.success) {
            if (data.length !== 0) {
              var convos = data.data;    
              if (convos.length > 0) {
                $scope.convoCount = getMetricData(convos, 'convos');
                $scope.addToCache('convoCount', $scope.convoCount);
              }
              $scope.showConvoRefresh = false;
              $scope.showConvoContent = true;
            } else {
              $('#convo-refresh').html('<span>No results available.</span>');
              var resultsValues = {'divName':'#convo-refresh', 'message':'<span>No results available.</span>'};
              $scope.addToCache('convoCount', resultsValues);
            }
            makeChart(chartVals);
          } else {
            Log.debug('Query conversation metrics failed. Status: ' + status);
            $('#convo-refresh').html('<span>Error processing request</span>');
            var resultsValues = {'divName':'#convo-refresh', 'message':'<span>Error processing request</span>'};
            $scope.addToCache('convoCount', resultsValues);
          }
        });
      };

      var getContentShareMetrics = function() {
        var params = {
          'intervalCount': 1,
          'intervalType': 'month',
          'spanCount': 1,
          'spanType': 'week'
        };
        ReportsService.getUsageMetrics('contentShareSizes', params, function(data, status) {
          $scope.cShareCount = 0;
          $scope.addToCache('cShareCount', $scope.cShareCount);
          if (data.success) {
            if (data.length !== 0) {
              var cShares = data.data;
              if (cShares.length > 0) {
                var countVal = getMetricData(cShares, 'share');
                $scope.cShareCount = countVal.toFixed(4);
                $scope.addToCache('cShareCount', $scope.cShareCount);
              }
              $scope.showShareRefresh = false;
              $scope.showShareContent = true;
            } else {
              $('#share-refresh').html('<span>No results available.</span>');
              var resultsValues = {'divName':'#share-refresh', 'message':'<span>No results available.</span>'};
              $scope.addToCache('cShareCount', resultsValues);

            }
            makeChart(chartVals);
          } else {
            Log.debug('Query content share metrics failed. Status: ' + status);
            $('#share-refresh').html('<span>Error processing request</span>');
            var resultsValues = {'divName':'#share-refresh', 'message':'<span>Error processing request</span>'};
            $scope.addToCache('cShareCount', resultsValues);
          }
        });
      };

      var getActiveUsersMetrics = function() {
        var params = {
          'intervalCount': 1,
          'intervalType': 'month',
          'spanCount': 1,
          'spanType': 'week'
        };
        ReportsService.getUsageMetrics('activeUsers', params, function(data, status) {
          var auCount = 0;
          $scope.addToCache('activeUserCount', auCount);
          if (data.success) {
            if (data.length !== 0) {
              var aUsers = data.data;
              if (aUsers.length > 0) {
                auCount = getMetricData(aUsers, 'users');
                $scope.addToCache('activeUserCount', auCount);
              }
              makeChart(chartVals);
            } else {
              Log.debug('No results for active users metrics.');
            }
          } else {
            Log.debug('Query active users metrics failed. Status: ' + status);
          }
        });
      };

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
        firstLoaded();
        $scope.isAdmin = Auth.isUserAdmin();
      }

      $scope.$on('AuthinfoUpdated', function() {
        firstLoaded();
        $scope.isAdmin = Auth.isUserAdmin();
      });


      var chart = makeChart(chartVals);
    }
  ]);
