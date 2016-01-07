(function () {
  'use strict';

  angular.module('Core')
    .service('DummyCustomerReportService', DummyCustomerReportService);

  /* @ngInject */
  function DummyCustomerReportService($translate, Config) {
    var dayFormat = "MMM DD";
    var monthFormat = "MMMM";
    var dummyPopulation = null;
    var customers = null;

    return {
      dummyActiveUserData: dummyActiveUserData,
      dummyAvgRoomData: dummyAvgRoomData,
      dummyFilesSharedData: dummyFilesSharedData,
      dummyMediaData: dummyMediaData
    };

    function dummyActiveUserData(filter) {
      var dummyGraph = [];
      var abs = 0;

      if (filter.value === 0) {
        for (var i = 7; i >= 1; i--) {
          abs = 7 - i;
          dummyGraph.push({
            modifiedDate: moment().subtract(i, 'day').format(dayFormat),
            totalRegisteredUsers: 25 + (25 * abs),
            activeUsers: 25 * abs,
            percentage: Math.round(((25 * abs) / (25 + (25 * abs))) * 100),
            colorOne: Config.chartColors.dummyGrayLight,
            colorTwo: Config.chartColors.dummyGray,
            balloon: false
          });
        }
      } else if (filter.value === 1) {
        for (var x = 3; x >= 0; x--) {
          abs = 3 - x;
          dummyGraph.push({
            modifiedDate: moment().startOf('week').subtract(1 + (x * 7), 'day').format(dayFormat),
            totalRegisteredUsers: 25 + (25 * abs),
            activeUsers: 25 * abs,
            percentage: Math.round(((25 * abs) / (25 + (25 * abs))) * 100),
            colorOne: Config.chartColors.dummyGrayLight,
            colorTwo: Config.chartColors.dummyGray,
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
            colorOne: Config.chartColors.dummyGrayLight,
            colorTwo: Config.chartColors.dummyGray,
            balloon: false
          });
        }
      }

      return dummyGraph;
    }

    function dummyAvgRoomData(filter) {
      var dummyGraph = [];
      var abs = 0;

      if (filter.value === 0) {
        for (var i = 7; i >= 1; i--) {
          abs = 7 - i;
          dummyGraph.push({
            modifiedDate: moment().subtract(i, 'day').format(dayFormat),
            totalRooms: 10 + (10 * abs),
            oneToOneRooms: 10 * abs,
            groupRooms: 0,
            avgRooms: 0,
            colorOne: Config.chartColors.dummyGrayLight,
            colorTwo: Config.chartColors.dummyGray,
            balloon: false
          });
        }
      } else if (filter.value === 1) {
        for (var x = 3; x >= 0; x--) {
          abs = 3 - x;
          dummyGraph.push({
            modifiedDate: moment().startOf('week').subtract(1 + (x * 7), 'day').format(dayFormat),
            totalRooms: 10 + (10 * abs),
            oneToOneRooms: 10 * abs,
            avgRooms: 0,
            groupRooms: 0,
            colorOne: Config.chartColors.dummyGrayLight,
            colorTwo: Config.chartColors.dummyGray,
            balloon: false
          });
        }
      } else {
        for (var y = 2; y >= 0; y--) {
          abs = 2 - y;
          dummyGraph.push({
            modifiedDate: moment().subtract(y, 'month').format(monthFormat),
            totalRooms: 10 + (10 * abs),
            oneToOneRooms: 10 * abs,
            avgRooms: 0,
            groupRooms: 0,
            colorOne: Config.chartColors.dummyGrayLight,
            colorTwo: Config.chartColors.dummyGray,
            balloon: false
          });
        }
      }

      return dummyGraph;
    }

    function dummyFilesSharedData(filter) {
      var dummyGraph = [];
      var abs = 0;

      if (filter.value === 0) {
        for (var i = 7; i >= 1; i--) {
          abs = 7 - i;
          dummyGraph.push({
            modifiedDate: moment().subtract(i, 'day').format(dayFormat),
            contentShared: 80 - (10 * abs),
            contentShareSizes: 0,
            color: Config.chartColors.dummyGray,
            balloon: false
          });
        }
      } else if (filter.value === 1) {
        for (var x = 3; x >= 0; x--) {
          abs = 3 - x;
          dummyGraph.push({
            modifiedDate: moment().startOf('week').subtract(1 + (x * 7), 'day').format(dayFormat),
            contentShared: 50 - (10 * abs),
            contentShareSizes: 0,
            color: Config.chartColors.dummyGray,
            balloon: false
          });
        }
      } else {
        for (var y = 2; y >= 0; y--) {
          abs = 2 - y;
          dummyGraph.push({
            modifiedDate: moment().subtract(y, 'month').format(monthFormat),
            contentShared: 40 - (10 * abs),
            contentShareSizes: 0,
            color: Config.chartColors.dummyGray,
            balloon: false
          });
        }
      }

      return dummyGraph;
    }

    function dummyMediaData(filter) {
      var dummyGraph = [];
      var abs = 0;

      if (filter.value === 0) {
        for (var i = 7; i >= 1; i--) {
          abs = 7 - i;
          dummyGraph.push({
            modifiedDate: moment().subtract(i + 1, 'day').format(dayFormat),
            totalDurationSum: (25 + (15 * abs)) + (15 + (10 * abs)) + (5 + (5 * abs)),
            goodQualityDurationSum: 25 + (15 * abs),
            fairQualityDurationSum: 15 + (10 * abs),
            poorQualityDurationSum: 5 + (5 * abs),
            colorOne: Config.chartColors.dummyGray,
            colorTwo: Config.chartColors.dummyGrayLight,
            colorThree: Config.chartColors.dummyGrayLighter,
            balloon: false
          });
        }
      } else if (filter.value === 1) {
        for (var x = 3; x >= 0; x--) {
          abs = 3 - x;
          dummyGraph.push({
            modifiedDate: moment().startOf('week').subtract(1 + (x * 7), 'day').format(dayFormat),
            totalDurationSum: (25 + (15 * abs)) + (15 + (10 * abs)) + (5 + (5 * abs)),
            goodQualityDurationSum: 25 + (15 * abs),
            fairQualityDurationSum: 15 + (10 * abs),
            poorQualityDurationSum: 5 + (5 * abs),
            colorOne: Config.chartColors.dummyGray,
            colorTwo: Config.chartColors.dummyGrayLight,
            colorThree: Config.chartColors.dummyGrayLighter,
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
            colorOne: Config.chartColors.dummyGray,
            colorTwo: Config.chartColors.dummyGrayLight,
            colorThree: Config.chartColors.dummyGrayLighter,
            balloon: false
          });
        }
      }

      return dummyGraph;
    }
  }
})();
