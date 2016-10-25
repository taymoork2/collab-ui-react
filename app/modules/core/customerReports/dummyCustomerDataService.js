(function () {
  'use strict';

  angular.module('Core')
    .service('DummyCustomerReportService', DummyCustomerReportService);

  /* @ngInject */
  function DummyCustomerReportService($translate, chartColors, ReportConstants) {
    return {
      dummyActiveUserData: dummyActiveUserData,
      dummyAvgRoomData: dummyAvgRoomData,
      dummyFilesSharedData: dummyFilesSharedData,
      dummyMediaData: dummyMediaData,
      dummyMetricsData: dummyMetricsData,
      dummyDeviceData: dummyDeviceData
    };

    function getCommonData(filter, index) {
      var count = ReportConstants.DAYS - index;
      var date = moment().subtract(index, ReportConstants.DAY).format(ReportConstants.DAY_FORMAT);
      if (filter.value === 1) {
        count = ReportConstants.WEEKS - index;
        date = moment().startOf(ReportConstants.WEEK).subtract(1 + (index * 7), ReportConstants.DAY).format(ReportConstants.DAY_FORMAT);
      } else if (filter.value === 2) {
        count = ReportConstants.MONTHS - index;
        date = moment().subtract(index, ReportConstants.MONTH).format(ReportConstants.MONTH_FORMAT);
      }

      return {
        date: date,
        count: count
      };
    }

    function getPercentage(numberOne, numberTwo) {
      return Math.round((numberOne / numberTwo) * 100);
    }

    // should return one set of data for column version and one set for line graph version
    // TODO: remove column version of data after feature toggle is removed
    function dummyActiveUserData(filter, lineGraph) {
      var dummyGraph = [];
      var timespan;

      if (filter.value === 0) {
        timespan = ReportConstants.DAYS - 1;
        if (lineGraph) {
          timespan = ReportConstants.DAYS;
        }
      } else if (filter.value === 1) {
        timespan = ReportConstants.WEEKS;
        if (lineGraph) {
          timespan = ReportConstants.LINE_WEEKS;
        }
      } else {
        timespan = ReportConstants.MONTHS;
        if (lineGraph) {
          timespan = ReportConstants.YEAR;
        }
      }
      for (var i = timespan; i >= 0; i--) {
        dummyGraph.push(getActiveUserDataPoint(filter, i, lineGraph, timespan - i));
      }

      return dummyGraph;
    }

    function getActiveUserDataPoint(filter, index, lineGraph, count) {
      var date;

      if (lineGraph) {
        if (filter.value === 0) {
          date = moment().subtract(index + 1, ReportConstants.DAY).format(ReportConstants.DAY_FORMAT);
        } else {
          date = moment().day(-1).subtract(index, ReportConstants.WEEK).format(ReportConstants.DAY_FORMAT);
        }
      } else {
        if (filter.value === 0) {
          index++;
        }
        var commonData = getCommonData(filter, index);
        date = commonData.date;
      }

      var totalRegisteredUsers = 25 + (25 * count);
      var activeUsers = 25 * count;

      return {
        date: date,
        totalRegisteredUsers: totalRegisteredUsers,
        activeUsers: activeUsers,
        percentage: getPercentage(activeUsers, totalRegisteredUsers),
        balloon: false
      };
    }

    function dummyAvgRoomData(filter) {
      return getDummyData(filter, getAvgRoomDataPoint);
    }

    function getAvgRoomDataPoint(filter, index) {
      var commonData = getCommonData(filter, index);

      return {
        date: commonData.date,
        totalRooms: 10 + (10 * commonData.count),
        oneToOneRooms: 10 * commonData.count,
        groupRooms: 0,
        avgRooms: 0,
        colorOne: chartColors.dummyGrayLight,
        colorTwo: chartColors.dummyGray,
        balloon: false
      };
    }

    function dummyFilesSharedData(filter) {
      return getDummyData(filter, getFilesSharedDataPoint);
    }

    function getFilesSharedDataPoint(filter, index) {
      var commonData = getCommonData(filter, index);

      return {
        date: commonData.date,
        contentShared: 80 - (10 * commonData.count),
        contentShareSizes: 0,
        color: chartColors.dummyGray,
        balloon: false
      };
    }

    function dummyMediaData(filter) {
      return getDummyData(filter, getMediaDataPoint);
    }

    function getMediaDataPoint(filter, index) {
      var commonData = getCommonData(filter, index);
      var goodQualityDurationSum = 25 + (15 * commonData.count);
      var fairQualityDurationSum = 15 + (10 * commonData.count);
      var poorQualityDurationSum = 5 + (5 * commonData.count);

      return {
        date: commonData.date,
        totalDurationSum: goodQualityDurationSum + fairQualityDurationSum + poorQualityDurationSum,
        partialSum: fairQualityDurationSum + poorQualityDurationSum,
        goodQualityDurationSum: goodQualityDurationSum,
        fairQualityDurationSum: fairQualityDurationSum,
        poorQualityDurationSum: poorQualityDurationSum,
        balloon: false
      };
    }

    function dummyMetricsData() {
      return {
        dataProvider: [{
          'callCondition': $translate.instant('callMetrics.audioCalls'),
          'numCalls': 1000,
          'percentage': 10,
          'color': chartColors.dummyGrayLight
        }, {
          'callCondition': $translate.instant('callMetrics.videoCalls'),
          'numCalls': 9000,
          'percentage': 90,
          'color': chartColors.dummyGray
        }],
        dummy: true
      };
    }

    function getDeviceDataPoint(filter, index) {
      var commonData = getCommonData(filter, index);

      return {
        date: commonData.date,
        totalRegisteredDevices: 15 + (15 * commonData.count)
      };
    }

    function dummyDeviceData(filter) {
      return [{
        deviceType: $translate.instant('registeredEndpoints.allDevices'),
        graph: getDummyData(filter, getDeviceDataPoint),
        balloon: false
      }];
    }

    function getDummyData(filter, callFunction) {
      var dummyGraph = [];

      if (filter.value === 0) {
        for (var i = ReportConstants.DAYS; i >= 1; i--) {
          dummyGraph.push(callFunction(filter, i));
        }
      } else if (filter.value === 1) {
        for (var x = ReportConstants.WEEKS; x >= 0; x--) {
          dummyGraph.push(callFunction(filter, x));
        }
      } else {
        for (var y = ReportConstants.MONTHS; y >= 0; y--) {
          dummyGraph.push(callFunction(filter, y));
        }
      }

      return dummyGraph;
    }
  }
})();
