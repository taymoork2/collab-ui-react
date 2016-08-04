(function () {
  'use strict';

  angular.module('Core')
    .service('DummyReportService', DummyReportService);

  /* @ngInject */
  function DummyReportService($translate, chartColors) {
    var dayFormat = "MMM DD";
    var monthFormat = "MMMM";
    var loadingCustomer = $translate.instant('activeUserPopulation.loadingCustomer');

    return {
      dummyActiveUserData: dummyActiveUserData,
      dummyActivePopulationData: dummyActivePopulationData,
      dummyMediaQualityData: dummyMediaQualityData,
      dummyCallMetricsData: dummyCallMetricsData,
      dummyEndpointData: dummyEndpointData
    };

    function dummyActiveUserData(time) {
      var dummyGraph = [];
      var abs = 0;

      if (time.value === 0) {
        for (var i = 7; i >= 1; i--) {
          abs = 7 - i;
          dummyGraph.push({
            modifiedDate: moment().subtract(i, 'day').format(dayFormat),
            totalRegisteredUsers: 25 + (25 * abs),
            activeUsers: 25 * abs,
            percentage: Math.round(((25 * abs) / (25 + (25 * abs))) * 100),
            colorOne: chartColors.dummyGrayLight,
            colorTwo: chartColors.dummyGray,
            balloon: false
          });
        }
      } else if (time.value === 1) {
        for (var x = 3; x >= 0; x--) {
          abs = 3 - x;
          dummyGraph.push({
            modifiedDate: moment().startOf('week').subtract(1 + (x * 7), 'day').format(dayFormat),
            totalRegisteredUsers: 25 + (25 * abs),
            activeUsers: 25 * abs,
            percentage: Math.round(((25 * abs) / (25 + (25 * abs))) * 100),
            colorOne: chartColors.dummyGrayLight,
            colorTwo: chartColors.dummyGray,
            balloon: false
          });
        }
      } else {
        for (var y = 2; y >= 0; y--) {
          abs = 2 - y;
          dummyGraph.push({
            modifiedDate: moment().subtract(y, 'month').format(monthFormat),
            totalRegisteredUsers: 25 + (25 * abs),
            activeUsers: 25 * abs,
            percentage: Math.round(((25 * abs) / (25 + (25 * abs))) * 100),
            colorOne: chartColors.dummyGrayLight,
            colorTwo: chartColors.dummyGray,
            balloon: false
          });
        }
      }

      return dummyGraph;
    }

    function dummyActivePopulationData(customers) {
      if (angular.isArray(customers) && customers.length > 0) {
        var returnArray = [];

        angular.forEach(customers, function (item, index, array) {
          returnArray.push({
            customerName: loadingCustomer,
            percentage: 85 - (index * 10),
            colorOne: chartColors.dummyGrayLight,
            colorTwo: chartColors.dummyGray,
            balloon: false,
            labelColorField: chartColors.grayLight
          });
        });

        return returnArray;
      } else {
        return [{
          customerName: loadingCustomer,
          percentage: 85,
          colorOne: chartColors.dummyGrayLight,
          colorTwo: chartColors.dummyGray,
          balloon: false,
          labelColorField: chartColors.grayLight
        }];
      }
    }

    function dummyMediaQualityData(time) {
      var dummyGraph = [];
      var abs = 0;

      if (time.value === 0) {
        for (var i = 7; i >= 1; i--) {
          abs = 7 - i;
          dummyGraph.push({
            modifiedDate: moment().subtract(i + 1, 'day').format(dayFormat),
            totalDurationSum: (25 + (15 * abs)) + (15 + (10 * abs)) + (5 + (5 * abs)),
            goodQualityDurationSum: 25 + (15 * abs),
            fairQualityDurationSum: 15 + (10 * abs),
            poorQualityDurationSum: 5 + (5 * abs),
            colorOne: chartColors.dummyGray,
            colorTwo: chartColors.dummyGrayLight,
            colorThree: chartColors.dummyGrayLighter,
            balloon: false
          });
        }
      } else if (time.value === 1) {
        for (var x = 3; x >= 0; x--) {
          abs = 3 - x;
          dummyGraph.push({
            modifiedDate: moment().startOf('week').subtract(1 + (x * 7), 'day').format(dayFormat),
            totalDurationSum: (25 + (15 * abs)) + (15 + (10 * abs)) + (5 + (5 * abs)),
            goodQualityDurationSum: 25 + (15 * abs),
            fairQualityDurationSum: 15 + (10 * abs),
            poorQualityDurationSum: 5 + (5 * abs),
            colorOne: chartColors.dummyGray,
            colorTwo: chartColors.dummyGrayLight,
            colorThree: chartColors.dummyGrayLighter,
            balloon: false
          });
        }
      } else {
        for (var y = 2; y >= 0; y--) {
          abs = 2 - y;
          dummyGraph.push({
            modifiedDate: moment().subtract(y, 'month').format(monthFormat),
            totalDurationSum: (25 + (15 * abs)) + (15 + (10 * abs)) + (5 + (5 * abs)),
            goodQualityDurationSum: 25 + (15 * abs),
            fairQualityDurationSum: 15 + (10 * abs),
            poorQualityDurationSum: 5 + (5 * abs),
            colorOne: chartColors.dummyGray,
            colorTwo: chartColors.dummyGrayLight,
            colorThree: chartColors.dummyGrayLighter,
            balloon: false
          });
        }
      }

      return dummyGraph;
    }

    function dummyCallMetricsData() {
      return {
        dataProvider: [{
          label: $translate.instant('callMetrics.callConditionFail'),
          value: "200",
          color: chartColors.dummyGray
        }, {
          label: $translate.instant('callMetrics.callConditionSuccessful'),
          value: "800",
          color: chartColors.dummyGrayLight
        }],
        labelData: {
          numTotalCalls: 1000,
          numTotalMinutes: 1800
        },
        dummy: true
      };
    }

    function dummyEndpointData() {
      return [{
        customer: loadingCustomer,
        deviceRegistrationCountTrend: "0",
        yesterdaysDeviceRegistrationCount: "0",
        registeredDevicesTrend: "0",
        yesterdaysRegisteredDevices: "0",
        maxRegisteredDevices: "0",
        minRegisteredDevices: "0",
        direction: "positive"
      }];
    }
  }
})();
