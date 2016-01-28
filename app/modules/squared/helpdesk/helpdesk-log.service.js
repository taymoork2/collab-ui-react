(function () {
  'use strict';

  /*ngInject*/
  function HelpdeskLogService($q, LogService) {

    function searchForLastPushedLog(term) {
      var deferred = $q.defer();

      LogService.searchLogs(term, function (data, status) {
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
      var deferred = $q.defer();
      LogService.listLogs(uuid, function (data, status) {
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
      var deferred = $q.defer();
      LogService.downloadLog(filename, function (data, status) {
        if (data.success) {
          deferred.resolve(data.tempURL);
        } else {
          deferred.reject("No logfile available");
        }
      });
      return deferred.promise;
    }

    function findLastLog(metadataList) {
      var lastLog = _.chain(metadataList).sortBy(metadataList, function (meta) {
        return new Date(meta.timestamp);
      }).last().value();
      return {
        timestamp: lastLog.timestamp,
        filename: lastLog.filename
      };
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
