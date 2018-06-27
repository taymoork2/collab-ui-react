(function () {
  'use strict';

  module.exports = TrialContextService;

  /* @ngInject */
  function TrialContextService($http, $q, Authinfo, Config, LogMetricsService, UrlConfig) {
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
      return $q.all([$http.get(_getAdminServiceUrl(orgId)), $http.get([_getContextCcfsOnboardUrl(), '/', orgId].join(''), { headers: { 'x-cisco-cacheCiInfo': false } })])
        .then(function (results) {
          return results[0].status === 200 && results[1].status === 200;
        })
        .catch(function () {
          return false;
        });
    }

    function getPatchAdminUrl(orgId, userId, customerOrgId) {
      var url = UrlConfig.getAdminServiceUrl() + 'organizations/' + orgId + '/users/' + userId + '/actions/configureCustomerAdmin/invoke?customerOrgId=' + customerOrgId;
      return url;
    }

    // Here we suppose to call PartnerService.updateOrgForCustomerView,
    // but got error during runtime: Circular dependency found: Analytics <- PartnerService <- TrialContextService <- TrialService <- Analytics
    // So we call the api specifically here to work around this issue.
    function patchAdmin(Authinfo, customerOrgId, isNewTrial) {
      if (isNewTrial || (!isNewTrial && _.includes(Authinfo.getManagedOrgs(), customerOrgId))) {
        return $q.resolve();
      }
      return $http.post(getPatchAdminUrl(Authinfo.getOrgId(), Authinfo.getUserId(), customerOrgId));
    }

    function onboardCustomerOrg(customerOrgId, isNewTrial) {
      if (isNewTrial) {
        return $http.post(_getContextCcfsOnboardUrl(), { orgId: customerOrgId });
      }
      return $http.get([_getContextCcfsOnboardUrl(), '/', customerOrgId].join(''), { headers: { 'x-cisco-cacheCiInfo': false } })
        .then(function (response) {
          return response;
        })
        .catch(function (response) {
          if (response.status !== 404) {
            return $q.reject();
          }
          if (response.status === 404) {
            return $http.post(_getContextCcfsOnboardUrl(), { orgId: customerOrgId });
          }
        });
    }

    function addService(orgId, isNewTrial) {
      return patchAdmin(Authinfo, orgId, isNewTrial)
        .then(function () {
          return $http.post(_getAdminServiceUrl(orgId));
        })
        .then(function () {
          return onboardCustomerOrg(orgId, isNewTrial);
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
