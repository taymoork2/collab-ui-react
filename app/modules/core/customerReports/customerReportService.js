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
    var contentShared = '/contentShared';
    var contentShareSizes = '/contentShareSizes';
    var customerView = '&isCustomerView=true';
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
    var contentSharedCancelPromise = null;
    var contentShareSizesCancelPromise = null;

    return {
      getActiveUserData: getActiveUserData,
      getAvgRoomData: getAvgRoomData,
      getFilesSharedData: getFilesSharedData
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
        activeUserData = adjustActiveUserData(response.data[0].data, filter);
        return;
      }).error(function (response, status) {
        activeUserData = returnErrorCheck(status, 'Active user data not returned for customer.', $translate.instant('activeUsers.overallActiveUserGraphError'), []);
        return;
      });
      promises.push(activeUserPromise);

      var mostActiveUserData = [];
      // var mostActiveUserPromise = getService(mostActiveUrl, mostActivePromise).success(function (response, status) {
      //   // TODO: Fill in actions to parse the data in the response
      //   return;
      // }).error(function (response, status) {
      //   mostActiveUserData = returnErrorCheck(status, 'Most active user data not returned for customer.', $translate.instant('activeUsers.mostActiveError'), []);
      //   return;
      // });
      // promises.push(mostActiveUserPromise);

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

    function adjustActiveUserData(activeData, filter) {
      var returnGraph = [];
      var emptyGraph = true;

      if (filter.value === 0) {
        for (var i = 6; i >= 0; i--) {
          returnGraph.push({
            modifiedDate: moment().tz(timezone).subtract(i + 1, 'day').format(dayFormat),
            totalRegisteredUsers: 0,
            activeUsers: 0,
            percentage: 0,
            colorOne: Config.chartColors.brandSuccessLight,
            colorTwo: Config.chartColors.brandSuccessDark,
            balloon: true
          });
        }
      } else if (filter.value === 1) {
        var dayOffset = parseInt(moment.tz(activeData[(activeData.length - 1)].date, timezone).format('e'));
        if (dayOffset >= 4) {
          dayOffset = 7 - dayOffset;
        } else {
          dayOffset = -dayOffset;
        }

        for (var x = 3; x >= 0; x--) {
          returnGraph.push({
            modifiedDate: moment().tz(timezone).startOf('week').subtract(dayOffset + (x * 7), 'day').format(dayFormat),
            totalRegisteredUsers: 0,
            activeUsers: 0,
            percentage: 0,
            colorOne: Config.chartColors.brandSuccessLight,
            colorTwo: Config.chartColors.brandSuccessDark,
            balloon: true
          });
        }
      } else {
        for (var y = 2; y >= 0; y--) {
          returnGraph.push({
            modifiedDate: moment().tz(timezone).subtract(y, 'month').startOf('month').format(monthFormat),
            totalRegisteredUsers: 0,
            activeUsers: 0,
            percentage: 0,
            colorOne: Config.chartColors.brandSuccessLight,
            colorTwo: Config.chartColors.brandSuccessDark,
            balloon: true
          });
        }
      }

      angular.forEach(activeData, function (item, index, activeArray) {
        var date = moment.tz(item.date, timezone).format(dayFormat);
        if (filter.value === 2) {
          date = moment.tz(item.date, timezone).format(monthFormat);
        }

        var activeUsers = parseInt(item.details.activeUsers);
        var totalRegisteredUsers = parseInt(item.details.totalRegisteredUsers);

        // temporary fix for when totalRegisteredUsers equals -1 due to errors recording the number 
        if (totalRegisteredUsers < 0) {
          var previousTotal = 0;
          var nextTotal = 0;
          if (index !== 0) {
            previousTotal = parseInt(activeArray[index - 1].details.totalRegisteredUsers);
          }
          if (index < (activeArray.length - 1)) {
            nextTotal = parseInt(activeArray[index + 1].details.totalRegisteredUsers);
          }

          if (previousTotal < activeUsers && nextTotal < activeUsers) {
            totalRegisteredUsers = activeUsers;
          } else if (previousTotal > nextTotal) {
            totalRegisteredUsers = previousTotal;
          } else {
            totalRegisteredUsers = nextTotal;
          }
        }

        if (activeUsers !== 0 || totalRegisteredUsers !== 0) {
          for (var i = 0; i < returnGraph.length; i++) {
            if (returnGraph[i].modifiedDate === date) {
              returnGraph[i].totalRegisteredUsers = totalRegisteredUsers;
              returnGraph[i].activeUsers = activeUsers;
              returnGraph[i].percentage = Math.round((activeUsers / totalRegisteredUsers) * 100);
              emptyGraph = false;
              break;
            }
          }
        }
      });

      if (!emptyGraph) {
        return returnGraph;
      } else {
        return [];
      }
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
      var groupRoomsUrl = urlBase + timechart + groupUrl + query + customerView;
      var oneToOneRoomsUrl = urlBase + timechart + oneToOneUrl + query + customerView;
      var avgRoomsUrl = urlBase + timechart + avgUrl + query + customerView;

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
        if (groupData !== ABORT && oneToOneData !== ABORT && avgData !== ABORT) {
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
            balloon: true,
            groupRooms: 0,
            oneToOneRooms: 0,
            avgRooms: 0
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
            balloon: true,
            groupRooms: 0,
            oneToOneRooms: 0,
            avgRooms: 0
          });
        }
      } else {
        for (var y = 2; y >= 0; y--) {
          returnGraph.push({
            modifiedDate: moment().tz(timezone).subtract(y, 'month').format(monthFormat),
            balloon: true,
            groupRooms: 0,
            oneToOneRooms: 0,
            avgRooms: 0
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

    function getFilesSharedData(filter) {
      // cancel any currently running jobs
      if (contentSharedCancelPromise !== null && angular.isDefined(contentSharedCancelPromise)) {
        contentSharedCancelPromise.resolve(ABORT);
      }
      if (contentShareSizesCancelPromise !== null && angular.isDefined(contentShareSizesCancelPromise)) {
        contentShareSizesCancelPromise.resolve(ABORT);
      }
      contentSharedCancelPromise = $q.defer();
      contentShareSizesCancelPromise = $q.defer();

      var promises = [];
      var query = getQuery(filter);
      var contentSharedUrl = urlBase + timechart + contentShared + query + customerView;
      var contentShareSizesUrl = urlBase + timechart + contentShareSizes + query + customerView;

      var contentSharedData = [];
      var contentSharedPromise = getService(contentSharedUrl, contentSharedCancelPromise).success(function (response, status) {
        contentSharedData = response.data;
        return;
      }).error(function (response, status) {
        contentSharedData = returnErrorCheck(status, 'Shared content data not returned for customer.', $translate.instant('filesShared.contentSharedError'), []);
        return;
      });
      promises.push(contentSharedPromise);

      var contentShareSizesData = [];
      var contentShareSizesPromise = getService(contentShareSizesUrl, contentShareSizesCancelPromise).success(function (response, status) {
        contentShareSizesData = response.data;
        return;
      }).error(function (response, status) {
        contentShareSizesData = returnErrorCheck(status, 'Shared content data sizes not returned for customer.', $translate.instant('filesShared.contentShareSizesDataError'), []);
        return;
      });
      promises.push(contentShareSizesPromise);

      return $q.all(promises).then(function () {
        if (contentSharedData !== ABORT && contentShareSizesData !== ABORT) {
          return combineFilesShared(contentSharedData, contentShareSizesData, filter);
        } else {
          return ABORT;
        }
      }, function () {
        if (contentSharedData !== ABORT && contentShareSizesData !== ABORT) {
          return combineFilesShared(contentSharedData, contentShareSizesData, filter);
        } else {
          return ABORT;
        }
      });
    }

    function combineFilesShared(contentSharedData, contentShareSizesData, filter) {
      var returnGraph = [];
      var emptyGraph = true;
      if (filter.value === 0) {
        for (var i = 7; i >= 1; i--) {
          returnGraph.push({
            modifiedDate: moment().tz(timezone).subtract(i, 'day').format(dayFormat),
            balloon: true,
            contentShared: 0,
            contentShareSizes: 0,
            color: Config.chartColors.brandSuccess
          });
        }
      } else if (filter.value === 1) {
        var dayOffset = parseInt(moment.tz(contentSharedData[contentSharedData.length - 1].date, timezone).format('e'));
        if (contentSharedData[contentSharedData.length - 1] < contentShareSizesData[contentShareSizesData.length - 1]) {
          dayOffset = parseInt(moment.tz(contentShareSizesData[contentShareSizesData.length - 1].date, timezone).format('e'));
        }
        if (dayOffset >= 4) {
          dayOffset = 7 - dayOffset;
        } else {
          dayOffset = -dayOffset;
        }

        for (var x = 3; x >= 0; x--) {
          returnGraph.push({
            modifiedDate: moment().tz(timezone).startOf('week').subtract(dayOffset + (x * 7), 'day').format(dayFormat),
            balloon: true,
            contentShared: 0,
            contentShareSizes: 0,
            color: Config.chartColors.brandSuccess
          });
        }
      } else {
        for (var y = 2; y >= 0; y--) {
          returnGraph.push({
            modifiedDate: moment().tz(timezone).subtract(y, 'month').format(monthFormat),
            balloon: true,
            contentShared: 0,
            contentShareSizes: 0,
            color: Config.chartColors.brandSuccess
          });
        }
      }

      angular.forEach(contentSharedData, function (contentItem, contentIndex, contentArray) {
        var modDate = moment.tz(contentItem.date, timezone).format(dayFormat);
        if (filter.value === 2) {
          modDate = moment.tz(contentItem.date, timezone).format(monthFormat);
        }

        for (var index = 0; index < returnGraph.length; index++) {
          var returnItem = returnGraph[index];

          if (returnItem.modifiedDate === modDate) {
            returnItem.contentShared = parseInt(contentItem.count);
            if (returnItem.contentShared !== 0) {
              emptyGraph = false;
            }
            break;
          }
        }
      });

      if (!emptyGraph) {
        angular.forEach(contentShareSizesData, function (shareItem, shareIndex, shareArray) {
          var modDate = moment.tz(shareItem.date, timezone).format(dayFormat);
          if (filter.value === 2) {
            modDate = moment.tz(shareItem.date, timezone).format(monthFormat);
          }

          for (var index = 0; index < returnGraph.length; index++) {
            var returnItem = returnGraph[index];

            if (returnItem.modifiedDate === modDate) {
              returnItem.contentShareSizes = parseFloat(shareItem.count).toFixed(2);
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
        return '?&intervalCount=7&intervalType=day&spanCount=1&spanType=day&cache=' + cacheValue;
      } else if (filter.value === 1) {
        return '?&intervalCount=31&intervalType=day&spanCount=7&spanType=day&cache=' + cacheValue;
      } else {
        return '?&intervalCount=3&intervalType=month&spanCount=1&spanType=month&cache=' + cacheValue;
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
