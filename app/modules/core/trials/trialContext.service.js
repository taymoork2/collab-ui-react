(function () {
  'use strict';

  angular
    .module('core.trial')
    .factory('TrialContextService', TrialContextService);

  /* @ngInject */
  function TrialContextService($http, $q, Config, UrlConfig, LogMetricsService) {
    var _trialData;
    var service = {
      getData: getData,
      reset: reset,
      trialHasService: trialHasService,
      addService: addService,
      removeService: removeService
    };

    return service;

    ////////////////

    function getData() {
      return _trialData || _makeTrial();
    }

    function reset() {
      _makeTrial();
    }

    function _makeTrial() {
      var defaults = {
        type: Config.offerTypes.context,
        enabled: false
      };

      _trialData = angular.copy(defaults);
      return _trialData;
    }

    function _getServiceUrl(orgId) {
      return [UrlConfig.getAdminServiceUrl(), 'organizations/', orgId, '/services/contactCenterContext'].join('');
    }

    function _logMetric(response, message, eventType) {
      LogMetricsService.logMetrics(message, LogMetricsService.getEventType(eventType), LogMetricsService.getEventAction('buttonClick'), response.status, moment(), 1);
    }

    function trialHasService(orgId) {
      return $http.get(_getServiceUrl(orgId))
        .then(function () {
          return true;
        })
        .catch(function () {
          return false;
        });
    }

    function addService(orgId) {
      return $http.post(_getServiceUrl(orgId))
        .then(function (response) {
          _logMetric(response, 'Successfully enabled Context Service', 'contextServiceEnabled');
          return response;
        })
        .catch(function (response) {
          _logMetric(response, 'Failed to enable Context Service', 'contextServiceEnabled');
          return $q.reject(response);
        });

    }

    function removeService(orgId) {
      return $http.delete(_getServiceUrl(orgId))
        .then(function (response) {
          _logMetric(response, 'Successfully disabled Context Service', 'contextServiceDisabled');
          return response;
        })
        .catch(function (response) {
          _logMetric(response, 'Failed to disable Context Service', 'contextServiceDisabled');
          return $q.reject(response);
        });
    }
  }
})();
