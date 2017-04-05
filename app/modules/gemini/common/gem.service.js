(function () {
  'use strict';

  angular
    .module('Gemini')
    .service('gemService', gemService);

  /* @ngInject */
  function gemService(GmHttpService, Authinfo, $translate) {
    var URL = {
      spData: 'servicepartner',
      remedyTicket: 'remedyTicket/customers/',
    };
    var data = {};
    var service = {
      isAvops: isAvops,
      showError: showError,
      getSpData: getSpData,
      setStorage: setStorage,
      getStorage: getStorage,
      getRemedyTicket: getRemedyTicket,
      isServicePartner: isServicePartner,
    };
    return service;

    function getSpData() {
      return GmHttpService.httpGet(URL.spData).then(extractData);
    }

    function getRemedyTicket(customerId, type) {
      var url = URL.remedyTicket + customerId + '/siteId/0/type/' + type;
      return GmHttpService.httpGet(url).then(extractData);
    }

    function showError(errorCode) {
      var errors = $translate.instant('gemini.errorCode.' + errorCode);
      if (errors === 'gemini.errorCode.' + errorCode) {
        return $translate.instant('gemini.errorCode.genericError');
      }
      return errors;
    }

    function isAvops() {
      return Authinfo.hasRole('Full_Admin');
    }

    function isServicePartner() {
      return Authinfo.hasRole('PARTNER_ADMIN');
    }

    function setStorage(key, val) {
      data[key] = val;
      return data[key];
    }

    function getStorage(key) {
      return data[key];
    }

    function extractData(response) {
      return response.data;
    }
  }
})();
