'use strict';

angular.module('Huron')
  .factory('HuronConfig', ['Config',
    function(Config) {
      var config = {
        cmiUrl: {
          dev: 'https://cmi.hitest.huron-dev.com',
          integration: 'https://cmi.hitest.huron-dev.com',
          prod: 'https://cmi.hitest.huron-dev.com'
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
