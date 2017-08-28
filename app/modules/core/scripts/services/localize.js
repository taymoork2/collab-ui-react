(function () {
  'use strict';

  module.exports = angular.module('core.localize', [
    require('modules/core/scripts/services/utils'),
    require('modules/core/storage').default,
  ])
    .factory('Localize', Localize)
    .name;

  /* @ngInject */
  function Localize($translate, Utils, Authinfo, SessionStorage) {
    return {
      varTitle: function () {
        var customerOrgId = SessionStorage.get('customerOrgId');
        var partnerOrgId = SessionStorage.get('partnerOrgId');

        if (customerOrgId || partnerOrgId) {
          return Authinfo.getOrgName();
        } else if (Utils.isAdminPage()) {
          return $translate.instant('index.newAppTitle');
        } else {
          return $translate.instant('index.genericTitle');
        }
      },
    };
  }
})();
