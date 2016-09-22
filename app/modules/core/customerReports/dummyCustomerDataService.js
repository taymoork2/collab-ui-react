(function () {
  'use strict';

  angular.module('Core')
    .service('DummyCustomerReportService', DummyCustomerReportService);

  /* @ngInject */
  function DummyCustomerReportService($translate, chartColors) {
    var dayFormat = 'MMM DD';
    var monthFormat = 'MMMM';

    // timespan values
    var days = 7;
    var weeks = 3;
    var lineWeeks = 4;
    var months = 2;
    var thirteenWeeks = 13;

    return {
      dummyActiveUserData: dummyActiveUserData,
      dummyAvgRoomData: dummyAvgRoomData,
      dummyFilesSharedData: dummyFilesSharedData,
      dummyMediaData: dummyMediaData,
      dummyMetricsData: dummyMetricsData,
      dummyDeviceData: dummyDeviceData
    };

    function getCommonData(filter, index) {
      var count = days - index;
      var date = moment().subtract(index, 'day').format(dayFormat);
      if (filter.value === 1) {
        count = weeks - index;
        date = moment().startOf('week').subtract(1 + (index * 7), 'day').format(dayFormat);
      } else if (filter.value === 2) {
        count = months - index;
        date = moment().subtract(index, 'month').format(monthFormat);
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
        timespan = days - 1;
        if (lineGraph) {
          timespan = days;
        }
      } else if (filter.value === 1) {
        timespan = weeks;
        if (lineGraph) {
          timespan = lineWeeks;
        }
      } else {
        timespan = months;
        if (lineGraph) {
          timespan = thirteenWeeks;
        }
      }
      for (var i = timespan; i >= 0; i--) {
        if (lineGraph) {
          dummyGraph.push(getActiveUserDataPoint(filter, i + 1, lineGraph, timespan - i));
        } else {
          dummyGraph.push(getActiveUserDataPoint(filter, i, lineGraph, timespan - i));
        }
      }

      return dummyGraph;
    }

    function getActiveUserDataPoint(filter, index, lineGraph, count) {
      var date;

      if (lineGraph) {
        if (filter.value === 0) {
          date = moment().subtract(index, 'day').format(dayFormat);
        } else if (filter.value === 1 || filter.value === 2) {
          date = moment().subtract(index * days, 'day').format(dayFormat);
        }
      } else {
        if (filter.value === 0) {
          index++;
        }
        var commonData = getCommonData(filter, index);
        count = commonData.count;
        date = commonData.date;
      }

      var totalRegisteredUsers = 25 + (25 * count);
      var activeUsers = 25 * count;

      return {
        date: date,
        totalRegisteredUsers: totalRegisteredUsers,
        activeUsers: activeUsers,
        percentage: getPercentage(activeUsers, totalRegisteredUsers),
        colorOne: chartColors.dummyGrayLight,
        colorTwo: chartColors.dummyGray,
        balloon: false
      };
    }

    function dummyAvgRoomData(filter) {
      var dummyGraph = [];

      if (filter.value === 0) {
        for (var i = days; i >= 1; i--) {
          dummyGraph.push(getAvgRoomDataPoint(filter, i));
        }
      } else if (filter.value === 1) {
        for (var x = weeks; x >= 0; x--) {
          dummyGraph.push(getAvgRoomDataPoint(filter, x));
        }
      } else {
        for (var y = months; y >= 0; y--) {
          dummyGraph.push(getAvgRoomDataPoint(filter, y));
        }
      }

      return dummyGraph;
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
      var dummyGraph = [];

      if (filter.value === 0) {
        for (var i = days; i >= 1; i--) {
          dummyGraph.push(getFilesSharedDataPoint(filter, i));
        }
      } else if (filter.value === 1) {
        for (var x = weeks; x >= 0; x--) {
          dummyGraph.push(getFilesSharedDataPoint(filter, x));
        }
      } else {
        for (var y = months; y >= 0; y--) {
          dummyGraph.push(getFilesSharedDataPoint(filter, y));
        }
      }

      return dummyGraph;
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
      var dummyGraph = [];

      if (filter.value === 0) {
        for (var i = days; i >= 1; i--) {
          dummyGraph.push(getMediaDataPoint(filter, i));
        }
      } else if (filter.value === 1) {
        for (var x = weeks; x >= 0; x--) {
          dummyGraph.push(getMediaDataPoint(filter, x));
        }
      } else {
        for (var y = months; y >= 0; y--) {
          dummyGraph.push(getMediaDataPoint(filter, y));
        }
      }

      return dummyGraph;
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
        colorOne: chartColors.dummyGray,
        colorTwo: chartColors.dummyGrayLight,
        colorThree: chartColors.dummyGrayLighter,
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
      var dummyGraph = [];

      if (filter.value === 0) {
        for (var i = days; i >= 1; i--) {
          dummyGraph.push(getDeviceDataPoint(filter, i));
        }
      } else if (filter.value === 1) {
        for (var x = weeks; x >= 0; x--) {
          dummyGraph.push(getDeviceDataPoint(filter, x));
        }
      } else {
        for (var y = months; y >= 0; y--) {
          dummyGraph.push(getDeviceDataPoint(filter, y));
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
