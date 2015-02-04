'use strict';

angular.module('Core')

.controller('PartnerReportsCtrl', ['$scope', '$window', 'Config', 'ReportsService',
  function ($scope, $window, Config, ReportsService) {
    var activeUsersChart, avgCallsChart, contentSharedChart, entitlementsChart, avgConvChart,
      convOneOnOneChart, convGroupChart, callsLoadedChart, callsAvgDurationChart, contentSharedSizeChart;

    var chartRefreshProperties = ['entitlements', 'activeUsers', 'avgCalls', 'avgConversations',
      'convOneOnOne', 'convGroup', 'calls', 'callsAvgDuration', 'contentShared', 'contentShareSizes'
    ];

    var orgNameMap = {};
    var responseTime;

    $scope.counts = {};
    $scope.reportStatus = {};

    var currentDate = new Date();

    var dummyChartVals = [{
      'data': [{
        'date': (currentDate.setDate(currentDate.getDate() + 7)),
        'count': 0
      }],
      'orgName': ''
    }, {
      'data': [{
        'date': (currentDate.setDate(currentDate.getDate() + 7)),
        'count': 0
      }],
      'orgName': ''
    }, {
      'data': [{
        'date': (currentDate.setDate(currentDate.getDate() + 7)),
        'count': 0
      }],
      'orgName': ''
    }, {
      'data': [{
        'date': (currentDate.setDate(currentDate.getDate() + 7)),
        'count': 0
      }],
      'orgName': ''
    }, {
      'data': [{
        'date': (currentDate.setDate(currentDate.getDate() + 7)),
        'count': 0
      }],
      'orgName': ''
    }];

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
      for (var property in chartRefreshProperties) {
        $scope.reportStatus[chartRefreshProperties[property]] = 'refresh';
      }
      ReportsService.getPartnerMetrics(useCache);
    };

    $scope.reloadReports(true);

    var makeChart = function (id, colors, data, title, operation, shouldShowCursor) {

      if (angular.element('#' + id).length > 0) {

        var orgCount = Object.keys(orgNameMap).length;
        var aggregatedData = [];

        if (orgCount > 5) {
          for (var i = 0; i < data.length; i++) {
            var obj = data[i];
            var date = obj['date'];
            var sum = 0;
            Object.keys(obj).forEach(function (k) {
              if (k.indexOf('count') > -1) {
                sum += obj[k];
              }
            });
            var dataSection = {};
            dataSection['date'] = date;
            dataSection['count'] = sum;
            aggregatedData.push(dataSection);
          }
          data = aggregatedData;
        }

        var chartObject = {
          'type': 'serial',
          'theme': 'none',
          'fontFamily': 'CiscoSansTT Thin',
          'colors': [colors],
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
          'dataProvider': data,
          'valueAxes': [{
            'axisColor': '#DDDDDD',
            'gridAlpha': 0,
            'axisAlpha': 1,
            'color': '#999999'
          }],
          'graphs': [],
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
          'categoryField': 'date',
          'categoryAxis': {
            'gridPosition': 'start',
            'axisColor': '#DDDDDD',
            'gridAlpha': 1,
            'gridColor': '#DDDDDD',
            'color': '#999999'
          }
        };

        if (angular.element('#tab-reports').length > 0) {
          delete chartObject.legend;
        }

        if (orgCount < 5) {
          for (var i = 0; i < orgCount; i++) {
            var orgName = orgNameMap['customerName' + i];
            chartObject['graphs'].push({
              'type': 'column',
              'fillAlphas': 1,
              'lineAlpha': 0,
              'hidden': false,
              'valueField': 'count' + i,
              'title': orgName,
              'balloonText': orgName + ': [[value]]'
            });
          }
        } else {
          chartObject['graphs'].push({
            'type': 'column',
            'fillAlphas': 1,
            'lineAlpha': 0,
            'hidden': false,
            'valueField': 'count',
            'title': title,
            'balloonText': '[[value]]',
          });
        }

        return AmCharts.makeChart(id, chartObject);
      }
    };

    var buildChart = function (id, data) {
      return makeChart(id, ['#FF5F44'], data);
    };

    var formatDates = function (dataList) {
      if (angular.isArray(dataList)) {
        for (var i = 0; i < dataList.length; i++) {
          var currentObj = dataList[i].data;
          for (var j = 0; j < currentObj.length; j++) {
            var dateVal = new Date(currentObj[j].date);
            dateVal = dateVal.toDateString();
            dataList[j].date = dateVal.substring(dateVal.indexOf(' ') + 1);
          }
        }
      }
      formatMultipleOrgData(dataList);
    };

    var formatMultipleOrgData = function (data, callback) {
      var formmatedData = [];
      var dateMap = {};

      var dataId = 0;
      for (var i = 0; i < data.length; i++) {
        var obj = data[i];
        var currentOrgName = obj.orgName;
        var countData = obj.data;
        var customerNameKey = 'customerName' + dataId;
        var countKey = 'count' + dataId;
        dataId++;

        if (!orgNameMap[customerNameKey]) {
          orgNameMap[customerNameKey] = currentOrgName;
        }

        for (var j = 0; j < countData.length; j++) {
          var date = new Date(countData[j].date);
          date = date.toDateString();
          date = date.substring(date.indexOf(' ') + 1);

          if (dateMap[date]) {
            dateMap[date][customerNameKey] = currentOrgName;
            dateMap[date][countKey] = countData[j].count;
          } else {
            dateMap[date] = [];
            dateMap[date][customerNameKey] = currentOrgName;
            dateMap[date][countKey] = countData[j].count;
          }
        }
      }

      for (var date2 in dateMap) {
        var chartSection = {
          'date': date2
        };
        var currentDateObj = dateMap[date2];
        for (var obj2 in currentDateObj) {
          chartSection[obj2] = currentDateObj[obj2];
          chartSection[obj2] = currentDateObj[obj2];
        }
        formmatedData.push(chartSection);
      }

      return formmatedData;
    };

    var updateChart = function (data, color, id, title, operation, shouldShowCursor) {
      var formattedData = formatMultipleOrgData(data);
      var chart = makeChart(id, color, formattedData, title, operation, shouldShowCursor);

      if (chart) {
        chart.validateData();
      }

      return chart;
    };

    var isEmpty = function (data) {
      var empty = true;
      for (var obj in data) {
        if (data[obj].data.length > 0) {
          empty = false;
        }
      }
      return empty;
    };

    var getCharts = function (response, property, id, title, color, operation, refreshDivName) {
      var shouldShowCursor = true;

      if (response.data.success) {
        var data;
        if (!isEmpty(response.data.data)) {
          $scope.reportStatus[property] = 'ready';
          data = response.data.data;
        } else {
          $scope.reportStatus[property] = 'refresh';
          angular.element('#' + id).addClass('dummy-data');
          angular.element('#' + refreshDivName).html('<h3 class="dummy-data-message">No Data</h3>');
          data = dummyChartVals;
          shouldShowCursor = false;
          operation = 'sum';
        }

        responseTime = response.data.date;
        $scope.refreshTime = responseTime;
        var chartObj = updateChart(data, color, id, title, operation, shouldShowCursor);
        return chartObj;
      } else {
        $scope.reportStatus[property] = 'error';
        return;
      }
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

    $scope.$on('entitlementsLoaded', function (event, response) {
      entitlementsChart = getCharts(response, 'entitlements', 'avgEntitlementsdiv', 'Users Onboarded', Config.chartColors.blue, 'sum', 'avg-entitlements-refresh');
    });

    $scope.$on('avgCallsPerUserLoaded', function (event, response) {
      avgCallsChart = getCharts(response, 'avgCalls', 'avgCallsdiv', 'Avg Calls Per User', Config.chartColors.red, 'average', 'avg-calls-refresh');
    });

    $scope.$on('avgConversationsLoaded', function (event, response) {
      avgConvChart = getCharts(response, 'avgConversations', 'avgConversationsdiv', 'Avg Rooms Per User', Config.chartColors.yellow, 'average', 'avg-conversations-refresh');
    });

    $scope.$on('activeUsersLoaded', function (event, response) {
      activeUsersChart = getCharts(response, 'activeUsers', 'activeUsersdiv', 'Active Users', Config.chartColors.green, 'sum', 'active-users-refresh');
    });

    $scope.$on('convOneOnOneLoaded', function (event, response) {
      convOneOnOneChart = getCharts(response, 'convOneOnOne', 'convOneOnOnediv', 'One On One Rooms', Config.chartColors.blue, 'sum', 'conv-one-on-one-refresh');
    });

    $scope.$on('convGroupLoaded', function (event, response) {
      convGroupChart = getCharts(response, 'convGroup', 'convGroupdiv', 'Group Rooms', Config.chartColors.red, 'sum', 'conv-group-refresh');
    });

    $scope.$on('callsLoaded', function (event, response) {
      callsLoadedChart = getCharts(response, 'calls', 'callsdiv', 'Video Calls', Config.chartColors.yellow, 'sum', 'calls-refresh');
    });

    $scope.$on('callsAvgDurationLoaded', function (event, response) {
      callsAvgDurationChart = getCharts(response, 'callsAvgDuration', 'callsAvgDurationdiv', 'Avg Duration of Calls', Config.chartColors.green, 'average', 'calls-avg-duration-refresh');
    });

    $scope.$on('contentSharedLoaded', function (event, response) {
      contentSharedChart = getCharts(response, 'contentShared', 'contentShareddiv', 'Content Shared', Config.chartColors.blue, 'sum', 'content-shared-refresh');
    });

    $scope.$on('contentShareSizesLoaded', function (event, response) {
      contentSharedSizeChart = getCharts(response, 'contentShareSizes', 'contentShareSizesdiv', 'Amount of Content Shared', Config.chartColors.red, 'sum', 'content-share-sizes-refresh');
    });

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
      if (avgCallsChart) {
        avgCallsChart.invalidateSize();
      }
    };

    $scope.resizeContentSharedChart = function () {
      if (contentSharedChart) {
        contentSharedChart.invalidateSize();
      }
    };
  }
]);
