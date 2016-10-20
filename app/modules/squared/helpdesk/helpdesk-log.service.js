(function () {
  'use strict';

  /* @ngInject */
  function HelpdeskLogService($q, LogService, HelpdeskMockData, HelpdeskService) {

    function searchForLastPushedLog(term) {
      if (HelpdeskService.useMock()) {
        return deferredResolve(findLastLog(HelpdeskMockData.logs.search));
      }
      var deferred = $q.defer();
      LogService.searchLogs(term, function (data) {
        if (data.success) {
          if (data.metadataList && data.metadataList.length > 0) {
            deferred.resolve(findLastLog(data.metadataList));
          } else {
            deferred.reject("NoLog");
          }
        } else {
          deferred.reject("NoLog");
        }
      });
      return deferred.promise;
    }

    function getLastPushedLogForUser(uuid) {
      if (HelpdeskService.useMock()) {
        return deferredResolve(findLastLog(HelpdeskMockData.logs.search));
      }

      var deferred = $q.defer();
      LogService.listLogs(uuid, function (data) {
        if (data.success) {
          if (data.metadataList && data.metadataList.length > 0) {
            deferred.resolve(findLastLog(data.metadataList));
          } else {
            deferred.reject("NoLog");
          }
        } else {
          deferred.reject("NoLog");
        }
      });
      return deferred.promise;
    }

    function downloadLog(filename) {
      if (HelpdeskService.useMock()) {
        return deferredResolve(HelpdeskMockData.logs.download);
      }

      var deferred = $q.defer();
      LogService.downloadLog(filename, function (data) {
        if (data.success) {
          deferred.resolve(data.tempURL);
        } else {
          deferred.reject("No logfile available");
        }
      });
      return deferred.promise;
    }

    function findLastLog(metadataList) {
      var sorted = _.sortBy(metadataList, function (meta) {
        return new Date(meta.timestamp);
      });
      var lastLog = _.last(sorted);
      var platform = '';
      if (lastLog.platform) {
        platform = _.last(lastLog.platform.split('-')) || platform;
      }
      return {
        timestamp: lastLog.timestamp,
        filename: lastLog.filename,
        platform: platform
      };
    }

    function deferredResolve(resolved) {
      var deferred = $q.defer();
      deferred.resolve(resolved);
      return deferred.promise;
    }

    return {
      searchForLastPushedLog: searchForLastPushedLog,
      getLastPushedLogForUser: getLastPushedLogForUser,
      downloadLog: downloadLog
    };

  }

  angular.module('Squared')
    .service('HelpdeskLogService', HelpdeskLogService);

}());
