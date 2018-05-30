(function () {
  'use strict';

  module.exports = angular.module('core.accountOrgService', [
    require('modules/core/config/urlConfig'),
  ])
    .service('AccountOrgService', AccountOrgService)
    .name;

  /* @ngInject */
  function AccountOrgService($http, UrlConfig) {
    var accountUrl = UrlConfig.getAdminServiceUrl();

    var service = {
      getAccount: getAccount,
      getServices: getServices,
      addMessengerInterop: addMessengerInterop,
      deleteMessengerInterop: deleteMessengerInterop,
    };

    return service;

    function getServicesUrl(org) {
      var url = accountUrl + 'organizations/' + org + '/services';

      return url;
    }

    function getAccount(org) {
      var url = accountUrl + 'organization/' + org + '/accounts';

      return $http.get(url);
    }

    function getServices(org, filter) {
      var url = getServicesUrl(org);
      if (!_.isUndefined(filter) && !_.isNull(filter)) {
        url += '?filter=' + filter;
      }

      return $http.get(url);
    }

    function addMessengerInterop(org) {
      var url = getServicesUrl(org) + '/messengerInterop';
      var request = {};

      return $http.post(url, request);
    }

    function deleteMessengerInterop(org) {
      var url = getServicesUrl(org) + '/messengerInterop';

      return $http.delete(url);
    }
  }
})();
