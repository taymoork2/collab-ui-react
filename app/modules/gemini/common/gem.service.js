(function () {
  'use strict';

  angular
    .module('Gemini')
    .service('gemService', gemService);

  /* @ngInject */
  function gemService($http, UrlConfig, Authinfo, $translate) {
    var URL = {
      spData: UrlConfig.getGeminiUrl() + 'servicepartner',
      remedyTicket: UrlConfig.getGeminiUrl() + 'remedyTicket/customers/'
    };
    var service = {
      isAvops: isAvops,
      showError: showError,
      getSpData: getSpData,
      isServicePartner: isServicePartner,
      getCbgRemedyTicket: getCbgRemedyTicket
    };
    return service;

    function getSpData() {
      return $http.get(URL.spData).then(extractData);
    }

    function getCbgRemedyTicket(customerId) {
      var url = URL.remedyTicket + customerId + '/siteId/0/type/9';
      return $http.get(url).then(extractData);
    }

    function showError(errorCode) {
      var errors = $translate.instant('gemini.errorCode.' + errorCode);
      if (errors === 'gemini.errorCode.' + errorCode) {
        return $translate.instant('gemini.errorCode.genericError');
      }
      return errors;
    }

    function isAvops() {
      return Authinfo.getRoles().indexOf('Full_Admin') > -1;
    }

    function isServicePartner() {
      return Authinfo.getRoles().indexOf('PARTNER_ADMIN') > -1;
    }

    function extractData(response) {
      return response.data;
    }
  }
})();
