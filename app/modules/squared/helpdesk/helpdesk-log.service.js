(function () {
  'use strict';

  /* @ngInject */
  function HelpdeskLogService($q, LogService, HelpdeskMockData, HelpdeskService) {

    function searchForLastPushedLog(term) {
      if (HelpdeskService.useMock()) {
        return deferredResolve(findLastLog(HelpdeskMockData.logs.search));
      }
      var deferred = $q.defer();
      // request backend to return logs sorted by descending timestamp, and only one
      LogService.searchLogs(term, 'descending', 1, function (data) {
        if (data.success) {
          if (data.metadataList && data.metadataList.length > 0) {
            deferred.resolve(cleanLogMetadata(data.metadataList[0]));
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
      return cleanLogMetadata(_.last(sorted));
    }

    function cleanLogMetadata(logMetadata) {
      var platform = '';
      if (logMetadata.platform) {
        platform = _.last(logMetadata.platform.split('-')) || platform;
      }
      return {
        timestamp: logMetadata.timestamp,
        filename: logMetadata.filename,
        platform: platform,
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
      downloadLog: downloadLog,
    };

  }

  angular.module('Squared')
    .service('HelpdeskLogService', HelpdeskLogService);

}());
