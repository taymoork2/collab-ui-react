(function () {
  'use strict';

  angular.module('Sunlight')
    .service('SunlightReportService', sunlightReportService);

  /* @ngInject */
  function sunlightReportService($http, $q, Authinfo, UrlConfig) {
    var sunlightReportUrl = UrlConfig.getSunlightReportServiceUrl() + '/organization/' + Authinfo.getOrgId() + '/report/';

    var dayFormat = "MMM DD";
    var monthFormat = "MMM";
    var hourFormat = 'HH:mm';

    var emptyOrgstats = {
      "numTasksAssignedState": 0,
      "avgCsatScores": 0.0,
      "numWorkingTasks": 0,
      "numTasksHandledState": 0,
      "numTasksQueuedState": 0,
      "numTasksAbandonedState": 0,
      "numTasksAssignedToAbandonedState": 0,
      "avgTaskCloseTime": 0,
      "avgTaskWaitTime": 0,
      "numCsatScores": 0,
      "numPendingTasks": 0
    };

    var service = {
      getStats: getStats,
      getReportingData: getReportingData
    };

    return service;

    function getStats(reportName, config) {
      return $http.get(sunlightReportUrl + reportName, config);
    }

    function getReportingData(reportName, timeSelected, mediaType) {
      var dataPromise;
      switch (timeSelected) {
        // today
      case 0:
        var deferred = $q.defer();
        deferred.resolve([]);
        dataPromise = deferred.promise;
        break;

        // yesterday
      case 1:
        var startTimeStamp = moment().subtract(1, 'days').startOf('day');
        var endTimeStamp = moment().startOf('day');
        var config = getQueryConfig('fifteen_minutes', mediaType, startTimeStamp, endTimeStamp);
        var dataPromise = getStats(reportName, config)
          .then(function (response) {
            var localTimeData = downSampleByHour(response.data.data);
            return fillEmptyData(
              (moment.range(startTimeStamp.add(1, 'hours').toDate(), endTimeStamp.toDate())),
              'h', localTimeData, hourFormat, false);
          });

        break;

        // last week
      case 2:
        var startTimeStamp = moment().subtract(7, 'days').startOf('day');
        var endTimeStamp = moment().startOf('day');
        var config = getQueryConfig('hourly', mediaType, startTimeStamp, endTimeStamp);
        var dataPromise = getStats(reportName, config)
          .then(function (response) {
            var localTimeData = downSampleByDay(response.data.data);
            return fillEmptyData((moment.range(startTimeStamp.toDate(), endTimeStamp.toDate())),
              'd', localTimeData, dayFormat, true);
          });
        break;

        // last month
      case 3:
        var endTimeStamp = moment().startOf('week');
        var startTimeStamp = moment(endTimeStamp).subtract(28, 'days').startOf('day');
        var config = getQueryConfig('daily', mediaType, startTimeStamp, endTimeStamp);
        var dataPromise = getStats(reportName, config)
          .then(function (response) {
            var localTimeData = downSampleByWeek(response.data.data);
            return fillEmptyData((moment.range(startTimeStamp.toDate(), endTimeStamp.toDate())),
              'w', localTimeData, dayFormat, true);
          });
        break;

        // last 3 month
      case 4:
        var startTimeStamp = moment().subtract(2, 'months').startOf('month');
        var endTimeStamp = moment().subtract(1, 'days').startOf('day');
        var config = getQueryConfig('daily', mediaType, startTimeStamp, endTimeStamp);
        var dataPromise = getStats(reportName, config)
          .then(function (response) {
            var localTimeData = downSampleByMonth(response.data.data);
            return fillEmptyData((moment.range(startTimeStamp.toDate(), endTimeStamp.toDate())),
              'M', localTimeData, monthFormat, false);
          });
        break;

      default:
        var deferred = $q.defer();
        deferred.resolve([]);
        dataPromise = deferred.promise;
      }
      return dataPromise;
    }

    function getQueryConfig(viewType, mediaType, startTimeStamp, endTimeStamp) {
      return {
        params: {
          viewType: viewType,
          mediaType: mediaType,
          startTime: startTimeStamp.valueOf(),
          endTime: endTimeStamp.valueOf()
        }
      };
    }

    function getStatsInLocalTz(data) {
      _.map(data, convertTimeToLocalTz);
      return data;
    }

    function convertTimeToLocalTz(stats) {
      var utcDate = moment(stats.createdTime);
      var createdTimeInLocalTz = utcDate.toDate();
      var formattedDate = moment(createdTimeInLocalTz).format(dayFormat);
      stats.createdTime = formattedDate;
    }

    function downSampleByHour(data) {
      var statsGroupedByHour = _.groupBy(data, function (stats) {
        return moment(stats.createdTime).toDate().getHours();
      });

      var downSampledStatsByHour = [];
      _.map(statsGroupedByHour, function (statsList) {
        var reducedForHour = _.reduce(statsList, reduceOrgStatsByHour, emptyOrgstats);
        downSampledStatsByHour.push(reducedForHour);
      });
      return downSampledStatsByHour;
    }

    function downSampleByDay(data) {
      var statsGroupedByDay = _.groupBy(data, function (stats) {
        return moment(stats.createdTime).toDate().getDay();
      });

      var downSampledStatsByDay = [];
      _.map(statsGroupedByDay, function (statsList) {
        var reducedForDay = _.reduce(statsList, reduceOrgStatsByDay, emptyOrgstats);
        downSampledStatsByDay.push(reducedForDay);
      });
      return downSampledStatsByDay;
    }

    function downSampleByWeek(data) {
      var statsGroupedByWeek = _.groupBy(data, function (stats) {
        return moment(stats.createdTime).week();
      });
      var downSampledStatsByWeek = [];
      _.map(statsGroupedByWeek, function (statsList) {
        var reducedForWeek = _.reduce(statsList, reduceOrgStatsByWeek, emptyOrgstats);
        downSampledStatsByWeek.push(reducedForWeek);
      });
      return downSampledStatsByWeek;
    }

    function downSampleByMonth(data) {
      var statsGroupedByMonth = _.groupBy(data, function (stats) {
        return moment(stats.createdTime).toDate().getMonth();
      });
      var downSampledStatsByMonth = [];
      _.map(statsGroupedByMonth, function (statsList) {
        var reducedForMonth = _.reduce(statsList, reduceOrgStatsByMonth, emptyOrgstats);
        downSampledStatsByMonth.push(reducedForMonth);
      });
      return downSampledStatsByMonth;
    }

    function reduceOrgStatsByHour(stats1, stats2) {
      var resultStats = reduceOrgStats(stats1, stats2);
      resultStats.createdTime = moment(stats2.createdTime).startOf('hour').add(1, 'hours').format(hourFormat);
      return resultStats;
    }

    function reduceOrgStatsByDay(stats1, stats2) {
      var resultStats = reduceOrgStats(stats1, stats2);
      resultStats.createdTime = moment(stats2.createdTime).startOf('day').format(dayFormat);
      return resultStats;
    }

    function reduceOrgStatsByWeek(stats1, stats2) {
      var resultStats = reduceOrgStats(stats1, stats2);
      var isoWeekDay = moment(stats2.createdTime).isoWeekday();
      resultStats.createdTime = moment(stats2.createdTime).endOf('week').format(dayFormat);
      return resultStats;
    }

    function reduceOrgStatsByMonth(stats1, stats2) {
      var resultStats = reduceOrgStats(stats1, stats2);
      resultStats.createdTime = moment(stats2.createdTime).format(monthFormat);
      return resultStats;
    }

    function reduceOrgStats(stats1, stats2) {
      var resultStats = _.clone(stats2);
      resultStats.avgTaskWaitTime = calculateAvgWaitTime(stats1, stats2);
      resultStats.avgTaskCloseTime = calculateCloseTime(stats1, stats2);
      resultStats.numTasksAbandonedState = stats1.numTasksAbandonedState + stats2.numTasksAbandonedState;
      resultStats.numTasksHandledState = stats1.numTasksHandledState + stats2.numTasksHandledState;
      return resultStats;
    }

    function calculateAvgWaitTime(stats1, stats2) {
      var totalTask1 = stats1.numTasksAssignedState + stats1.numTasksAbandonedState - stats1.numTasksAssignedToAbandonedState;
      var totalTask2 = stats2.numTasksAssignedState + stats2.numTasksAbandonedState - stats2.numTasksAssignedToAbandonedState;
      var totalTasks = totalTask1 + totalTask2;

      var duration1 = (totalTask1 != 0) ? (totalTask1 * stats1.avgTaskWaitTime) : stats1.avgTaskWaitTime;
      var duration2 = (totalTask2 != 0) ? (totalTask2 * stats2.avgTaskWaitTime) : stats2.avgTaskWaitTime;

      var duration = duration1 + duration2;

      return ((totalTasks != 0) ? (duration / totalTasks) : 0);
    }

    function calculateCloseTime(stats1, stats2) {
      var totalTask1 = stats1.numTasksHandledState + stats1.numTasksAssignedToAbandonedState;
      var totalTask2 = stats2.numTasksHandledState + stats2.numTasksAssignedToAbandonedState;
      var totalTasks = totalTask1 + totalTask2;

      var duration1 = (totalTask1 != 0) ? (totalTask1 * stats1.avgTaskCloseTime) : stats1.avgTaskCloseTime;
      var duration2 = (totalTask1 != 0) ? (totalTask1 * stats2.avgTaskCloseTime) : stats2.avgTaskCloseTime;

      var duration = duration1 + duration2;

      return ((totalTasks != 0) ? (duration / totalTasks) : 0);

    }

    function fillEmptyData(range, interval, localTimeData, format, excludeEnd) {
      if (localTimeData.length === 0) {
        return localTimeData;
      }
      var rangeStatsList = [];
      var formatter = getFormatter(interval);
      range.by(interval, function (moment) {
        var formattedTime = formatter(moment, format);
        var intervalStats = _.find(localTimeData, function (data) {
          return data.createdTime === formattedTime;
        });
        if (intervalStats) {
          rangeStatsList.push(intervalStats);
        } else {
          var emptyStats = _.clone(emptyOrgstats);
          emptyStats.createdTime = formattedTime;
          rangeStatsList.push(emptyStats);
        }
      }, excludeEnd);
      return rangeStatsList;
    }

    function getFormatter(interval) {
      switch (interval) {
      case 'w':
        return weekFormatter;
      default:
        return momentFormatter;
      }
    }

    function momentFormatter(time, format) {
      return time.format(format);
    }

    function weekFormatter(time, format) {
      return momentFormatter(time.endOf('week'), format);
    }

  }
})();
