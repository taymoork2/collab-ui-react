(function () {
  'use strict';

  module.exports = TrialContextService;

  /* @ngInject */
  function TrialContextService($http, $q, Config, FeatureToggleService, LogMetricsService, UrlConfig) {
    var _trialData;
    var service = {
      getData: getData,
      reset: reset,
      trialHasService: trialHasService,
      addService: addService,
      removeService: removeService,
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
        enabled: false,
      };

      _trialData = _.cloneDeep(defaults);
      return _trialData;
    }

    function _getAdminServiceUrl(orgId) {
      return [UrlConfig.getAdminServiceUrl(), 'organizations/', orgId, '/services/contactCenterContext'].join('');
    }

    function _getContextCcfsOnboardUrl() {
      return [UrlConfig.getContextCcfsUrl(), '/onboard'].join('');
    }

    function _logMetric(response, message, eventType) {
      LogMetricsService.logMetrics(message, LogMetricsService.getEventType(eventType), LogMetricsService.getEventAction('buttonClick'), response.status, moment(), 1);
    }


    function trialHasService(orgId) {
      return $http.get(_getAdminServiceUrl(orgId))
        .then(function () {
          return true;
        })
        .catch(function () {
          return false;
        });
    }

    function addService(orgId) {
      return $http.post(_getAdminServiceUrl(orgId))
        .then(function (response) {
          return FeatureToggleService.supports(FeatureToggleService.features.atlasContextServiceOnboarding)
            .then(function (enabled) {
              if (enabled) {
                return $http.post(_getContextCcfsOnboardUrl(), { orgId: orgId });
              } else {
                return response;
              }
            });
        })
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
      return $http.delete(_getAdminServiceUrl(orgId))
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
