'use strict';

angular.module('wx2AdminWebClientApp')
  .factory('Localize', ['$location', '$filter',
    function($location, $filter) {
      return {

        varTitle: function() {
          if ($location.url().indexOf('downloads') === -1) {
            return $filter('translate')('index.appTitle');
          } else {
            return $filter('translate')('index.genericTitle');
          }
        }
      };
    }
  ]);
