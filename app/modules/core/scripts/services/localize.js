(function () {
  'use strict';

  module.exports = angular.module('core.localize', [
    require('modules/core/scripts/services/utils'),
    require('modules/core/storage').default,
  ])
    .factory('Localize', Localize)
    .name;

  /* @ngInject */
  function Localize($filter, Utils, Authinfo) {
    return {
      varTitle: function () {
        var orgName = Authinfo.getOrgName();
        if (orgName) {
          return orgName;
        } else if (Utils.isAdminPage()) {
          return $filter('translate')('index.appTitle');
        } else {
          return $filter('translate')('index.genericTitle');
        }
      },
    };
  }
})();
