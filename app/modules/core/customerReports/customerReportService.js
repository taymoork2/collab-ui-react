(function () {
  'use strict';

  angular.module('Core')
    .service('CustomerReportService', CustomerReportService);

  /* @ngInject */
  function CustomerReportService($http, $translate, $q, Config, Authinfo, Notification, Log) {
    var urlBase = Config.getAdminServiceUrl() + 'organization/' + Authinfo.getOrgId() + '/reports/';
    var detailed = 'detailed';
    var topn = 'topn';
    var timechart = 'timeCharts';
    var activeUserUrl = '/activeUsers';
    var groupUrl = '/conversations';
    var oneToOneUrl = '/convOneOnOne';
    var avgUrl = '/avgConversations';
    var dateFormat = "MMM DD, YYYY";
    var dayFormat = "MMM DD";
    var monthFormat = "MMMM";
    var timezone = "Etc/GMT";
    var cacheValue = (parseInt(moment.utc().format('H')) >= 8);

    var timeFilter = null;

    // Promise Tracking
    var ABORT = 'ABORT';
    var TIMEOUT = 'TIMEOUT';
    var activePromse = null;
    var mostActivePromise = null;
    var groupCancelPromise = null;
    var oneToOneCancelPromise = null;
    var avgCancelPromise = null;

    return {
      getActiveUserData: getActiveUserData,
      getAvgRoomData: getAvgRoomData
    };

    function getActiveUserData(filter) {
      // cancel any currently running jobs
      if (activePromse !== null && angular.isDefined(activePromse)) {
        activePromse.resolve(ABORT);
      }
      if (mostActivePromise !== null && angular.isDefined(mostActivePromise)) {
        mostActivePromise.resolve(ABORT);
      }
      activePromse = $q.defer();
      mostActivePromise = $q.defer();

      var promises = [];
      var query = getQuery(filter);
      var activeUrl = urlBase + detailed + activeUserUrl + query;
      var mostActiveUrl = urlBase + topn + activeUserUrl + query;

      var activeUserData = [];
      var activeUserPromise = getService(activeUrl, activePromse).success(function (response, status) {
        // TODO: Fill in actions to parse the data in the response
        return;
      }).error(function (response, status) {
        activeUserData = returnErrorCheck(status, 'Active user data not returned for customer.', $translate.instant('activeUsers.overallActiveUserGraphError'), []);
        return;
      });
      promises.push(activeUserPromise);

      var mostActiveUserData = [];
      var mostActiveUserPromise = getService(mostActiveUrl, mostActivePromise).success(function (response, status) {
        // TODO: Fill in actions to parse the data in the response
        return;
      }).error(function (response, status) {
        mostActiveUserData = returnErrorCheck(status, 'Most active user data not returned for customer.', $translate.instant('activeUsers.mostActiveError'), []);
        return;
      });
      promises.push(mostActiveUserPromise);

      return $q.all(promises).then(function () {
        if (activeUserData !== ABORT) {
          return {
            activeUserGraph: activeUserData,
            mostActiveUserData: mostActiveUserData
          };
        } else {
          return ABORT;
        }
      }, function () {
        if (activeUserData !== ABORT) {
          return {
            activeUserGraph: activeUserData,
            mostActiveUserData: mostActiveUserData
          };
        } else {
          return ABORT;
        }
      });
    }

    function getAvgRoomData(filter) {
      // cancel any currently running jobs
      if (groupCancelPromise !== null && angular.isDefined(groupCancelPromise)) {
        groupCancelPromise.resolve(ABORT);
      }
      if (oneToOneCancelPromise !== null && angular.isDefined(oneToOneCancelPromise)) {
        oneToOneCancelPromise.resolve(ABORT);
      }
      if (avgCancelPromise !== null && angular.isDefined(avgCancelPromise)) {
        avgCancelPromise.resolve(ABORT);
      }
      groupCancelPromise = $q.defer();
      oneToOneCancelPromise = $q.defer();
      avgCancelPromise = $q.defer();

      var promises = [];
      var query = getQuery(filter);
      var groupRoomsUrl = urlBase + timechart + groupUrl + query;
      var oneToOneRoomsUrl = urlBase + timechart + oneToOneUrl + query;
      var avgRoomsUrl = urlBase + timechart + avgUrl + query;

      var groupData = [];
      var groupPromise = getService(groupRoomsUrl, groupCancelPromise).success(function (response, status) {
        groupData = response.data;
        return;
      }).error(function (response, status) {
        groupData = returnErrorCheck(status, 'Group rooms data not returned for customer.', $translate.instant('avgRooms.groupError'), []);
        return;
      });
      promises.push(groupPromise);

      var oneToOneData = [];
      var oneToOnePromise = getService(oneToOneRoomsUrl, oneToOneCancelPromise).success(function (response, status) {
        oneToOneData = response.data;
        return;
      }).error(function (response, status) {
        oneToOneData = returnErrorCheck(status, 'One to One rooms data not returned for customer.', $translate.instant('avgRooms.oneToOneError'), []);
        return;
      });
      promises.push(oneToOnePromise);

      var avgData = [];
      var avgPromise = getService(avgRoomsUrl, avgCancelPromise).success(function (response, status) {
        avgData = response.data;
        return;
      }).error(function (response, status) {
        avgData = returnErrorCheck(status, 'Average rooms per user data not returned for customer.', $translate.instant('avgRooms.avgError'), []);
        return;
      });
      promises.push(avgPromise);

      return $q.all(promises).then(function () {
        if (groupData !== ABORT && oneToOneData !== ABORT && avgData !== ABORT) {
          return combineAvgRooms(groupData, oneToOneData, avgData, filter);
        } else {
          return ABORT;
        }
      }, function () {
        if (groupData !== ABORT && oneToOneData !== ABORT) {
          return combineAvgRooms(groupData, oneToOneData, avgData, filter);
        } else {
          return ABORT;
        }
      });
    }

    function combineAvgRooms(groupData, oneToOneData, avgData, filter) {
      var returnGraph = [];
      var emptyGraph = true;
      if (filter.value === 0) {
        for (var i = 7; i >= 1; i--) {
          returnGraph.push({
            modifiedDate: moment().tz(timezone).subtract(i, 'day').format(dayFormat),
            balloon: true
          });
        }
      } else if (filter.value === 1) {
        var dayOffset = parseInt(moment.tz(groupData[groupData.length - 1].date, timezone).format('e'));
        if (groupData[groupData.length - 1] < oneToOneData[oneToOneData.length - 1]) {
          dayOffset = parseInt(moment.tz(oneToOneData[oneToOneData.length - 1].date, timezone).format('e'));
        } else if (groupData[groupData.length - 1] < avgData[avgData.length - 1]) {
          dayOffset = parseInt(moment.tz(avgData[avgData.length - 1].date, timezone).format('e'));
        }
        if (dayOffset >= 4) {
          dayOffset = 7 - dayOffset;
        } else {
          dayOffset = -dayOffset;
        }

        for (var x = 3; x >= 0; x--) {
          returnGraph.push({
            modifiedDate: moment().tz(timezone).startOf('week').subtract(dayOffset + (x * 7), 'day').format(dayFormat),
            balloon: true
          });
        }
      } else {
        for (var y = 2; y >= 0; y--) {
          returnGraph.push({
            modifiedDate: moment().tz(timezone).subtract(y, 'month').format(monthFormat),
            balloon: true
          });
        }
      }

      angular.forEach(groupData, function (groupItem, groupIndex, groupArray) {
        var modDate = moment.tz(groupItem.date, timezone).format(dayFormat);
        if (filter.value === 2) {
          modDate = moment.tz(groupItem.date, timezone).format(monthFormat);
        }

        for (var index = 0; index < returnGraph.length; index++) {
          var returnItem = returnGraph[index];

          if (returnItem.modifiedDate === modDate) {
            returnItem.groupRooms = parseInt(groupItem.count);
            if (returnItem.groupRooms !== 0) {
              emptyGraph = false;
            }
            break;
          }
        }
      });

      angular.forEach(oneToOneData, function (oneToOneItem, oneToOneIndex, oneToOneArray) {
        var modDate = moment.tz(oneToOneItem.date, timezone).format(dayFormat);
        if (filter.value === 2) {
          modDate = moment.tz(oneToOneItem.date, timezone).format(monthFormat);
        }

        for (var index = 0; index < returnGraph.length; index++) {
          var returnItem = returnGraph[index];

          if (returnItem.modifiedDate === modDate) {
            returnItem.oneToOneRooms = parseInt(oneToOneItem.count);
            if (returnItem.oneToOneRooms !== 0) {
              emptyGraph = false;
            }
            break;
          }
        }
      });

      if (!emptyGraph) {
        angular.forEach(avgData, function (avgItem, avgIndex, avgArray) {
          var modDate = moment.tz(avgItem.date, timezone).format(dayFormat);
          if (filter.value === 2) {
            modDate = moment.tz(avgItem.date, timezone).format(monthFormat);
          }

          for (var index = 0; index < returnGraph.length; index++) {
            var returnItem = returnGraph[index];

            if (returnItem.modifiedDate === modDate) {
              returnItem.avgRooms = parseFloat(avgItem.count).toFixed(2);
              break;
            }
          }
        });

        return returnGraph;
      } else {
        return [];
      }

    }

    function getQuery(filter) {
      if (filter.value === 0) {
        return '?&intervalCount=7&intervalType=day&spanCount=1&spanType=day&cache=' + cacheValue + '&isCustomerView=true';
      } else if (filter.value === 1) {
        return '?&intervalCount=31&intervalType=day&spanCount=7&spanType=day&cache=' + cacheValue + '&isCustomerView=true';
      } else {
        return '?&intervalCount=3&intervalType=month&spanCount=1&spanType=month&cache=' + cacheValue + '&isCustomerView=true';
      }
    }

    function getService(url, canceler) {
      if (canceler === null || angular.isUndefined(canceler)) {
        return $http.get(url);
      } else {
        return $http.get(url, {
          timeout: canceler.promise
        });
      }
    }

    function returnErrorCheck(error, debugMessage, message, returnItem) {
      if (error.status === 401 || error.status === 403) {
        Log.debug('User not authorized to access reports.  Status: ' + error.status);
        Notification.notify([$translate.instant('reportsPage.unauthorizedError')], 'error');
        return returnItem;
      } else if (error.status !== 0) {
        Log.debug(debugMessage + '  Status: ' + error.status + ' Response: ' + error.message);
        Notification.notify([message], 'error');
        return returnItem;
      } else if (error.config.timeout.$$state.status === 0) {
        Log.debug(debugMessage + '  Status: ' + error.status);
        Notification.notify([message], 'error');
        return returnItem;
      } else {
        return ABORT;
      }
    }

  }
})();
