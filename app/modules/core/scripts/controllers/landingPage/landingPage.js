'use strict';

/* global AmCharts, $ */

angular.module('Core')
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
      // var chartVals = [{
      //   "calls": 74,
      //   "convos": 37,
      //   "users": 27,
      //   "share": 2.48,
      //   "week": "Mar 1"
      // }, {
      //   "calls": 50,
      //   "convos": 94,
      //   "users": 24,
      //   "share": 5.12,
      //   "week": "Mar 8"
      // }, {
      //   "calls": 64,
      //   "convos": 51,
      //   "users": 67,
      //   "share": 9.43,
      //   "week": "Mar 15"
      // }, {
      //   "calls": 46,
      //   "convos": 61,
      //   "users": 29,
      //   "share": 6.96,
      //   "week": "Mar 22"
      // }, {
      //   "calls": 48,
      //   "convos": 20,
      //   "users": 59,
      //   "share": 7.87,
      //   "week": "Mar 29"
      // }, {
      //   "calls": 65,
      //   "convos": 60,
      //   "users": 41,
      //   "share": 1.8,
      //   "week": "Jun 5"
      // }, {
      //   "calls": 64,
      //   "convos": 79,
      //   "users": 96,
      //   "share": 8.18,
      //   "week": "Jun 5"
      // }, {
      //   "calls": 78,
      //   "convos": 2,
      //   "users": 20,
      //   "share": 4.02,
      //   "week": "Jun 12"
      // }, {
      //   "calls": 2,
      //   "convos": 24,
      //   "users": 12,
      //   "share": 3.45,
      //   "week": "Jun 19"
      // }, {
      //   "calls": 50,
      //   "convos": 91,
      //   "users": 82,
      //   "share": 7.2,
      //   "week": "Jun 26"
      // }];

      $scope.isAdmin = false;
      var responseTime;

      var allValuesLoaded = function() {
        if (chartValuesLoaded && callMetricLoaded && convMetricLoaded && contentLoaded && auMetricLoaded) {
          $scope.homeRefreshTime = responseTime;
        }
      };

      $scope.manualReload = function(backendCache) {

        if (backendCache === null) {
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

      $scope.$on('activeUserCountLoaded', function(event, response) {
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

      $scope.$on('callsLoaded', function(event, response) {
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

      $scope.$on('conversationsLoaded', function(event, response) {
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

      $scope.$on('contentSharedLoaded', function(event, response) {
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

      $scope.$on('activeUsersLoaded', function(event, response) {
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
          'theme': 'none',
          'fontFamily': 'CiscoSansTT Thin',
          'colors': ['#1EA7D1', '#F46315', '#EBC31C', '#50D71D'],
          'backgroundColor': '#ffffff',
          'backgroundAlpha': 1,
          'legend': {
            'divId': 'activeUsersLegend',
            'equalWidths': false,
            'periodValueText': '[[value.sum]]',
            'position': 'top',
            'align': 'left',
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
          'graphs': [{
              'fillAlphas': 0,
              'lineAlpha': 1,
              'hidden': false,
              'title': 'Calls',
              'valueField': 'calls'
            }, {
              'fillAlphas': 0,
              'lineAlpha': 1,
              'hidden': false,
              'title': 'Conversations',
              'valueField': 'convos'
            }, {
              'fillAlphas': 0,
              'lineAlpha': 1,
              'hidden': false,
              'title': 'Content',
              'valueField': 'share'
            }
            // {
            //   'fillAlphas': 0,
            //   'hidden': false,
            //   'lineAlpha': 1,
            //   'title': 'Active Users',
            //   'valueField': 'users'
            // }
          ],
          'plotAreaBorderAlpha': 1,
          'plotAreaBorderColor': '#DDDDDD',
          'marginTop': 20,
          'marginRight': 20,
          'marginLeft': 10,
          'marginBottom': 10,
          // 'chartScrollbar': {},
          'chartCursor': {
            'valueLineEnabled': true,
            'valueLineBalloonEnabled': true,
            'cursorColor': '#AFB0B3',
            'valueBalloonsEnabled': false,
            'cursorPosition': 'mouse'
          },
          'categoryField': 'week',
          'categoryAxis': {
            'startOnAxis': true,
            'axisColor': '#DDDDDD',
            'gridAlpha': 1,
            'gridColor': '#DDDDDD',
            'color': '#999999'
          },
          'valueAxes': [{
            'stackType': 'regular',
            'axisColor': '#DDDDDD',
            'gridAlpha': 0,
            'axisAlpha': 1,
            'color': '#999999'
          }]

        });
        homeChart.addListener('changed', function(eObj) {
          console.log(eObj);
        });
      };

      $scope.manualReload(true);
      $scope.isAdmin = Auth.isUserAdmin();

      $scope.$on('AuthinfoUpdated', function() {
        $scope.manualReload(true);
        $scope.isAdmin = Auth.isUserAdmin();
      });


      var chart = makeChart(chartVals);
    }
  ]);
