(function () {
  'use strict';

  /* @ngInject */
  function HelpdeskLogService($q, LogService, HelpdeskMockData, HelpdeskService) {

    function searchLogs(term, _searchOptions) {
      if (HelpdeskService.useMock()) {
        return deferredResolve(findLastLog(HelpdeskMockData.logs.search));
      }
      var searchOptions = _.extend({
        timeSortOrder: 'descending',
        limit: 1,
      }, _searchOptions);
      return LogService.searchLogs(term, searchOptions);
    }

    function searchForLastPushedLog(term) {
      return searchLogs(term).then(function (response) {
        var metadataList = _.get(response, 'data.metadataList');
        if (_.size(metadataList)) {
          return cleanLogMetadata(metadataList[0]);
        }
        return $q.reject('NoLog');
      }).catch(function () {
        return $q.reject('NoLog');
      });
    }

    function getLastPushedLogForUser(uuid) {
      if (HelpdeskService.useMock()) {
        return deferredResolve(findLastLog(HelpdeskMockData.logs.search));
      }

      var deferred = $q.defer();
      // TODO (mipark2): revisit this after moving 'LogService.listLogs()' away from callback-style
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
      // TODO (mipark2): revisit this after moving 'LogService.downloadLog()' away from callback-style
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
      searchLogs: searchLogs,
      searchForLastPushedLog: searchForLastPushedLog,
      getLastPushedLogForUser: getLastPushedLogForUser,
      downloadLog: downloadLog,
      cleanLogMetadata: cleanLogMetadata,
    };

  }

  angular.module('Squared')
    .service('HelpdeskLogService', HelpdeskLogService);

}());
