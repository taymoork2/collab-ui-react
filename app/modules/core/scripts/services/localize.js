(function () {
  'use strict';

  angular.module('Core')
    .factory('Localize', Localize);

  /* @ngInject */
  function Localize($location, $filter, Utils, SessionStorage) {
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
