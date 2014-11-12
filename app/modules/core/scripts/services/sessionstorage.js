'use strict';

angular.module('Core')
  .service('SessionStorage', function SessionStorage() {
    // AngularJS will instantiate a singleton by calling "new" on this function
    return {
      put: function (key, value) {
        if (value !== null) {
          sessionStorage.setItem(key, value);
        }
      },

      putObject: function (key, object) {
        if (object !== null) {
          sessionStorage.setItem(key, JSON.stringify(object));
        }
      },

      get: function (key) {
        return sessionStorage.getItem(key);
      },

      getObject: function (key) {
        return JSON.parse(sessionStorage.getItem(key));
      },

      pop: function (key) {
        var value = this.get(key);
        this.remove(key);
        return value;
      },

      popObject: function (key) {
        var object = this.getObject(key);
        this.remove(key);
        return object;
      },

      remove: function (key) {
        sessionStorage.removeItem(key);
      },

      clear: function () {
        sessionStorage.clear();
      }

    };

  });
