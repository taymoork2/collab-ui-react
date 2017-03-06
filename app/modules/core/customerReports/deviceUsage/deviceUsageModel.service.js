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

    var modelsToValueMap = {
      out: {
        'MX200': ['MX200 G2'],
        'MX300': ['MX300 G2'],
        'MX700': ['MX700', 'MX700ST'],
        'MX800': ['MX800', 'MX800D', 'MX800ST'],
      },
      in: {
        'MX200 G2': 'MX200',
        'MX300 G2': 'MX300',
        'MX700ST': 'MX700',
        'MX800ST': 'MX800',
        'MX800D': 'MX800',
      },
    };

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
        timeout: deferred.promise,
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
          message: 'Operation timed out',
        };
      }
      return reject;
    }

    function mapModelsIn(items) {
      var mapped = _.chain(items).map(function (item) {
        if (modelsToValueMap.in[item.model]) {
          item.model = modelsToValueMap.in[item.model];
        }
        return item;
      }).uniqBy('model').value();
      //$log.info('mapModelsIn', mapped);
      return mapped;
    }

    function mapModelsOut(items) {
      //$log.info('mapModelsOut: items', items);
      var mapped = [];
      _.each(items, function (item) {
        if (modelsToValueMap.out[item.value]) {
          _.each(modelsToValueMap.out[item.value], function (value) {
            mapped.push({
              label: value,
              value: value,
              isSelected: item.isSelected,
            });
          });
        } else {
          mapped.push(item);
        }
      });
      //$log.info('mapModelsOut', mapped);
      return mapped;
    }

    return {
      getModelsForRange: getModelsForRange,
      mapModelsOut: mapModelsOut,
      mapModelsIn: mapModelsIn,
    };
  }
}());
