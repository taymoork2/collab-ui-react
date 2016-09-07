(function () {
  'use strict';

  angular.module('Core')
    .service('DummyCustomerReportService', DummyCustomerReportService);

  /* @ngInject */
  function DummyCustomerReportService($translate, chartColors) {
    var dayFormat = "MMM DD";
    var monthFormat = "MMMM";

    return {
      dummyActiveUserData: dummyActiveUserData,
      dummyAvgRoomData: dummyAvgRoomData,
      dummyFilesSharedData: dummyFilesSharedData,
      dummyMediaData: dummyMediaData,
      dummyMetricsData: dummyMetricsData,
      dummyDeviceData: dummyDeviceData
    };

    function dummyActiveUserData(filter) {
      var dummyGraph = [];
      var abs = 0;

      if (filter.value === 0) {
        for (var i = 7; i >= 1; i--) {
          abs = 7 - i;
          dummyGraph.push({
            date: moment().subtract(i, 'day').format(dayFormat),
            totalRegisteredUsers: 25 + (25 * abs),
            activeUsers: 25 * abs,
            percentage: Math.round(((25 * abs) / (25 + (25 * abs))) * 100),
            colorOne: chartColors.dummyGrayLight,
            colorTwo: chartColors.dummyGray,
            balloon: false
          });
        }
      } else if (filter.value === 1) {
        for (var x = 3; x >= 0; x--) {
          abs = 3 - x;
          dummyGraph.push({
            date: moment().startOf('week').subtract(1 + (x * 7), 'day').format(dayFormat),
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
            date: moment().subtract(y, 'month').format(monthFormat),
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

    function dummyAvgRoomData(filter) {
      var dummyGraph = [];
      var abs = 0;

      if (filter.value === 0) {
        for (var i = 7; i >= 1; i--) {
          abs = 7 - i;
          dummyGraph.push({
            date: moment().subtract(i, 'day').format(dayFormat),
            totalRooms: 10 + (10 * abs),
            oneToOneRooms: 10 * abs,
            groupRooms: 0,
            avgRooms: 0,
            colorOne: chartColors.dummyGrayLight,
            colorTwo: chartColors.dummyGray,
            balloon: false
          });
        }
      } else if (filter.value === 1) {
        for (var x = 3; x >= 0; x--) {
          abs = 3 - x;
          dummyGraph.push({
            date: moment().startOf('week').subtract(1 + (x * 7), 'day').format(dayFormat),
            totalRooms: 10 + (10 * abs),
            oneToOneRooms: 10 * abs,
            avgRooms: 0,
            groupRooms: 0,
            colorOne: chartColors.dummyGrayLight,
            colorTwo: chartColors.dummyGray,
            balloon: false
          });
        }
      } else {
        for (var y = 2; y >= 0; y--) {
          abs = 2 - y;
          dummyGraph.push({
            date: moment().subtract(y, 'month').format(monthFormat),
            totalRooms: 10 + (10 * abs),
            oneToOneRooms: 10 * abs,
            avgRooms: 0,
            groupRooms: 0,
            colorOne: chartColors.dummyGrayLight,
            colorTwo: chartColors.dummyGray,
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
            date: moment().subtract(i, 'day').format(dayFormat),
            contentShared: 80 - (10 * abs),
            contentShareSizes: 0,
            color: chartColors.dummyGray,
            balloon: false
          });
        }
      } else if (filter.value === 1) {
        for (var x = 3; x >= 0; x--) {
          abs = 3 - x;
          dummyGraph.push({
            date: moment().startOf('week').subtract(1 + (x * 7), 'day').format(dayFormat),
            contentShared: 50 - (10 * abs),
            contentShareSizes: 0,
            color: chartColors.dummyGray,
            balloon: false
          });
        }
      } else {
        for (var y = 2; y >= 0; y--) {
          abs = 2 - y;
          dummyGraph.push({
            date: moment().subtract(y, 'month').format(monthFormat),
            contentShared: 40 - (10 * abs),
            contentShareSizes: 0,
            color: chartColors.dummyGray,
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
            date: moment().subtract(i + 1, 'day').format(dayFormat),
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
      } else if (filter.value === 1) {
        for (var x = 3; x >= 0; x--) {
          abs = 3 - x;
          dummyGraph.push({
            date: moment().startOf('week').subtract(1 + (x * 7), 'day').format(dayFormat),
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
            date: moment().subtract(y, 'month').format(monthFormat),
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

    function dummyMetricsData() {
      return {
        dataProvider: [{
          "callCondition": $translate.instant('callMetrics.audioCalls'),
          "numCalls": 1000,
          "percentage": 10,
          "color": chartColors.dummyGrayLight
        }, {
          "callCondition": $translate.instant('callMetrics.videoCalls'),
          "numCalls": 9000,
          "percentage": 90,
          "color": chartColors.dummyGray
        }],
        dummy: true
      };
    }

    function dummyDeviceData(filter) {
      var dummyGraph = [];
      var abs = 0;

      if (filter.value === 0) {
        for (var i = 7; i >= 1; i--) {
          abs = 7 - i;
          dummyGraph.push({
            date: moment().subtract(i, 'day').format(dayFormat),
            totalRegisteredDevices: 15 + (15 * abs)
          });
        }
      } else if (filter.value === 1) {
        for (var x = 3; x >= 0; x--) {
          abs = 3 - x;
          dummyGraph.push({
            date: moment().startOf('week').subtract(1 + (x * 7), 'day').format(dayFormat),
            totalRegisteredDevices: 15 + (15 * abs)
          });
        }
      } else {
        for (var y = 2; y >= 0; y--) {
          abs = 2 - y;
          dummyGraph.push({
            date: moment().subtract(y, 'month').format(monthFormat),
            totalRegisteredDevices: 15 + (15 * abs)
          });
        }
      }

      return [{
        deviceType: $translate.instant('registeredEndpoints.allDevices'),
        graph: dummyGraph,
        balloon: false
      }];
    }
  }
})();
