'use strict';

angular.module('Huron')
  .factory('HuronConfig', ['$window',
    function($window) {
      var config = {

        cmiUrl: 'http://rcdn6-vm68-68:8080/cmi',
        // cmiUrl: 'http://cmi.huron-alpha.com',

        getCmiUrl: function() {
          return this.cmiUrl;
        }
      };
      return config;
    }
  ]);
