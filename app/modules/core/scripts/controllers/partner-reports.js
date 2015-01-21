'use strict';

angular.module('Core')

.controller('PartnerReportsCtrl', ['$scope', '$window', 'ReportsService',
  function ($scope, $window, ReportsService) {
    var activeUsersChart, avgCallsChart, contentSharedChart, entitlementsChart, avgConvChart,
    convOneOnOneChart, convGroupChart, callsLoadedChart, callsAvgDurationChart,contentSharedSizeChart;

    var chartRefreshProperties = ['entitlements','activeUsers','avgCalls', 'avgConversations',
    'convOneOnOne','convGroup','calls', 'callsAvgDuration','contentShared','contentShareSizes'];

    var orgIdMap = {};
    var responseTime;
    var reportsCount = 0;

    $scope.counts = {};
    $scope.reportStatus = {};

    var currentDate = new Date();

    var dummyChartVals = [{
      'data':[{'date': (currentDate.setDate(currentDate.getDate() + 7)),
      'count': 0}],
      'orgId': '0'
    }, {
      'data':[{'date': (currentDate.setDate(currentDate.getDate() + 7)),
      'count': 0}],
      'orgId': '1'
    }, {
      'data':[{'date': (currentDate.setDate(currentDate.getDate() + 7)),
      'count': 0}],
      'orgId': '2'
    }, {
      'data':[{'date': (currentDate.setDate(currentDate.getDate() + 7)),
      'count': 0}],
      'orgId': '3'
    }, {
      'data':[{'date': (currentDate.setDate(currentDate.getDate() + 7)),
      'count': 0}],
      'orgId': '4'
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
      for(var property in chartRefreshProperties){
        $scope.reportStatus[property] = 'refresh';
      }
      ReportsService.getPartnerMetrics(useCache);
    };

    $scope.reloadReports(true);

    var makeChart = function (id, colors, data, title, operation) {

      if(angular.element('#'+id).length > 0){

        console.log(id + '   got it!' );
        var chartObject = {
          'type': 'serial',
          'theme': 'none',
          'fontFamily': 'CiscoSansTT Thin',
          'backgroundColor': '#ffffff',
          'backgroundAlpha': 1,
          'colors': colors,
          'dataProvider': data,
          'graphs': [],
          'titles': [
            {
              'text': title,
              'size': 30,
              'color': '#555'
            }
          ],
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
        };

        if(angular.element('#tab-reports').length > 0){
          delete chartObject.titles;
        }

        var orgCount = Object.keys(orgIdMap).length;

        for (var i = 0; i < orgCount; i++) {
          var orgName = orgIdMap['customerName' + i];
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
        var currentOrgId = obj.orgId;
        var countData = obj.data;
        var customerNameKey = 'customerName' + dataId;
        var countKey = 'count' + dataId;
        dataId++;

        if (!orgIdMap[customerNameKey]) {
          orgIdMap[customerNameKey] = currentOrgId;
        }

        for (var j = 0; j < countData.length; j++) {
          var date = new Date(countData[j].date);
          date = date.toDateString();
          date = date.substring(date.indexOf(' ') + 1);

          if (dateMap[date]) {
            dateMap[date][customerNameKey] = currentOrgId;
            dateMap[date][countKey] = countData[j].count;
          } else {
            dateMap[date] = [];
            dateMap[date][customerNameKey] = currentOrgId;
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

    var updateChart = function (data, color, id, title, operation, callback) {
      var formattedData = formatMultipleOrgData(data);
        var chart = makeChart(id, color, formattedData, title, operation);

        if (chart) {
          chart.validateData();
        }

        return chart;
    };

    var isEmpty = function(data){
      var empty = true;
      for(var obj in data){
        if(data[obj].data.length > 0){
          empty = false;
        }
      }
      return empty;
    };

    var getCharts = function (response, property, id, title, color, operation, refreshDivName) {
      if (response.data.success) {
          var data;
          if (!isEmpty(response.data.data)) {
            $scope.reportStatus[property] = 'ready';
            data = response.data.data;
          }else {
          $scope.reportStatus[property] = 'refresh';
          angular.element('#' + id).addClass('dummy-data');
          angular.element('#' + refreshDivName).html('<h3 class="dummy-data-message">No Data</h3>');
          data = dummyChartVals;
          operation = 'sum';
        }
        reportsCount++;
        console.log('reportsCount---------->' + reportsCount);
        responseTime = response.data.date;
        console.log('responseTime------>' + responseTime);
        $scope.refreshTime = responseTime;
        var chartObj = updateChart(data, color, id, title, operation);
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
      entitlementsChart = getCharts(response, 'entitlements', 'avgEntitlementsdiv','Users Onboarded', 'blue', 'sum', 'avg-entitlements-refresh');
    });

    $scope.$on('avgCallsPerUserLoaded', function (event, response) {
      avgCallsChart = getCharts(response, 'avgCalls', 'avgCallsdiv', 'Avg Calls Per User', 'red', 'average', 'avg-calls-refresh');
      console.log('avgCalls');
      console.log(avgCallsChart);
    });

    $scope.$on('avgConversationsLoaded', function (event, response) {
      avgConvChart = getCharts(response, 'avgConversations', 'avgConversationsdiv', 'Avg Rooms Per User', 'yellow', 'average', 'avg-conversations-refresh');
    });

    $scope.$on('activeUsersLoaded', function (event, response) {
      activeUsersChart = getCharts(response, 'activeUsers', 'activeUsersdiv', 'Active Users', 'green', 'sum', 'active-users-refresh');
    });

    $scope.$on('convOneOnOneLoaded', function (event, response) {
      convOneOnOneChart = getCharts(response, 'convOneOnOne', 'convOneOnOnediv', 'One On One Rooms', 'blue', 'sum', 'conv-one-on-one-refresh');
    });

    $scope.$on('convGroupLoaded', function (event, response) {
      convGroupChart = getCharts(response, 'convGroup', 'convGroupdiv', 'Group Rooms', 'red', 'sum', 'conv-group-refresh');
    });

    $scope.$on('callsLoaded', function (event, response) {
      callsLoadedChart = getCharts(response, 'calls', 'callsdiv', 'Video Calls', 'yellow', 'sum', 'calls-refresh');
    });

    $scope.$on('callsAvgDurationLoaded', function (event, response) {
      callsAvgDurationChart = getCharts(response, 'callsAvgDuration', 'callsAvgDurationdiv', 'Avg Duration of Calls', 'green', 'average', 'calls-avg-duration');
    });

    $scope.$on('contentSharedLoaded', function (event, response) {
      contentSharedChart = getCharts(response, 'contentShared', 'contentShareddiv', 'Content Shared', 'blue', 'sum', 'content-shared-refresh');
      console.log('contentShared');
      console.log(contentSharedChart);
    });

    $scope.$on('contentShareSizesLoaded', function (event, response) {
      contentSharedSizeChart = getCharts(response, 'contentShareSizes', 'contentShareSizesdiv', 'Amount of Content Shared', 'red', 'sum', 'content-share-sizes-refresh');
    });

    $scope.$on('activeUserCountLoaded', loadActiveUserCount);
    $scope.$on('averageCallCountLoaded', loadAverageCallCount);
    $scope.$on('contentSharedCountLoaded', loadContentSharedCount);
    $scope.$on('entitlementCountLoaded', loadEntitlementCount);


    $scope.resizeActiveUsersChart = function () {
      console.log(activeUsersChart);
      if (activeUsersChart) {
        console.log('resize1');
        activeUsersChart.invalidateSize();
      }
    };

    $scope.resizeAverageCallsChart = function () {
      console.log(avgCallsChart);
      if (avgCallsChart) {
        console.log('resize2');
         avgCallsChart.invalidateSize();
      }
    };

    $scope.resizeContentSharedChart = function () {
      console.log(contentSharedChart);
      if (contentSharedChart) {
        console.log('resize3');
        contentSharedChart.invalidateSize();
      }
    };
  }
]);
