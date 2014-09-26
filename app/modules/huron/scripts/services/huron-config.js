'use strict';

angular.module('Huron')
  .factory('HuronConfig', ['Config',
    function(Config) {
      var config = {
        cmiUrl: {
          dev: 'http://rcdn6-vm68-68:8080/cmi',
          integration: 'http://cmi.cfa-hitest.huron-alpha.com',
          prod: 'http://cmi.huron-alpha.com'
        },

        getCmiUrl: function() {
          if (Config.isDev()) {
            return this.cmiUrl.dev;
          } else if (Config.isIntegration()) {
            return this.cmiUrl.integration;
          } else {
            return this.cmiUrl.prod;
          }
        }
      };
      return config;
    }
  ]);
