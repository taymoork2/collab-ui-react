(function () {
  'use strict';

  angular.module('Core')
    .service('DummyReportService', DummyReportService);

  /* @ngInject */
  function DummyReportService($translate, Config) {
    var dayFormat = "MMM DD";
    var monthFormat = "MMMM";
    var dummyPopulation = null;
    var customers = null;

    return {
      dummyActiveUserData: dummyActiveUserData,
      dummyActivePopulationData: dummyActivePopulationData,
      dummyMediaQualityData: dummyMediaQualityData,
      dummyCallMetricsData: dummyCallMetricsData
    };

    function dummyActiveUserData(time) {
      var dummyGraph = [];
      var abs = 0;

      if (time.value === 0) {
        for (var i = 6; i >= 0; i--) {
          abs = 6 - i;
          dummyGraph.push({
            modifiedDate: moment().subtract(i, 'day').format(dayFormat),
            totalRegisteredUsers: 25 + (25 * abs),
            activeUsers: 25 * abs,
            percentage: Math.round(((25 * abs) / (25 + (25 * abs))) * 100),
            colorOne: Config.chartColors.grayLighter,
            colorTwo: Config.chartColors.grayLight,
            balloon: false
          });
        }
      } else if (time.value === 1) {
        for (var x = 3; x >= 0; x--) {
          abs = 3 - x;
          dummyGraph.push({
            modifiedDate: moment().subtract(x * 7, 'day').startOf('week').format(dayFormat),
            totalRegisteredUsers: 25 + (25 * abs),
            activeUsers: 25 * abs,
            percentage: Math.round(((25 * abs) / (25 + (25 * abs))) * 100),
            colorOne: Config.chartColors.grayLighter,
            colorTwo: Config.chartColors.grayLight,
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
            colorOne: Config.chartColors.grayLighter,
            colorTwo: Config.chartColors.grayLight,
            balloon: false
          });
        }
      }

      return dummyGraph;
    }

    function dummyActivePopulationData(customer, overallPopulation) {
      var dummyGraph = [];

      if (angular.isArray(customer)) {
        if (!angular.isArray(dummyPopulation) || customers !== customer) {
          customers = customer;

          angular.forEach(customer, function (index) {
            var percentage = Math.floor((Math.random() * 100) + 50);
            var color = Config.chartColors.grayLighter;
            if (percentage < overallPopulation) {
              color = Config.chartColors.grayLight;
            }

            dummyGraph.push({
              customerName: index.label,
              customerId: index.value,
              percentage: percentage,
              colorOne: color,
              colorTwo: Config.chartColors.gray,
              balloon: false
            });
          });
          dummyPopulation = dummyGraph;
        }

        return dummyPopulation;
      } else {
        dummyGraph = [{
          customerName: customer.label,
          customerId: customer.value,
          percentage: 85,
          colorOne: Config.chartColors.grayLighter,
          colorTwo: Config.chartColors.gray,
          balloon: false
        }];
        return dummyGraph;
      }
    }

    function dummyMediaQualityData(time) {
      var dummyGraph = [];
      var abs = 0;

      if (time.value === 0) {
        for (var i = 6; i >= 0; i--) {
          abs = 6 - i;
          dummyGraph.push({
            modifiedDate: moment().subtract(i, 'day').format(dayFormat),
            totalDurationSum: (25 + (15 * abs)) + (15 + (10 * abs)) + (5 + (5 * abs)),
            goodQualityDurationSum: 25 + (15 * abs),
            fairQualityDurationSum: 15 + (10 * abs),
            poorQualityDurationSum: 5 + (5 * abs),
            colorOne: Config.chartColors.gray,
            colorTwo: Config.chartColors.grayLight,
            colorThree: Config.chartColors.grayLighter,
            balloon: false
          });
        }
      } else if (time.value === 1) {
        for (var x = 3; x >= 0; x--) {
          abs = 3 - x;
          dummyGraph.push({
            modifiedDate: moment().subtract(x * 7, 'day').startOf('week').format(dayFormat),
            totalDurationSum: (25 + (15 * abs)) + (15 + (10 * abs)) + (5 + (5 * abs)),
            goodQualityDurationSum: 25 + (15 * abs),
            fairQualityDurationSum: 15 + (10 * abs),
            poorQualityDurationSum: 5 + (5 * abs),
            colorOne: Config.chartColors.gray,
            colorTwo: Config.chartColors.grayLight,
            colorThree: Config.chartColors.grayLighter,
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
            colorOne: Config.chartColors.gray,
            colorTwo: Config.chartColors.grayLight,
            colorThree: Config.chartColors.grayLighter,
            balloon: false
          });
        }
      }

      return dummyGraph;
    }

    function dummyCallMetricsData() {
      return {
        dataProvider: [{
          callCondition: "Fail",
          numCalls: "200"
        }, {
          callCondition: "Successful",
          numCalls: "800"
        }],
        labelData: { 
          numTotalCalls: 1000,
          numTotalMinutes: 1800
        },
        dummy: true
      };
    }
  }
})();
