(function () {
  'use strict';

  angular
    .module('core.trial')
    .factory('TrialContextService', TrialContextService);

  /* @ngInject */
  function TrialContextService($http, Config, UrlConfig) {
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
      return $http.post(_getServiceUrl(orgId));
    }

    function removeService(orgId) {
      return $http.delete(_getServiceUrl(orgId));
    }
  }
})();
