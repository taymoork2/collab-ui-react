'use strict';

angular.module('wx2AdminWebClientApp')
  .service('Storage', function Storage() {
    // AngularJS will instantiate a singleton by calling "new" on this function
    return {
      put: function(key, value) {
        if (value !== null) {
          localStorage[key] = value;
        }
      },

      get: function(key) {
        return localStorage.getItem(key);
      }
    };

  });
