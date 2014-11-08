'use strict';

angular.module('Core')
  .service('SessionStorage', function SessionStorage() {
    // AngularJS will instantiate a singleton by calling "new" on this function
    return {
      put: function (key, value) {
        if (value !== null) {
          sessionStorage[key] = value;
        }
      },

      get: function (key) {
        return sessionStorage.getItem(key);
      },

      remove: function (key) {
        sessionStorage.removeItem(key);
      },

      clear: function () {
        sessionStorage.clear();
      }

    };

  });
