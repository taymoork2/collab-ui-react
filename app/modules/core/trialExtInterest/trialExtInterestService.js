(function () {
  'use strict';

  angular
    .module('Core')
    .service('TrialExtInterestService', TrialExtInterestService);

  /* @ngInject */
  function TrialExtInterestService($http, UrlConfig) {

    var trialExtInterestUrl = UrlConfig.getAdminServiceUrl() + 'email';

    return {
      notifyPartnerAdmin: function (encryptedParam) {
        var trialExtInterestData = {
          'type': '15',
          'eqp': {
            'encryptedQueryString': encryptedParam
          }
        };
        return $http.post(trialExtInterestUrl, trialExtInterestData);
      }
    };
  }
})();
