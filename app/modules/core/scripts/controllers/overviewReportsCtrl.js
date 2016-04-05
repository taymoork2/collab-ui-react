(function () {
  'use strict';

  angular.module('Core')
    .controller('OverviewReportsCtrl', OverviewReportsCtrl);

  /* @ngInject */
  function OverviewReportsCtrl($scope, $translate, Authinfo, Notification, Log, PartnerService, ReportsService, CannedDataService, chartColors, CommonGraphService) {
    var LINE = 'line';
    var AXIS = 'axis';
    var NUMFORMAT = 'numFormat';
    var REFRESH = 'refresh';
    var READY = 'ready';

    var activeUsersChart, avgCallsChart, entitlementsChart, contentSharedChart;
    var chartRefreshProperties = ['entitlements', 'avgCalls', 'activeUsers', 'contentShared'];
    var partnerCharts = ['entitlements', 'activeUsers', 'avgCallsPerUser', 'contentShared', 'activeUserCount', 'averageCallCount', 'entitlementCount', 'contentSharedCount'];
    var refreshDivs = ['avg-entitlements-refresh', 'calls-refresh', 'active-users-refresh', 'content-shared-refresh'];
    var weekOf = $translate.instant('reports.weekOf');
    var cacheValue = (parseInt(moment.utc().format('H')) >= 8);
    var dummyChartVals = [];
    var orgNameMap = {};

    $scope.counts = {};
    $scope.reportStatus = {};

    var allCustomers = {
      value: 0,
      label: $translate.instant('reports.allCustomers')
    };
    $scope.totalOrgsData = [angular.copy(allCustomers)];
    $scope.currentSelection = angular.copy(allCustomers);

    $scope.getCustomerReports = function () {
      for (var property in chartRefreshProperties) {
        $scope.reportStatus[chartRefreshProperties[property]] = REFRESH;
      }

      angular.forEach(refreshDivs, function (name) {
        angular.element('#' + name).html('<i class=\'icon icon-spinner icon-2x\'/>');
      });

      if (!CannedDataService.isDemoAccount(Authinfo.getOrgId())) {
        if ($scope.currentSelection.value === allCustomers.value) {
          ReportsService.getPartnerMetrics(cacheValue, null, partnerCharts);
        } else {
          ReportsService.getPartnerMetrics(cacheValue, $scope.currentSelection.value, partnerCharts);
        }
      } else {
        if ($scope.currentSelection.value === allCustomers.value) {
          CannedDataService.getAllCustomersData();
        } else {
          CannedDataService.getIndCustomerData($scope.currentSelection.value);
        }
      }
    };
    $scope.getCustomerReports();

    $scope.isRefresh = function (property) {
      return $scope.reportStatus[property] === REFRESH;
    };

    $scope.reloadReports = function () {
      $scope.currentSelection = angular.copy(allCustomers);
      $scope.getCustomerReports();
    };

    function getManagedOrgs() {
      $scope.totalOrgsData = [angular.copy(allCustomers)];
      var customerList = [];
      PartnerService.getManagedOrgsList()
        .then(function (reponse) {
          customerList = _.map(_.get(reponse, 'data.organizations'), function (org) {
            return {
              value: org.customerOrgId,
              label: org.customerName,
            };
          });
          customerList.push({
            value: Authinfo.getOrgId(),
            label: Authinfo.getOrgName()
          });
          customerList.sort(function (a, b) {
            var org1 = a.label;
            var org2 = b.label;
            return org1.localeCompare(org2);
          });
          angular.forEach(customerList, function (item) {
            $scope.totalOrgsData.push(item);
          });
        });
    }
    getManagedOrgs();

    function createDummyVals() {
      var currentDate = moment();
      for (var i = 0; i < 5; i++) {
        currentDate = currentDate.subtract(7, 'days');
        var isoDate = currentDate.toISOString();
        var dummyObj = {
          data: [{
            'date': isoDate,
            'count': ''
          }],
          orgName: ''
        };

        dummyChartVals.push(dummyObj);
      }
      dummyChartVals = dummyChartVals.reverse();
    }
    createDummyVals();

    function makeChart(id, colors, data, title, yAxisTitle, shouldShowCursor) {
      if (angular.element('#' + id).length > 0) {
        if ($scope.currentSelection.value === allCustomers.value) {
          var orgCount = Object.keys(orgNameMap).length;
          var aggregatedData = [];
          for (var i = 0; i < data.length; i++) {
            var obj = data[i];
            var date = obj.date;
            var sum = 0;
            Object.keys(obj).forEach(function (k) {
              if (k.indexOf('count') > -1) {
                sum += obj[k];
              }
            });
            var dataSection = {};
            dataSection.date = date;
            dataSection.count = sum;
            aggregatedData.push(dataSection);
          }
          data = aggregatedData;
        }

        var valueAxes = [CommonGraphService.getBaseVariable(AXIS)];
        valueAxes[0].integersOnly = true;
        valueAxes[0].minimum = 0;
        valueAxes[0].title = yAxisTitle;

        var catAxis = CommonGraphService.getBaseVariable(AXIS);
        catAxis.gridPosition = 'start';
        catAxis.title = weekOf;
        catAxis.gridColor = chartColors.grayLight;
        catAxis.gridAlpha = 1;

        var graphs = [];
        graphs.push(CommonGraphService.getBaseVariable(LINE));
        graphs[0].lineColor = colors;
        graphs[0].valueField = 'count';
        graphs[0].title = title;
        graphs[0].balloonText = '[[value]]';

        var chartObject = CommonGraphService.getBaseSerialGraph(data, 0, valueAxes, graphs, 'date', catAxis);
        chartObject.marginTop = 20;
        chartObject.marginLeft = 70;
        chartObject.marginRight = 20;
        chartObject.marginBottom = 55;
        chartObject.export = undefined;
        chartObject.colors = [colors];
        chartObject.plotAreaBorderAlpha = 0;
        chartObject.plotAreaBorderColor = chartColors.grayDarkest;
        chartObject.balloon.borderThickness = 2;
        chartObject.balloon.fillAlpha = 0.8;
        chartObject.numberFormatter = CommonGraphService.getBaseVariable(NUMFORMAT);
        chartObject.chartCursor = {
          'enabled': shouldShowCursor,
          'valueLineEnabled': true,
          'valueLineBalloonEnabled': true,
          'cursorColor': '#666',
          'valueBalloonsEnabled': false,
          'cursorPosition': 'mouse'
        };

        return AmCharts.makeChart(id, chartObject);
      }
    }

    function formatMultipleOrgData(data) {
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
          date = date.toUTCString().split(' ').slice(1, 4).join(' ');
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
    }

    function formatTimeChartData(data) {
      for (var obj in data) {
        var date = new Date(data[obj].date);
        data[obj].date = date.toUTCString().split(' ').slice(1, 4).join(' ');
      }
      return data;
    }

    function updateChart(data, color, id, title, yAxisTitle, shouldShowCursor) {
      var formattedData = null;
      if ($scope.currentSelection.value === allCustomers.value) {
        formattedData = formatMultipleOrgData(data);
      } else {
        formattedData = formatTimeChartData(data);
      }

      var chart = makeChart(id, color, formattedData, title, yAxisTitle, shouldShowCursor);

      if (chart) {
        chart.validateData();
      }
      return chart;
    }

    function usableData(data) {
      var returnVar = false;
      if (angular.isArray(data) && !angular.isArray(data[0].data) && data.length > 0) {
        angular.forEach(data, function (item) {
          if (item.count > 0) {
            returnVar = true;
          }
        });
      } else if (angular.isArray(data) && angular.isArray(data[0].data)) {
        angular.forEach(data, function (org) {
          var usableOrg = usableData(org.data);
          if (usableOrg) {
            returnVar = true;
          }
        });
      }

      return returnVar;
    }

    function getCharts(response, property, id, title, yAxisTitle, refreshDivName) {
      var chartObj;
      if (response.data.success && usableData(response.data.data)) {
        $scope.reportStatus[property] = READY;
        chartObj = updateChart(response.data.data, chartColors.blue, id, title, yAxisTitle, true);
      } else {
        if (!response.data.success) {
          errorMessage(title, response);
        }

        $scope.reportStatus[property] = REFRESH;
        angular.element('#' + id).addClass('dummy-data');
        angular.element('#' + refreshDivName).html('<h3 class="dummy-data-message">' + $translate.instant('reportsPage.noData') + '</h3>');

        chartObj = updateChart(dummyChartVals, chartColors.grayLight, id, title, yAxisTitle, false);
      }

      $scope.refreshTime = response.data.date;
      return chartObj;
    }

    function errorMessage(title, error) {
      var errorMessage = $translate.instant('reports.error', {
        graph: title.toLowerCase()
      });
      Log.debug(errorMessage + ' Status: ' + error.status);

      if ((error.data !== null) && angular.isDefined(error.data) && angular.isDefined(error.data.trackingId) && (error.data.trackingId !== null)) {
        errorMessage += '<br>' + $translate.instant('reportsPage.trackingId') + error.data.trackingId;
      }
      Notification.notify(errorMessage, error);
    }

    $scope.$on('entitlementsLoaded', function (event, response) {
      entitlementsChart = getCharts(response, chartRefreshProperties[0], 'avgEntitlementsdiv', $translate.instant('reports.UsersOnboarded'), $translate.instant('reports.numberUsersAxis'), refreshDivs[0]);
    });

    $scope.$on('avgCallsPerUserLoaded', function (event, response) {
      avgCallsChart = getCharts(response, chartRefreshProperties[1], 'avgCallsdiv', $translate.instant('reports.AvgCallsPerUser'), $translate.instant('reports.numberCallsAxis'), refreshDivs[1]);
    });

    $scope.$on('activeUsersLoaded', function (event, response) {
      activeUsersChart = getCharts(response, chartRefreshProperties[2], 'activeUsersdiv', $translate.instant('reports.ActiveUsers'), $translate.instant('reports.numberActiveAxis'), refreshDivs[2]);
    });

    $scope.$on('contentSharedLoaded', function (event, response) {
      contentSharedChart = getCharts(response, chartRefreshProperties[3], 'contentShareddiv', $translate.instant('reports.ContentShared'), $translate.instant('reports.filesSharedAxis'), refreshDivs[3]);
    });

    $scope.$on('activeUserCountLoaded', function (event, response) {
      if (response.data.success) {
        $scope.counts.activeUsers = Math.round(response.data.data);
      } else {
        $scope.counts.activeUsers = 0;
        errorMessage($translate.instant('partnerHomePage.activeUsersTitle'), response);
      }
    });

    $scope.$on('averageCallCountLoaded', function (event, response) {
      if (response.data.success) {
        $scope.counts.averageCalls = Math.round(response.data.data);
      } else {
        $scope.counts.averageCalls = 0;
        errorMessage($translate.instant('partnerHomePage.averageCallsTitle'), response);
      }
    });

    $scope.$on('contentSharedCountLoaded', function (event, response) {
      if (response.data.success) {
        $scope.counts.contentShared = Math.round(response.data.data);
      } else {
        $scope.counts.contentShared = 0;
        errorMessage($translate.instant('partnerHomePage.contentSharedTitle'), response);
      }
    });

    $scope.$on('entitlementCountLoaded', function (event, response) {
      if (response.data.success) {
        $scope.counts.entitlements = Math.round(response.data.data);
      } else {
        $scope.counts.entitlements = 0;
        errorMessage($translate.instant('partnerHomePage.entitlementsTitle'), response);
      }
    });
  }
})();
