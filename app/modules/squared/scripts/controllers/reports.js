'use strict';
/* global AmCharts, $:false */

angular.module('Squared')
  .controller('ReportsCtrl', ['$scope', '$parse', 'ReportsService', 'Log', 'Authinfo', 'UserListService', 'Config',
    function ($scope, $parse, ReportsService, Log, Authinfo, UserListService, Config) {

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
      $('#onboardingFunnelDiv').addClass('chart-border');

      var chartVals = [];

      var formatDates = function (dataList) {
        if (angular.isArray(dataList)) {
          for (var i = 0; i < dataList.length; i++) {
            var dateVal = new Date(dataList[i].week);
            dateVal = dateVal.toDateString();
            dataList[i].week = dateVal.substring(dateVal.indexOf(' ') + 1);
          }
        }
      };

      var currentDate = new Date();

      var dummyChartVals = [{
        'convOneOnOne': 0,
        'week': (currentDate.setDate(currentDate.getDate() + 7)),
        'convGroup': 0
      }, {
        'convGroup': 0,
        'week': (currentDate.setDate(currentDate.getDate() + 7))
      }, {
        'convGroup': 0,
        'week': (currentDate.setDate(currentDate.getDate() + 7))
      }, {
        'convGroup': 0,
        'week': (currentDate.setDate(currentDate.getDate() + 7))
      }, {
        'convGroup': 0,
        'week': (currentDate.setDate(currentDate.getDate() + 7))
      }];

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
      var onboardingFunnelLoaded = false;

      var responseTime;

      var checkAllValues = function () {
        if (entitlementsLoaded && avgCallsLoaded && avgConvLoaded && auLoaded && convOneOnOneLoaded && convGroupLoaded && callsLoaded && callsAvgDurationLoaded && contentSharedLoaded && contentShareSizesLoaded && onboardingFunnelLoaded) {
          $scope.reportsRefreshTime = responseTime;
        }
      };

      var checkDataLoaded = function (data) {
        switch (data) {
        case 'onboardingFunnel':
          onboardingFunnelLoaded = true;
          break;
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

      $scope.$on('entitlementsLoaded', function (event, response) {
        getCharts(response, 'entitlements', 'avgEntitlementsdiv', 'avg-entitlements-refresh', 'showAvgEntitlementsRefresh', 'Users Onboarded', Config.chartColors.blue, 'sum');
      });

      $scope.$on('avgCallsPerUserLoaded', function (event, response) {
        getCharts(response, 'avgCalls', 'avgCallsdiv', 'avg-calls-refresh', 'showAvgCallsRefresh', 'Avg Calls Per User', Config.chartColors.red, 'average');
      });

      $scope.$on('avgConversationsLoaded', function (event, response) {
        getCharts(response, 'avgConversations', 'avgConversationsdiv', 'avg-conversations-refresh', 'showAvgConversationsRefresh', 'Avg Rooms Per User', Config.chartColors.yellow, 'average');
      });

      $scope.$on('activeUsersLoaded', function (event, response) {
        getCharts(response, 'activeUsers', 'activeUsersdiv', 'active-users-refresh', 'showActiveUsersRefresh', 'Active Users', Config.chartColors.green, 'sum');
      });

      $scope.$on('convOneOnOneLoaded', function (event, response) {
        getCharts(response, 'convOneOnOne', 'convOneOnOnediv', 'conv-one-on-one-refresh', 'showConvOneOnOneRefresh', 'One On One Rooms', Config.chartColors.blue, 'sum');
      });

      $scope.$on('convGroupLoaded', function (event, response) {
        getCharts(response, 'convGroup', 'convGroupdiv', 'conv-group-refresh', 'showConvGroupRefresh', 'Group Rooms', Config.chartColors.red, 'sum');
      });

      $scope.$on('callsLoaded', function (event, response) {
        getCharts(response, 'calls', 'callsdiv', 'calls-refresh', 'showCallsRefresh', 'Video Calls', Config.chartColors.yellow, 'sum');
      });

      $scope.$on('callsAvgDurationLoaded', function (event, response) {
        getCharts(response, 'callsAvgDuration', 'callsAvgDurationdiv', 'calls-avg-duration-refresh', 'showCallsAvgDurationRefresh', 'Avg Duration of Calls', Config.chartColors.green, 'average');
      });

      $scope.$on('contentSharedLoaded', function (event, response) {
        getCharts(response, 'contentShared', 'contentShareddiv', 'content-shared-refresh', 'showContentSharedRefresh', 'Content Shared', Config.chartColors.blue, 'sum');
      });

      $scope.$on('contentShareSizesLoaded', function (event, response) {
        getCharts(response, 'contentShareSizes', 'contentShareSizesdiv', 'content-share-sizes-refresh', 'showContentShareSizesRefresh', 'Amount of Content Shared', Config.chartColors.red, 'sum');
      });

      $scope.$on('onboardingFunnelLoaded', function (event, response) {
        getCharts(response, 'onboardingFunnel', 'onboardingFunnelDiv', 'onboarding-funnel-refresh', 'showOnboardingFunnelRefresh', 'User Engagement', null, 'funnel');
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
        onboardingFunnelLoaded = false;

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
        $scope.showOnboardingFunnelRefresh = true;
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

      var getCharts = function (response, type, divName, refreshDivName, refreshVarName, title, color, operation) {
        var avCount = 0;
        var shouldShowCursor = true;
        $scope[refreshVarName] = false;
        checkDataLoaded(type);
        if (response.data.success) {

          responseTime = response.data.date;
          angular.element('#' + divName).removeClass('chart-border');
          var result = response.data.data;

          if (result.length > 0 && operation !== 'funnel') {
            avCount = getMetricData(result, type);
          }
          if (response.data.data.length === 0 || (response.data.data.length < 3 && operation === 'funnel')) {
            angular.element('#' + divName).addClass('dummy-data');
            angular.element('#' + refreshDivName).html('<h3 class="dummy-data-message">No Data</h3>');
            $scope[refreshVarName] = true;
            shouldShowCursor = false;
            operation = 'sum';
          }

          if (operation === 'funnel') {
            makeFunnelChart(response.data.data, divName, type, title, color, operation, shouldShowCursor);
          } else {
            makeTimeChart(chartVals, divName, type, title, color, operation, shouldShowCursor);
          }

        } else {
          $('#' + refreshDivName).html('<h3>Error processing request</h3>');
          Log.debug('Query ' + type + ' metrics failed. Status: ' + status);
        }
      };

      var capitalizeEachWord = function (str) {
        return str.replace(/\w\S*/g, function (txt) {
          return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        });
      };

      var formatData = function (data) {
        data.reverse();
        for (var idx in data) {
          data[idx].title = (data[idx].title).replace('_', ' ');
          data[idx].title = capitalizeEachWord(data[idx].title);
        }
      };

      var makeFunnelChart = function (sdata, divName, metricName, title, color, operation, shouldShowCursor) {

        formatData(sdata);

        var funnelChart = AmCharts.makeChart(divName, {
          'type': 'funnel',
          'theme': 'none',
          'fontFamily': 'CiscoSansTT Thin',
          'backgroundColor': '#ffffff',
          'backgroundAlpha': 1,
          'dataProvider': sdata,
          'colors': [Config.chartColors.yellow, '#FFA500', Config.chartColors.red],
          'titleField': 'title',
          'plotAreaBorderAlpha': 0,
          'plotAreaBorderColor': '#DDDDDD',
          'marginRight': 160,
          'marginLeft': 15,
          'labelPosition': 'right',
          'funnelAlpha': 0.9,
          'valueField': 'value',
          'startX': 0,
          'startAlpha': 0,
          'outlineThickness': 1,
          'balloonText': '[[title]]:<b>[[value]]</b>',
          'marginTop': 20,
          'marginBottom': 10,
          'graphs': [{
            'type': 'column',
            'fillAlphas': 1,
            'hidden': false,
            'lineAlpha': 0,
            'title': title,
            'valueField': metricName
          }],
          'legend': {
            'equalWidths': false,
            'autoMargins': false,
            'align': 'center',
            'periodValueText': '[[value.' + [operation] + ']]',
            'position': 'top',
            'valueWidth': 50,
            'fontSize': 30,
            'markerType': 'none',
            'spacing': 30,
            'valueAlign': 'right',
            'useMarkerColorForLabels': false,
            'useMarkerColorForValues': true,
            'marginLeft': -20,
            'marginRight': 0,
            'color': '#555'
          },
        });
      };

      var makeTimeChart = function (sdata, divName, metricName, title, color, operation, shouldShowCursor) {

        if (sdata.length === 0) {
          formatDates(dummyChartVals);
          sdata = dummyChartVals;
        }

        var homeChart = AmCharts.makeChart(divName, {
          'type': 'serial',
          'theme': 'none',
          'fontFamily': 'CiscoSansTT Thin',
          'colors': [color],
          'backgroundColor': '#ffffff',
          'backgroundAlpha': 1,
          'legend': {
            'equalWidths': false,
            'autoMargins': false,
            'periodValueText': '[[value.' + [operation] + ']]',
            'position': 'top',
            'valueWidth': 10,
            'fontSize': 30,
            'markerType': 'none',
            'spacing': 0,
            'valueAlign': 'right',
            'useMarkerColorForLabels': false,
            'useMarkerColorForValues': true,
            'marginLeft': -20,
            'marginRight': 0,
            'color': '#555'
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
            'enabled': shouldShowCursor,
            'valueLineEnabled': true,
            'valueLineBalloonEnabled': true,
            'cursorColor': '#AFB0B3',
            'valueBalloonsEnabled': false,
            'cursorPosition': 'mouse'
          },
          'numberFormatter': {
            'precision': 0,
            'decimalSeparator': '.',
            'thousandsSeparator': ','
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
