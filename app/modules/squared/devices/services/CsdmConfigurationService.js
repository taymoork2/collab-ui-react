(function () {
  'use strict';

  /* @ngInject  */
  function CsdmConfigurationService($http, Authinfo, UrlConfig) {
    var configUrl = UrlConfig.getLyraServiceUrl() + '/configuration/rules';

    function getRuleForPlace(cisUuid, key) {
      return $http.get(configUrl + '/organization/' + Authinfo.getOrgId() + '/accounts/' + cisUuid + '/' + key).then(function (res) {
        return res.data;
      });
    }

    function updateRuleForPlace(cisUuid, key, value) {
      return $http.put(configUrl + '/organization/' + Authinfo.getOrgId() + '/accounts/' + cisUuid + '/' + key, {
        value: value,
        enforced: false,
      });
    }

    return {
      getRuleForPlace: getRuleForPlace,
      updateRuleForPlace: updateRuleForPlace,
    };
  }

  angular
    .module('Squared')
    .service('CsdmConfigurationService', CsdmConfigurationService);

})();
