(function () {
  'use strict';

  /* @ngInject */
  function sunlightReportService($http, $q, $rootScope, $translate, Authinfo, UrlConfig) {
    var sunlightReportUrl = UrlConfig.getSunlightReportServiceUrl() + '/organization/' + Authinfo.getOrgId() + '/report/';

    var dayFormat = 'MMM DD';
    var monthFormat = 'MMM';
    var hourFormat = 'HH:mm';

    var convertInMinutes = 60 * 1000;

    var emptyOrgstats = {
      numTasksAssignedState: 0,
      avgCsatScores: 0.0,
      numWorkingTasks: 0,
      numTasksHandledState: 0,
      numTasksQueuedState: 0,
      numTasksAbandonedState: 0,
      numTasksAssignedToAbandonedState: 0,
      avgTaskCloseTime: 0,
      avgTaskWaitTime: 0,
      numCsatScores: 0,
      numPendingTasks: 0,
      tasksOffered: 0,
      tasksMissed: 0,
      numChatTasksHandled: 0,
      numWebcallTasksHandled: 0,
      avgChatTaskCloseTime: 0,
      avgWebcallTaskCloseTime: 0,
      avgChatCsatScores: 0,
      avgWebcallCsatScores: 0,
      numChatWorkingTasks: 0,
      numWebcallWorkingTasks: 0,
    };

    var emptyUserstats = {
      tasksHandled: 0,
      tasksAssigned: 0,
      totalCSAT: 0,
      handleTime: 0,
      numCsatScores: 0,
      tasksOffered: 0,
      tasksMissed: 0,

      webcallTasksHandled: 0,
      webcallTotalCSAT: 0,
      webcallHandleTime: 0,
      webcallNumCsatScores: 0,
    };

    var service = {
      getStats: getStats,
      getReportingData: getReportingData,
      getOverviewData: getOverviewData,
      getAllUsersAggregatedData: getAllUsersAggregatedData,
    };

    return service;

    function getStats(reportName, config) {
      return $http.get(sunlightReportUrl + reportName, config);
    }

    function getCareUsers() {
      return $http.get(UrlConfig.getScimUrl(Authinfo.getOrgId()) + encodeURI('?filter=entitlements eq cloud-contact-center'));
    }

    function getCareUsersByIds(idList) {
      var idString = _.reduce(idList, function (result, id) {
        if (result === '') {
          return result + 'id eq ' + id + ' ';
        } else {
          return result + 'or id eq ' + id + ' ';
        }
      }, '');
      return $http.get(UrlConfig.getScimUrl(Authinfo.getOrgId()) + encodeURI('?filter=' + idString));
    }

    function getAllUsersAggregatedData(reportName, timeSelected, mediaType) {
      return getReportingData(reportName, timeSelected, mediaType)
        .then(addUserDataToReportingData);
    }

    function addUserDataToReportingData(reportingUserData) {
      var reportedUserIds = [];
      if (reportingUserData.data && reportingUserData.data.length > 0) {
        reportedUserIds = _.map(reportingUserData.data, function (reportUser) {
          return reportUser.userId;
        });
        return $q(function (resolve) {
          getCareUsers()
            .then(function (ciCareUserData) {
              var ciCareUsers = _.get(ciCareUserData, 'data.Resources');
              var ciCareUserIds = _.map(ciCareUsers, function (ciUser) {
                return ciUser.id;
              });

              var ciNonCareUserIds = _.difference(reportedUserIds, ciCareUserIds);
              if (ciNonCareUserIds.length > 0) {
                getNonCareUserDetails(ciNonCareUserIds, ciCareUsers, reportingUserData, resolve);
              } else {
                mergeReportingAndUserData(reportingUserData.data, ciCareUsers);
                resolve(reportingUserData);
              }
            });
        });
      } else {
        return $q.resolve(reportingUserData);
      }
    }

    function getNonCareUserDetails(ciNonCareUserIds, ciCareUsers, reportingUserData, resolve) {
      getNonCareCiUsers(ciNonCareUserIds)
        .then(function (ciNonCareUsers) {
          var userObjs = _.filter(_.map(ciNonCareUsers, function (user) {
            if (user.data.Resources.length > 0) {
              return user.data.Resources;
            }
          }), function (obj) {
            return (obj !== undefined);
          });

          var totalUsers = _.concat(ciCareUsers, userObjs[0]);
          mergeReportingAndUserData(reportingUserData.data, totalUsers);
          resolve(reportingUserData);
        }, function () {
          mergeReportingAndUserData(reportingUserData.data, ciCareUsers, true);
          resolve(reportingUserData);
        });
    }

    function getNonCareCiUsers(ciNonCareUserIds) {
      return $q(function (resolve, reject) {
        var userPromises = [];
        //the userIds need to be passed as query param and hence limited to 40 at a time
        var userIdChunks = _.chunk(ciNonCareUserIds, 40);
        _.forEach(userIdChunks, function (userIdList) {
          userPromises.push(getCareUsersByIds(userIdList));
        });

        $q.all(userPromises).then(function (res) {
          resolve(res);
        }, function (err) {
          reject(err);
        });
      });
    }


    function mergeReportingAndUserData(aggregatedUserData, ciUserData, isError) {
      var careUserIDNameMap = getCareUserIDNameMap(ciUserData, aggregatedUserData);

      return finalAggregatedData(aggregatedUserData, careUserIDNameMap, isError);
    }

    function finalAggregatedData(aggregatedData, careUserIDNameMap, isError) {
      _.forEach(aggregatedData, function (reportingUserData) {
        reportingUserData.displayName = careUserIDNameMap[reportingUserData.userId];
        reportingUserData.avgHandleTime = Number((reportingUserData.avgHandleTime).toFixed(0));
        reportingUserData.avgWebcallHandleTime = Number((reportingUserData.avgWebcallHandleTime).toFixed(0));
      });

      var deletedUserIndex = 0;
      _.forEach(aggregatedData, function (userData) {
        if (!userData.displayName) {
          if (isError) {
            userData.displayName = $translate.instant('careReportsPage.errorLoadingName');
            userData.isError = true;
          } else {
            userData.displayName = $translate.instant('careReportsPage.deletedUser ') + ++deletedUserIndex;
            userData.isUserDeleted = true;
          }
        }
      });

      return aggregatedData;
    }

    function getDisplayName(ciUser) {
      if (ciUser.name) {
        if (ciUser.name.givenName && !ciUser.name.familyName) {
          return ciUser.name.givenName;
        } else if (!ciUser.name.givenName && ciUser.name.familyName) {
          return ciUser.name.familyName;
        } else {
          return ciUser.name.givenName + ' ' + ciUser.name.familyName;
        }
      } else if (ciUser.displayName) {
        return ciUser.displayName;
      } else {
        return ciUser.emails[0].value;
      }
    }

    function getCareUserIDNameMap(ciUserData) {
      var careUserIDNameMap = {};
      _.forEach(ciUserData, function (ciUserDetailedData) {
        careUserIDNameMap[ciUserDetailedData.id] = getDisplayName(ciUserDetailedData);
      });
      return careUserIDNameMap;
    }

    function getOverviewData() {
      var reportNames = ['org_stats'];
      getTimeCharts(reportNames, {
        intervalCount: 2,
        spanType: 'month',
        viewType: 'daily',
        mediaType: 'chat',
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
          endTimeStamp = moment().add(1, 'hours').startOf('hour');
          config = getQueryConfig('fifteen_minutes', mediaType, startTimeStamp, endTimeStamp);
          dataPromise = getStats(reportName, config)
            .then(function (response) {
              if (reportName === 'all_user_stats') {
                var reportingUserWithUserID = _.filter(response.data.data, function (userData) {
                  return userData.userId;
                });
                return downSampleByUserId(reportingUserWithUserID);
              } else {
                var localTimeData = downSampleByHour(response.data.data, isSnapshot);
                return fillEmptyData(
                  (moment.range(startTimeStamp.add(1, 'hours').toDate(), endTimeStamp.toDate())),
                  'h', localTimeData, hourFormat, false);
              }
            });
          break;

        // yesterday
        case 1:
          startTimeStamp = moment().subtract(1, 'days').startOf('day');
          endTimeStamp = moment().startOf('day');
          config = getQueryConfig('fifteen_minutes', mediaType, startTimeStamp, endTimeStamp);
          dataPromise = getStats(reportName, config)
            .then(function (response) {
              if (reportName === 'all_user_stats') {
                var reportingUserWithUserID = _.filter(response.data.data, function (userData) {
                  return userData.userId;
                });
                return downSampleByUserId(reportingUserWithUserID);
              } else {
                var localTimeData = downSampleByHour(response.data.data);
                return fillEmptyData(
                  (moment.range(startTimeStamp.add(1, 'hours').toDate(), endTimeStamp.toDate())),
                  'h', localTimeData, hourFormat, false);
              }
            });
          break;

        // last week
        case 2:
          startTimeStamp = moment().subtract(7, 'days').startOf('day');
          endTimeStamp = moment().startOf('day');
          config = getQueryConfig('hourly', mediaType, startTimeStamp, endTimeStamp);
          dataPromise = getStats(reportName, config)
            .then(function (response) {
              if (reportName === 'all_user_stats') {
                var reportingUserWithUserID = _.filter(response.data.data, function (userData) {
                  return userData.userId;
                });
                return downSampleByUserId(reportingUserWithUserID);
              } else {
                var localTimeData = downSampleByDay(response.data.data);
                return fillEmptyData((moment.range(startTimeStamp.toDate(), endTimeStamp.toDate())),
                  'd', localTimeData, dayFormat, true);
              }
            });
          break;

        // last month
        case 3:
          endTimeStamp = moment().startOf('week');
          startTimeStamp = moment(endTimeStamp).subtract(28, 'days').startOf('day');
          config = getQueryConfig('daily', mediaType, startTimeStamp, endTimeStamp);
          dataPromise = getStats(reportName, config)
            .then(function (response) {
              if (reportName === 'all_user_stats') {
                var reportingUserWithUserID = _.filter(response.data.data, function (userData) {
                  return userData.userId;
                });
                return downSampleByUserId(reportingUserWithUserID);
              } else {
                var localTimeData = downSampleByWeek(response.data.data);
                return fillEmptyData((moment.range(startTimeStamp.toDate(), endTimeStamp.toDate())),
                  'w', localTimeData, dayFormat, true);
              }
            });
          break;

        // last 3 month
        case 4:
          startTimeStamp = moment().subtract(2, 'months').startOf('month');
          endTimeStamp = moment().startOf('day');
          config = getQueryConfig('daily', mediaType, startTimeStamp, endTimeStamp);
          dataPromise = getStats(reportName, config)
            .then(function (response) {
              if (reportName === 'all_user_stats') {
                var reportingUserWithUserID = _.filter(response.data.data, function (userData) {
                  return userData.userId;
                });
                return downSampleByUserId(reportingUserWithUserID);
              } else {
                var localTimeData = downSampleByMonth(response.data.data);
                return fillEmptyData((moment.range(startTimeStamp.toDate(), endTimeStamp.toDate())),
                  'M', localTimeData, monthFormat, false);
              }
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
          endTime: endTimeStamp.valueOf(),
        },
      };
    }

    function processGroupedStats(groupedStats, groupedBy, isSnapshot) {
      if (isSnapshot) return processGroupedStatsSnapshot(groupedStats);

      var reduceFunc;
      switch (groupedBy) {
        case 'hour':
          reduceFunc = reduceOrgStatsByHour;
          break;
        case 'day':
          reduceFunc = reduceOrgStatsByDay;
          break;
        case 'week':
          reduceFunc = reduceOrgStatsByWeek;
          break;
        case 'month':
          reduceFunc = reduceOrgStatsByMonth;
          break;
      }

      var downSampledStats = [];
      _.map(groupedStats, function (statsList) {
        var seggregatedData = _.partition(statsList, function (data) { return data.mediaType === 'chat'; });
        var chatData = _.head(seggregatedData);
        var webcallData = _.last(seggregatedData);
        var reducedList = _.reduce(statsList, reduceFunc, emptyOrgstats);
        reducedList.avgTaskWaitTime = (reducedList.avgTaskWaitTime / convertInMinutes);
        reducedList.avgTaskCloseTime = (reducedList.avgTaskCloseTime / convertInMinutes);
        reducedList.avgCsatScores = roundTwoDecimalPlaces(reducedList.avgCsatScores);
        reducedList.tasksAccepted = Math.max(reducedList.tasksOffered - reducedList.tasksMissed, 0);

        if (chatData.length > 0) {
          var reducedChatList = _.reduce(chatData, reduceFunc, emptyOrgstats);
          var reducedWebcallList = _.reduce(webcallData, reduceFunc, emptyOrgstats);
          reducedList.numChatTasksHandled = reducedChatList.numTasksHandledState;
          reducedList.numWebcallTasksHandled = reducedWebcallList.numTasksHandledState;
          reducedList.avgChatTaskCloseTime = (reducedChatList.avgTaskCloseTime / convertInMinutes);
          reducedList.avgWebcallTaskCloseTime = (reducedWebcallList.avgTaskCloseTime / convertInMinutes);
          reducedList.avgChatCsatScores = roundTwoDecimalPlaces(reducedChatList.avgCsatScores);
          reducedList.avgWebcallCsatScores = roundTwoDecimalPlaces(reducedWebcallList.avgCsatScores);
        }
        downSampledStats.push(reducedList);
      });

      return downSampledStats;
    }

    function processGroupedStatsSnapshot(groupedStats) {
      var downSampledStats = [];
      _.map(groupedStats, function (statsList) {
        var reducedList = _.reduce(statsList, reduceOrgSnapshotStatsByHour, emptyOrgstats);
        reducedList.numWorkingTasks = Math.max(0, reducedList.numWorkingTasks);
        reducedList.numPendingTasks = Math.max(0, reducedList.numPendingTasks);
        downSampledStats.push(reducedList);
      });

      return downSampledStats;
    }

    function downSampleByHour(data, isSnapshot) {
      var statsGroupedByHour = _.groupBy(data, function (stats) {
        return moment(stats.createdTime).toDate().getHours();
      });
      return processGroupedStats(statsGroupedByHour, 'hour', isSnapshot);
    }

    function downSampleByDay(data) {
      var statsGroupedByDay = _.groupBy(data, function (stats) {
        return moment(stats.createdTime).toDate().getDay();
      });

      return processGroupedStats(statsGroupedByDay, 'day');
    }

    function downSampleByWeek(data) {
      var statsGroupedByWeek = _.groupBy(data, function (stats) {
        return moment(stats.createdTime).week();
      });

      return processGroupedStats(statsGroupedByWeek, 'week');
    }

    function downSampleByMonth(data) {
      var statsGroupedByMonth = _.groupBy(data, function (stats) {
        return moment(stats.createdTime).toDate().getMonth();
      });

      return processGroupedStats(statsGroupedByMonth, 'month');
    }

    function updateWebcallDataPresent(reducedUserVal, dataObj) {
      dataObj.isWebcallDataPresent.isAvgCSATPresent = dataObj.isWebcallDataPresent.isAvgCSATPresent
        || Boolean(reducedUserVal.avgWebcallCsatScore);
      dataObj.isWebcallDataPresent.isAvgHandleTimePresent = dataObj.isWebcallDataPresent.isAvgHandleTimePresent
        || Boolean(reducedUserVal.avgWebcallHandleTime);
      dataObj.isWebcallDataPresent.isTotalHandledPresent = dataObj.isWebcallDataPresent.isTotalHandledPresent
        || Boolean(reducedUserVal.webcallTasksHandled);
    }

    function downSampleByUserId(data) {
      var statsGroupedByUserId = _.groupBy(data, function (stats) {
        return stats.userId;
      });
      var downSampledStatsByUserId = {
        data: [],
        isWebcallDataPresent: {
          isAvgCSATPresent: false,
          isAvgHandleTimePresent: false,
          isTotalHandledPresent: false,
        },
      };
      _.map(statsGroupedByUserId, function (statsList) {
        var reducedForUserId = _.reduce(statsList, reduceUserStats, emptyUserstats);
        reducedForUserId.avgHandleTime = calculateAvg(reducedForUserId.handleTime, reducedForUserId.tasksHandled);
        reducedForUserId.avgCsatScore = calculateAvg(reducedForUserId.totalCSAT, reducedForUserId.numCsatScores);
        reducedForUserId.avgWebcallHandleTime = calculateAvg(reducedForUserId.webcallHandleTime, reducedForUserId.webcallTasksHandled);
        reducedForUserId.avgWebcallCsatScore = calculateAvg(reducedForUserId.webcallTotalCSAT, reducedForUserId.webcallNumCsatScores);
        updateWebcallDataPresent(reducedForUserId, downSampledStatsByUserId);
        downSampledStatsByUserId.data.push(reducedForUserId);
      });
      _.map(downSampledStatsByUserId.data, function (stats) {
        stats.tasksAccepted = Math.max(stats.tasksOffered - stats.tasksMissed, 0);
      });
      return downSampledStatsByUserId;
    }

    function reduceUserStats(reducedResult, currentStats) {
      var clonedResult = _.clone(reducedResult);
      if (currentStats.mediaType === 'webcall') {
        clonedResult.webcallTasksHandled += currentStats.tasksHandled;
        clonedResult.webcallNumCsatScores += currentStats.numCsatScores;
        clonedResult.webcallHandleTime += currentStats.handleTime * currentStats.tasksHandled;
        clonedResult.webcallTotalCSAT += currentStats.avgCsatScore * currentStats.numCsatScores;
      } else {
        clonedResult.tasksHandled += currentStats.tasksHandled;
        clonedResult.numCsatScores += currentStats.numCsatScores;
        clonedResult.handleTime += currentStats.handleTime * currentStats.tasksHandled;
        clonedResult.totalCSAT += currentStats.avgCsatScore * currentStats.numCsatScores;
      }
      clonedResult.tasksOffered = reducedResult.tasksOffered + currentStats.tasksOffered;
      clonedResult.tasksMissed = reducedResult.tasksMissed + currentStats.tasksMissed;
      clonedResult.tasksAssigned = reducedResult.tasksAssigned + currentStats.tasksAssigned;
      clonedResult.userId = currentStats.userId;
      return clonedResult;
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
      resultStats.tasksOffered = stats1.tasksOffered + stats2.tasksOffered;
      resultStats.tasksMissed = stats1.tasksMissed + stats2.tasksMissed;
      resultStats.numCsatScores = stats1.numCsatScores + stats2.numCsatScores;
      resultStats.avgCsatScores = calculateOrgAverageCsat(stats1, stats2);
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

    function calculateAvg(total, count) {
      return count != 0 ? (total / count) : 0;
    }

    function calculateOrgAverageCsat(stats1, stats2) {
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

  module.exports = sunlightReportService;
})();
