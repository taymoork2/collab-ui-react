'use strict';

/* global AmCharts, $ */

angular.module('wx2AdminWebClientApp')
  .controller('HomeCtrl', ['$scope', 'ReportsService', 'Log', 'Auth', 'Authinfo', 'Storage', '$location',
    function($scope, ReportsService, Log, Auth, Authinfo, Storage, $location) {

      //Populating authinfo data if empty.
      if (Authinfo.isEmpty()) {
        var token = Storage.get('accessToken');
        if (token) {
          Log.debug('Authorizing user... Populating admin data...');
          Auth.authorize(token, $scope);
        } else {
          Log.debug('No accessToken.');
        }
      } else { //Authinfo has data
        //Check if this is an allowed tab
        if(!Authinfo.isAllowedTab()){
          $location.path('/login');
        }
      }

      var searchData;
      $('#au-graph-refresh').html('<i class=\'fa fa-refresh fa-spin fa-2x\'></i>');
      $('#au-refresh').html('<i class=\'fa fa-refresh fa-spin fa-2x\'></i>');
      $('#calls-refresh').html('<i class=\'fa fa-refresh fa-spin fa-2x\'></i>');
      $('#convo-refresh').html('<i class=\'fa fa-refresh fa-spin fa-2x\'></i>');
      $('#share-refresh').html('<i class=\'fa fa-refresh fa-spin fa-2x\'></i>');

      $('#activeUsersChart').addClass('chart-border');

      $scope.showAUGraphRefresh = false;
      $scope.showAURefresh = true;
      $scope.showCallsRefresh = true;
      $scope.showConvoRefresh = true;
      $scope.showShareRefresh = true;

      $scope.showAUGraph = true;
      $scope.showAUContent = false;
      $scope.showCallsContent = false;
      $scope.showConvoContent = false;
      $scope.showShareContent = false;

      var getActiveUsersCount = function() {
        ReportsService.activeUsersCount(function(data, status) {
          if (data.success) {
            if (data.length !== 0) {
              $scope.showAURefresh = false;
              $scope.showAUContent = true;
              $scope.activeUserCount = data.count;
            } else {
              $('#au-refresh').html('<span>No results available.</span>');
            }
          } else {
            Log.debug('Query active users failed. Status: ' + status);
            $('#au-refresh').html('<span>Error processing request</span>');
          }
        });
      };

      var getCallMetrics = function() {
        ReportsService.callMetrics(function(data, status) {
          var callCount = 0;
          if (data.success) {
            if (data.length !== 0) {
              var calls = data.reportDetail;
              if (calls.length > 0) {
                for (var i = 0; i < calls.length; i++) {
                  callCount += calls[i].count;
                }
              }
              $scope.showCallsRefresh = false;
              $scope.showCallsContent = true;

              $scope.callsCount = callCount;
            } else {
              $('#calls-refresh').html('<span>No results available.</span>');
            }
          } else {
            Log.debug('Query calls metrics failed. Status: ' + status);
            $('#calls-refresh').html('<span>Error processing request</span>');
          }
        });
      };

      var getConversationMetrics = function() {
        ReportsService.conversationMetrics(function(data, status) {
          var convoCount = 0;
          if (data.success) {
            if (data.length !== 0) {
              var convos = data.reportDetail;
              if (convos.length > 0) {
                for (var i = 0; i < convos.length; i++) {
                  convoCount += convos[i].count;
                }
              }
              $scope.showConvoRefresh = false;
              $scope.showConvoContent = true;

              $scope.convoCount = convoCount;
            } else {
              $('#convo-refresh').html('<span>No results available.</span>');
            }
          } else {
            Log.debug('Query conversation metrics failed. Status: ' + status);
            $('#convo-refresh').html('<span>Error processing request</span>');
          }
        });
      };

      var getContentShareMetrics = function() {
        ReportsService.contentShareMetrics(function(data, status) {
          var cShareCount = 0;
          if (data.success) {
            if (data.length !== 0) {
              var cShares = data.reportDetail;
              if (cShares.length > 0) {
                for (var i = 0; i < cShares.length; i++) {
                  cShareCount += cShares[i].count;
                }
              }
              $scope.showShareRefresh = false;
              $scope.showShareContent = true;

              $scope.cShareCount = cShareCount;
            } else {
              $('#share-refresh').html('<span>No results available.</span>');
            }
          } else {
            Log.debug('Query content share metrics failed. Status: ' + status);
            $('#share-refresh').html('<span>Error processing request</span>');
          }
        });
      };

      //var chart = makeChart(searchData);

      //chart.colors = ['#FFCCFF', '#B8DBFF','#FFFF99', '#C2FFC2', '#3399FF', '#FF6666', '#FFB870', '#FF6600', '#FF9E01', '#FCD202', '#F8FF01', '#B0DE09', '#04D215', '#0D8ECF', '#0D52D1', '#2A0CD0', '#8A0CCF', '#CD0D74', '#754DEB', '#DDDDDD', '#999999', '#333333', '#000000', '#57032A', '#CA9726', '#990000', '#4B0C25'];

      getActiveUsersCount();
      getCallMetrics();
      getConversationMetrics();
      getContentShareMetrics();

      var makeChart = function(sdata) {
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
          'dataProvider': [{
            'year': 1994,
            'cars': 1587,
            'motorcycles': 650,
            'bicycles': 121
          }, {
            'year': 1995,
            'cars': 1567,
            'motorcycles': 683,
            'bicycles': 146
          }, {
            'year': 1996,
            'cars': 1617,
            'motorcycles': 691,
            'bicycles': 138
          }, {
            'year': 1997,
            'cars': 1630,
            'motorcycles': 642,
            'bicycles': 127
          }, {
            'year': 1998,
            'cars': 1660,
            'motorcycles': 699,
            'bicycles': 105
          }, {
            'year': 1999,
            'cars': 1683,
            'motorcycles': 721,
            'bicycles': 109
          }, {
            'year': 2000,
            'cars': 1691,
            'motorcycles': 737,
            'bicycles': 112
          }, {
            'year': 2001,
            'cars': 1298,
            'motorcycles': 680,
            'bicycles': 101
          }, {
            'year': 2002,
            'cars': 1275,
            'motorcycles': 664,
            'bicycles': 97
          }, {
            'year': 2003,
            'cars': 1246,
            'motorcycles': 648,
            'bicycles': 93
          }, {
            'year': 2004,
            'cars': 1318,
            'motorcycles': 697,
            'bicycles': 111
          }, {
            'year': 2005,
            'cars': 1213,
            'motorcycles': 633,
            'bicycles': 87
          }, {
            'year': 2006,
            'cars': 1199,
            'motorcycles': 621,
            'bicycles': 79
          }, {
            'year': 2007,
            'cars': 1110,
            'motorcycles': 210,
            'bicycles': 81
          }, {
            'year': 2008,
            'cars': 1165,
            'motorcycles': 232,
            'bicycles': 75
          }, {
            'year': 2009,
            'cars': 1145,
            'motorcycles': 219,
            'bicycles': 88
          }, {
            'year': 2010,
            'cars': 1163,
            'motorcycles': 201,
            'bicycles': 82
          }, {
            'year': 2011,
            'cars': 1180,
            'motorcycles': 285,
            'bicycles': 87
          }, {
            'year': 2012,
            'cars': 1159,
            'motorcycles': 277,
            'bicycles': 71
          }],
          'valueAxes': [{
            'stackType': 'regular',
            'gridAlpha': 0.07,
            'position': 'left',
            'title': 'Traffic incidents'
          }],
          'graphs': [{
            'fillAlphas': 0.6,
            'hidden': true,
            'lineAlpha': 0.4,
            'title': 'Cars',
            'valueField': 'cars'
          }, {
            'fillAlphas': 0.6,
            'lineAlpha': 0.4,
            'title': 'Motorcycles',
            'valueField': 'motorcycles'
          }, {
            'fillAlphas': 0.6,
            'lineAlpha': 0.4,
            'title': 'Bicycles',
            'valueField': 'bicycles'
          }],
          'plotAreaBorderAlpha': 0,
          'marginTop': 10,
          'marginLeft': 0,
          'marginBottom': 0,
          'chartScrollbar': {},
          'chartCursor': {
            'cursorAlpha': 0
          },
          'categoryField': 'year',
          'categoryAxis': {
            'startOnAxis': true,
            'axisColor': '#DADADA',
            'gridAlpha': 0.07
          },
          'exportConfig': {
            'menuTop': '10px',
            'menuRight': '10px',
            'menuItems': [{
              'icon': '/lib/3/images/export.png',
              'format': 'png'
            }]
          }
        });
      };

      var chart = makeChart();


    }
  ]);
