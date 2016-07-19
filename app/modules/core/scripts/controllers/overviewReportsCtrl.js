(function () {
  'use strict';

  angular.module('Core')
    .controller('OverviewReportsCtrl', OverviewReportsCtrl);

  /* @ngInject */
  function OverviewReportsCtrl($scope, $translate, Authinfo, Notification, Log, PartnerService, ReportsService, chartColors, CommonGraphService) {
    var LINE = 'line';
    var AXIS = 'axis';
    var NUMFORMAT = 'numFormat';
    var READY = 'ready';
    var REFRESH = 'refresh';

    var entitlementsChart;
    var entId = 'entitlementsdiv';
    var entTitle = $translate.instant('reports.UsersOnboarded');
    var entitlementRefresh = 'entitlements';
    var partnerCharts = ['entitlements', 'entitlementCount'];
    var entRefreshDiv = 'entitlements-refresh';
    var cacheValue = (parseInt(moment.utc().format('H')) >= 8);
    var dummyChartVals = [];
    var orgNameMap = {};
    var customerList = [];
    var allCustomers = {
      value: 0,
      label: $translate.instant('reports.allCustomers')
    };

    $scope.entCount = 0;
    $scope.entitlementStatus = REFRESH;
    $scope.totalOrgsData = [angular.copy(allCustomers)];
    $scope.currentSelection = angular.copy(allCustomers);

    $scope.getCustomerReports = function () {
      $scope.entitlementStatus = REFRESH;
      angular.element('#' + entRefreshDiv).html('<i class=\'icon icon-spinner icon-2x\'/>');

      if ($scope.currentSelection.value === allCustomers.value) {
        ReportsService.getPartnerMetrics(cacheValue, null, [partnerCharts[0]]);
        ReportsService.getTotalPartnerCounts(cacheValue, customerList, [partnerCharts[1]]);
      } else {
        ReportsService.getPartnerMetrics(cacheValue, $scope.currentSelection.value, partnerCharts);
      }
    };
    $scope.getCustomerReports();

    function getManagedOrgs() {
      $scope.totalOrgsData = [angular.copy(allCustomers)];
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
          $scope.getCustomerReports();
        });
    }
    getManagedOrgs();

    function createDummyVals() {
      var currentDate = moment();
      for (var i = 0; i < 5; i++) {
        currentDate = currentDate.subtract(7, 'days');

        dummyChartVals.push({
          data: [{
            'date': currentDate.toISOString(),
            'count': 0
          }]
        });
      }
      dummyChartVals = formatMultipleOrgData(dummyChartVals.reverse());
    }
    createDummyVals();

    function makeChart(colors, data, showCursor) {
      var valueAxes = [CommonGraphService.getBaseVariable(AXIS)];
      valueAxes[0].integersOnly = true;
      valueAxes[0].minimum = 0;
      valueAxes[0].title = $translate.instant('reports.numberUsersAxis');

      var catAxis = CommonGraphService.getBaseVariable(AXIS);
      catAxis.gridPosition = 'start';
      catAxis.title = $translate.instant('reports.weekOf');
      catAxis.gridColor = chartColors.grayLight;
      catAxis.gridAlpha = 1;

      var graphs = [];
      graphs.push(CommonGraphService.getBaseVariable(LINE));
      graphs[0].lineColor = colors;
      graphs[0].valueField = 'count';
      graphs[0].title = entTitle;
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
        'enabled': showCursor,
        'valueLineEnabled': true,
        'valueLineBalloonEnabled': true,
        'cursorColor': chartColors.grayDarkest,
        'valueBalloonsEnabled': false,
        'cursorPosition': 'mouse'
      };

      return AmCharts.makeChart(entId, chartObject);
    }

    function formatMultipleOrgData(data) {
      var formmatedData = [];
      var dateMap = {};

      var dataId = 0;
      for (var i = 0; i < data.length; i++) {
        var obj = data[i];
        var countData = obj.data;
        var countKey = 'count';
        dataId++;

        for (var j = 0; j < countData.length; j++) {
          var date = new Date(countData[j].date);
          date = date.toUTCString().split(' ').slice(1, 4).join(' ');
          if (dateMap[date]) {
            dateMap[date][countKey] += countData[j].count;
          } else {
            dateMap[date] = [];
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

    function updateChart(data, color, shouldShowCursor) {
      var chart = makeChart(color, data, shouldShowCursor);
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
      var data = _.get(response, 'data', {});
      if (data.success && usableData(data.data)) {
        $scope.entitlementStatus = READY;

        var formattedData = null;
        if ($scope.currentSelection.value === allCustomers.value) {
          formattedData = formatMultipleOrgData(response.data.data);
        } else {
          formattedData = formatTimeChartData(response.data.data);
        }

        entitlementsChart = updateChart(formattedData, chartColors.blue, true);
      } else {
        if (!response.data.success) {
          errorMessage(entTitle, response);
        }

        angular.element('#' + entRefreshDiv).html('<h3 class="dummy-data-message">' + $translate.instant('reportsPage.noData') + '</h3>');
        entitlementsChart = updateChart(dummyChartVals, chartColors.grayLight, false);
      }
    });

    $scope.$on('entitlementCountLoaded', function (event, response) {
      if (response.data.success) {
        $scope.entCount = Math.round(response.data.data);
      } else {
        $scope.entCount = 0;
        errorMessage($translate.instant('partnerHomePage.entitlementsTitle'), response);
      }
    });
  }
})();
