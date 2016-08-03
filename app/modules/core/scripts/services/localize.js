(function () {
  'use strict';

  module.exports = angular.module('core.localize', [
      require('modules/core/scripts/services/utils'),
      require('modules/core/scripts/services/sessionstorage'),
    ])
    .factory('Localize', Localize)
    .name;

  /* @ngInject */
  function Localize($filter, Utils, SessionStorage) {
    return {
      varTitle: function () {
        var currentOrgName = SessionStorage.get('customerOrgName');
        var partnerOrgName = SessionStorage.get('partnerOrgName');
        if (currentOrgName) {
          return currentOrgName;
        } else if (partnerOrgName) {
          return partnerOrgName;
        } else if (Utils.isAdminPage()) {
          return $filter('translate')('index.appTitle');
        } else {
          return $filter('translate')('index.genericTitle');
        }
      }
    };
  }
})();
