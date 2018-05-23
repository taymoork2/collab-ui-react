// TODO: convert this file to TypeScript
(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .factory('AutoAttendantConfigService', AutoAttendantConfigService);

  /* @ngInject */
  function AutoAttendantConfigService($http, HuronConfig, Authinfo) {
    var authInfoOrgId = Authinfo.getOrgId();

    var service = {
      getCSConfig: getCSConfig,
      cesOnboard: cesOnboard,
    };

    return service;

    function getCSConfig() {
      var csConfigUrl = HuronConfig.getCesUrl() + '/customers/' + authInfoOrgId + '/config/csOnboardingStatus';
      return $http.get(csConfigUrl);
    }
    function cesOnboard() {
      var cesUrl = HuronConfig.getCesUrl() + '/cesonboard' + '/customer/' + authInfoOrgId + '/' + 'contextService';
      return $http.post(cesUrl);
    }
  }
})();
