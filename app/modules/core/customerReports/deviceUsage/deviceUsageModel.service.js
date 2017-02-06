(function () {
  'use strict';

  angular
    .module('Core')
    .service('DeviceUsageModelService', DeviceUsageModelService);

    /* @ngInject */
  function DeviceUsageModelService(Authinfo, UrlConfig, $http, $q, $timeout, $log) {

    var localUrlBase = 'http://berserk.rd.cisco.com:8080/atlas-server/admin/api/v1/organization';
    var urlBase = UrlConfig.getAdminServiceUrl() + 'organization';
    var timeoutInMillis = 20000;

    function getModelsForRange(start, end, granularity, deviceCategories, api) {
      var startDate = moment(start);
      var endDate = moment(end);
      var now = moment();

      if (startDate.isValid() && endDate.isValid() && startDate.isBefore(endDate) && endDate.isBefore(now)) {
        if (api === 'local') {
          var url = localUrlBase + '/' + Authinfo.getOrgId() + '/reports/device/models?';
          url = url + 'interval=' + granularity; // As long week and month is not implemented
          url = url + '&from=' + start + '&to=' + end;
          url = url + '&categories=' + deviceCategories.join();
        } else {
          url = urlBase + '/' + Authinfo.getOrgId() + '/reports/device/models?';
          url = url + 'interval=' + granularity; // As long week and month is not implemented
          url = url + '&from=' + start + '&to=' + end;
          url = url + '&categories=' + deviceCategories.join();
        }
        return requestModelsForRange(url);
      }
    }

    function requestModelsForRange(url) {
      var deferred = $q.defer();
      var timeout = {
        timeout: deferred.promise
      };
      $timeout(function () {
        deferred.resolve();
      }, timeoutInMillis);

      return $http.get(url, timeout).then(function (response) {
        if (response.data && response.data.items) {
          $log.info('requestModelsForRange', response.data.items);
          return response.data.items;
        }
      }, function (reject) {
        return $q.reject(analyseReject(reject));
      });
    }

    function analyseReject(reject) {
      if (reject.status === -1) {
        reject.statusText = 'Operation timed Out';
        reject.data = {
          message: 'Operation timed out'
        };
      }
      return reject;
    }

    return {
      getModelsForRange: getModelsForRange
    };
  }
}());
