(function () {
  'use strict';

  angular.module('Core')
    .service('CustomerReportService', CustomerReportService);

  /* @ngInject */
  function CustomerReportService($http, $translate, $q, Config, Authinfo, Notification, Log) {
    var urlBase = Config.getAdminServiceUrl() + 'organization/' + Authinfo.getOrgId() + '/reports/';
    var detailed = 'detailed';
    var topn = 'topn';
    var activeUserUrl = '/activeUsers';
    var dateFormat = "MMM DD, YYYY";
    var dayFormat = "MMM DD";
    var monthFormat = "MMMM";
    var timezone = "Etc/GMT";
    var cacheValue = (parseInt(moment.utc().format('H')) >= 8);

    var timeFilter = null;

    // Promise Tracking
    var ABORT = 'ABORT';
    var TIMEOUT = 'TIMEOUT';

    // TODO: add promises to allow user to abort the current data requests when the filters are changed

    return {
      getActiveUserData: getActiveUserData
    };

    function getActiveUserData(filter) {
      var promises = [];
      var query = getQuery(filter);
      var activeUrl = urlBase + detailed + activeUserUrl + query;

      var activeUserData = [];
      var activeUserPromise = getService(activeUrl, null).success(function (response, status) {
        // TODO: Fill in actions to parse the data in the response
        return;
      }).error(function (response, status) {
        activeUserData = returnErrorCheck(status, 'Active user data not returned for customer.', $translate.instant('activeUsers.overallActiveUserGraphError'), []);
        return;
      });
      promises.push(activeUserPromise);

      // TODO: add call to retrieve most active user data

      return $q.all(promises).then(function () {
        if (activeUserData !== ABORT) {
          return {
            activeUserGraph: activeUserData,
            mostActiveUserData: []
          };
        } else {
          return ABORT;
        }
      }, function () {
        if (activeUserData !== ABORT) {
          return {
            activeUserGraph: activeUserData,
            mostActiveUserData: []
          };
        } else {
          return ABORT;
        }
      });
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
        return $http.get(urlBase + url);
      } else {
        return $http.get(urlBase + url, {
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
