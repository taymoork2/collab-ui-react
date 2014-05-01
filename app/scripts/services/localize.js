'use strict';

angular.module('wx2AdminWebClientApp')
  .factory('Localize', ['$location', '$filter', 'Utils',
    function($location, $filter, Utils) {
      return {

        varTitle: function() {
          if (Utils.isAdminPage()) {
            return $filter('translate')('index.appTitle');
          } else {
            return $filter('translate')('index.genericTitle');
          }
        }
      };
    }
  ]);
