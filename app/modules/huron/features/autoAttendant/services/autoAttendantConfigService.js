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
      getConfig: getConfig,
    };

    return service;

    /////////////////////

    function getConfig() {
      var aaConfigUrl = HuronConfig.getCesUrl() + '/customers/' + authInfoOrgId + '/config/csOnboardingStatus';
      return $http.get(aaConfigUrl);
    }
  }
})();
