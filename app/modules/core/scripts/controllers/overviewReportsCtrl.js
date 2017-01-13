(function () {
  'use strict';

  angular.module('Core')
    .controller('OverviewReportsCtrl', OverviewReportsCtrl);

  /* @ngInject */
  function OverviewReportsCtrl($scope, $translate, Authinfo, Notification, PartnerService, ReportsService, chartColors, CommonGraphService) {
    var LINE = 'line';
    var AXIS = 'axis';
    var NUMFORMAT = 'numFormat';
    var READY = 'ready';
    var REFRESH = 'refresh';
    var NO_DATA = 'no-data';

    var entId = 'entitlementsdiv';
    var entTitle = $translate.instant('reports.UsersOnboarded');
    var partnerCharts = ['entitlements'];
    var cacheValue = (parseInt(moment.utc().format('H'), 10) >= 8);
    var dummyChartVals = [];
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

      if ($scope.currentSelection.value === allCustomers.value) {
        ReportsService.getPartnerMetrics(cacheValue, null, partnerCharts);
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
          _.forEach(customerList, function (item) {
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
      graphs[0].bullet = 'round';
      graphs[0].lineColor = colors;
      graphs[0].valueField = 'count';
      graphs[0].title = entTitle;
      graphs[0].balloonText = '[[value]]';
      graphs[0].fillAlphas = 0;
      graphs[0].lineAlpha = 1;

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

      for (var i = 0; i < data.length; i++) {
        var obj = data[i];
        var countData = obj.data;
        var countKey = 'count';

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

    function errorMessage(title, response) {
      Notification.errorResponse(response, 'reports.error', {
        graph: title.toLowerCase()
      });
    }

    function sumMultipleOrgDataCount(timeChartResponse) {
      return _.sumBy(timeChartResponse.data, sumOrgDataCount);
    }

    function sumOrgDataCount(orgResponse) {
      return _.sumBy(orgResponse.data, 'count');
    }

    $scope.$on('entitlementsLoaded', function (event, response) {
      var data = _.get(response, 'data', {});
      if (data.success) {
        $scope.entitlementStatus = READY;

        var formattedData = null;
        var dataCount;
        if ($scope.currentSelection.value === allCustomers.value) {
          formattedData = formatMultipleOrgData(data.data);
          dataCount = sumMultipleOrgDataCount(data);
        } else {
          formattedData = formatTimeChartData(data.data);
          dataCount = sumOrgDataCount(data);
        }
        $scope.entCount = _.round(dataCount);

        updateChart(formattedData, chartColors.blue, true);
      } else {
        errorMessage(entTitle, response);
        $scope.entCount = 0;

      }
      if ($scope.entCount === 0) {
        $scope.entitlementStatus = NO_DATA;
        updateChart(dummyChartVals, chartColors.grayLight, false);
      }
    });
  }
})();
