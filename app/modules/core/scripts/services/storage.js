'use strict';

angular.module('Core')
  .service('Storage', function Storage() {
    // AngularJS will instantiate a singleton by calling "new" on this function
    return {
      put: function (key, value) {
        if (value !== null) {
          localStorage.setItem(key, value);
        }
      },

      putObject: function (key, object) {
        if (object !== null) {
          localStorage.setItem(key, JSON.stringify(object));
        }
      },

      get: function (key) {
        return localStorage.getItem(key);
      },

      getObject: function (key) {
        return JSON.parse(localStorage.getItem(key));
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
        localStorage.removeItem(key);
      },

      clear: function () {
        localStorage.clear();
      }

    };

  });
