(function () {
  'use strict';

  angular.module('Sunlight')
    .service('SunlightReportService', sunlightReportService);

  /* @ngInject */
  function sunlightReportService($http, $q, $rootScope, Authinfo, UrlConfig) {
    var sunlightReportUrl = UrlConfig.getSunlightReportServiceUrl() + '/organization/' + Authinfo.getOrgId() + '/report/';

    var dayFormat = "MMM DD";
    var monthFormat = "MMM";
    var hourFormat = 'HH:mm';

    var convertInMinutes = 60 * 1000;

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
      getReportingData: getReportingData,
      getOverviewData: getOverviewData
    };

    return service;

    function getStats(reportName, config) {
      return $http.get(sunlightReportUrl + reportName, config);
    }

    function getOverviewData() {
      var reportNames = ['org_stats'];
      getTimeCharts(reportNames, {
        intervalCount: 2,
        spanType: 'month',
        viewType: 'daily',
        mediaType: 'chat'
      });
    }

    function getTimeCharts(reportNames, paramBase) {
      _.forEach(reportNames, function (reportName) {
        var promises = [];
        for (var interval = 1; interval <= paramBase.intervalCount; interval++) {
          promises[interval - 1] = getOverviewDataCall(reportName, paramBase, interval);
        }
        $q.all(promises).then(function (values) {
          sendOverviewResponse({ data: _.assign({ success: true, values: values }, paramBase) }, 'incomingChatTasks');
        }, function (error) {
          sendOverviewResponse({ data: _.assign({ success: false, data: error }, paramBase) }, 'incomingChatTasks');
        });
      });
    }

    function getOverviewDataCall(reportName, paramBase, interval) {
      var deferred = $q.defer();
      var endTime = moment.utc().subtract(1, 'days').subtract(interval - 1, 'M').startOf('day');
      var startTime = moment.utc().subtract(1, 'days').subtract(interval, 'M').startOf('day');
      var config = getQueryConfig(paramBase.viewType, paramBase.mediaType, startTime, endTime);
      var responseBase = _.assign({ interval: interval }, config.params);
      getStats(reportName, config).then(function (response) {
        deferred.resolve(_.assign({ count: rollUpTaskCount(response.data.data) }, responseBase));
      }, function (response) {
        deferred.reject(_.assign({ count: response.message }), responseBase);
      });
      return deferred.promise;
    }

    function rollUpTaskCount(dataArray) {
      return _.reduce(dataArray, function (sum, n) { return n.numTasksQueuedState + sum; }, 0);
    }

    function sendOverviewResponse(response, metricType) {
      $rootScope.$broadcast(metricType + 'Loaded', response);
    }

    function getReportingData(reportName, timeSelected, mediaType, isSnapshot) {
      var config, startTimeStamp, endTimeStamp, dataPromise;
      switch (timeSelected) {
        // today
        case 0:
          startTimeStamp = moment().startOf('day');
          endTimeStamp = moment();
          config = getQueryConfig('fifteen_minutes', mediaType, startTimeStamp, endTimeStamp);
          dataPromise = getStats(reportName, config)
          .then(function (response) {
            var localTimeData = downSampleByHour(response.data.data, isSnapshot);
            return fillEmptyData(
              (moment.range(startTimeStamp.add(1, 'hours').toDate(), endTimeStamp.add(1, 'days').startOf('day').toDate())),
              'h', localTimeData, hourFormat, false);
          });
          break;

        // yesterday
        case 1:
          startTimeStamp = moment().subtract(1, 'days').startOf('day');
          endTimeStamp = moment().startOf('day');
          config = getQueryConfig('fifteen_minutes', mediaType, startTimeStamp, endTimeStamp);
          dataPromise = getStats(reportName, config)
          .then(function (response) {
            var localTimeData = downSampleByHour(response.data.data);
            return fillEmptyData(
              (moment.range(startTimeStamp.add(1, 'hours').toDate(), endTimeStamp.toDate())),
              'h', localTimeData, hourFormat, false);
          });
          break;

        // last week
        case 2:
          startTimeStamp = moment().subtract(7, 'days').startOf('day');
          endTimeStamp = moment().startOf('day');
          config = getQueryConfig('hourly', mediaType, startTimeStamp, endTimeStamp);
          dataPromise = getStats(reportName, config)
          .then(function (response) {
            var localTimeData = downSampleByDay(response.data.data);
            return fillEmptyData((moment.range(startTimeStamp.toDate(), endTimeStamp.toDate())),
              'd', localTimeData, dayFormat, true);
          });
          break;

        // last month
        case 3:
          endTimeStamp = moment().startOf('week');
          startTimeStamp = moment(endTimeStamp).subtract(28, 'days').startOf('day');
          config = getQueryConfig('daily', mediaType, startTimeStamp, endTimeStamp);
          dataPromise = getStats(reportName, config)
          .then(function (response) {
            var localTimeData = downSampleByWeek(response.data.data);
            return fillEmptyData((moment.range(startTimeStamp.toDate(), endTimeStamp.toDate())),
              'w', localTimeData, dayFormat, true);
          });
          break;

        // last 3 month
        case 4:
          startTimeStamp = moment().subtract(2, 'months').startOf('month');
          endTimeStamp = moment().startOf('day');
          config = getQueryConfig('daily', mediaType, startTimeStamp, endTimeStamp);
          dataPromise = getStats(reportName, config)
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

    function downSampleByHour(data, isSnapshot) {
      var statsGroupedByHour = _.groupBy(data, function (stats) {
        return moment(stats.createdTime).toDate().getHours();
      });

      var downSampledStatsByHour = [];
      _.map(statsGroupedByHour, function (statsList) {
        var reducedForHour = {};
        if (isSnapshot) {
          reducedForHour = _.reduce(statsList, reduceOrgSnapshotStatsByHour, emptyOrgstats);
        } else {
          reducedForHour = _.reduce(statsList, reduceOrgStatsByHour, emptyOrgstats);
          reducedForHour.avgTaskWaitTime = (reducedForHour.avgTaskWaitTime / convertInMinutes);
          reducedForHour.avgTaskCloseTime = (reducedForHour.avgTaskCloseTime / convertInMinutes);
          reducedForHour.avgCsatScores = roundTwoDecimalPlaces(reducedForHour.avgCsatScores);
        }
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
        reducedForDay.avgTaskWaitTime = (reducedForDay.avgTaskWaitTime / convertInMinutes);
        reducedForDay.avgTaskCloseTime = (reducedForDay.avgTaskCloseTime / convertInMinutes);
        reducedForDay.avgCsatScores = roundTwoDecimalPlaces(reducedForDay.avgCsatScores);
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
        reducedForWeek.avgTaskWaitTime = (reducedForWeek.avgTaskWaitTime / convertInMinutes);
        reducedForWeek.avgTaskCloseTime = (reducedForWeek.avgTaskCloseTime / convertInMinutes);
        reducedForWeek.avgCsatScores = roundTwoDecimalPlaces(reducedForWeek.avgCsatScores);
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
        reducedForMonth.avgTaskWaitTime = (reducedForMonth.avgTaskWaitTime / convertInMinutes);
        reducedForMonth.avgTaskCloseTime = (reducedForMonth.avgTaskCloseTime / convertInMinutes);
        reducedForMonth.avgCsatScores = roundTwoDecimalPlaces(reducedForMonth.avgCsatScores);
        downSampledStatsByMonth.push(reducedForMonth);
      });
      return downSampledStatsByMonth;
    }

    function reduceOrgSnapshotStatsByHour(stats1, stats2) {
      var resultStats = reduceOrgSnapshotStats(stats1, stats2);
      resultStats.createdTime = moment(stats2.createdTime).startOf('hour').add(1, 'hours').format(hourFormat);
      return resultStats;
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
      resultStats.createdTime = moment(stats2.createdTime).endOf('week').format(dayFormat);

      return resultStats;
    }

    function reduceOrgStatsByMonth(stats1, stats2) {
      var resultStats = reduceOrgStats(stats1, stats2);

      resultStats.createdTime = moment(stats2.createdTime).format(monthFormat);
      return resultStats;
    }

    function reduceOrgSnapshotStats(stats1, stats2) {
      return _.clone(stats2);

      // numWorkingTasks and numPendingTasks need to be the last one in the group. The way reduce works
      //   (empty, first, ... last) and because of the above statement, we don't have to set these two explicitly
    }

    function reduceOrgStats(stats1, stats2) {
      var resultStats = _.clone(stats2);
      resultStats.avgTaskWaitTime = calculateAvgWaitTime(stats1, stats2);
      resultStats.avgTaskCloseTime = calculateCloseTime(stats1, stats2);
      resultStats.numTasksAbandonedState = stats1.numTasksAbandonedState + stats2.numTasksAbandonedState;
      resultStats.numTasksHandledState = stats1.numTasksHandledState + stats2.numTasksHandledState;
      resultStats.numCsatScores = stats1.numCsatScores + stats2.numCsatScores;
      resultStats.avgCsatScores = calculateAverageCsat(stats1, stats2);
      return resultStats;
    }

    function calculateAvgWaitTime(stats1, stats2) {
      var totalTask1 = Math.max((stats1.numTasksAssignedState + stats1.numTasksAbandonedState) - stats1.numTasksAssignedToAbandonedState, 0);
      var totalTask2 = Math.max((stats2.numTasksAssignedState + stats2.numTasksAbandonedState) - stats2.numTasksAssignedToAbandonedState, 0);
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
      var duration2 = (totalTask2 != 0) ? (totalTask2 * stats2.avgTaskCloseTime) : stats2.avgTaskCloseTime;

      var duration = duration1 + duration2;

      return ((totalTasks != 0) ? (duration / totalTasks) : 0);
    }

    function calculateAverageCsat(stats1, stats2) {
      var totalCsatScores = stats1.numCsatScores + stats2.numCsatScores;
      var csat = (totalCsatScores > 0) ?
        ((stats1.avgCsatScores * stats1.numCsatScores) + (stats2.avgCsatScores * stats2.numCsatScores)) /
        (stats1.numCsatScores + stats2.numCsatScores) : 0;
      return csat;
    }

    function roundTwoDecimalPlaces(value) {
      return Math.round(value * 100) / 100;
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
