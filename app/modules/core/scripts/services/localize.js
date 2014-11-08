'use strict';

angular.module('Core')
  .factory('Localize', ['$location', '$filter', 'Utils', 'SessionStorage', 'Authinfo',
    function ($location, $filter, Utils, SessionStorage, Authinfo) {
      return {
        varTitle: function () {
          var currentOrgName = SessionStorage.get('customerOrgName');
          if (currentOrgName) {
            return currentOrgName;
          } else if (Utils.isAdminPage()) {
            return $filter('translate')('index.appTitle');
          } else {
            return $filter('translate')('index.genericTitle');
          }
        }
      };
    }
  ]);
