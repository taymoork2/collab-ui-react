(function () {
  'use strict';

  angular
    .module('Huron')
    .factory('HuronConfig', ['Config',
      function (Config) {
        var config = {
          cmiUrl: {
            dev: 'https://cmi.hitest.huron-dev.com/api/v1',
            integration: 'https://cmi.hitest.huron-dev.com/api/v1',
            prod: 'https://cmi.huron-dev.com/api/v1'
          },

          cesUrl: {
            dev: 'https://ces.hitest.huron-dev.com/api/v1',
            integration: 'https://ces.hitest.huron-dev.com/api/v1',
            prod: 'https://ces.huron-dev.com/api/v1'
          },

          emailUrl: {
            dev: 'https://hermes.hitest.huron-dev.com/api/v1',
            integration: 'https://hermes.hitest.huron-dev.com/api/v1',
            prod: 'https://hermes.huron-dev.com/api/v1'
          },

          // TODO: Point to Ocelot micro service when it's ready.
          ocelotUrl: {
            dev: 'https://hermes.hitest.huron-dev.com/api/v1',
            integration: 'https://hermes.hitest.huron-dev.com/api/v1',
            prod: 'https://hermes.huron-dev.com/api/v1'
          },

          getCmiUrl: function () {
            if (Config.isDev()) {
              return this.cmiUrl.dev;
            } else if (Config.isIntegration()) {
              return this.cmiUrl.integration;
            } else {
              return this.cmiUrl.prod;
            }
          },

          getCesUrl: function () {
            if (Config.isDev()) {
              return this.cesUrl.dev;
            } else if (Config.isIntegration()) {
              return this.cesUrl.integration;
            } else {
              return this.cesUrl.prod;
            }
          },

          getEmailUrl: function () {
            if (Config.isDev()) {
              return this.emailUrl.dev;
            } else if (Config.isIntegration()) {
              return this.emailUrl.integration;
            } else {
              return this.emailUrl.prod;
            }
          },

          getOcelotUrl: function () {
            if (Config.isDev()) {
              return this.ocelotUrl.dev;
            } else if (Config.isIntegration()) {
              return this.ocelotUrl.integration;
            } else {
              return this.ocelotUrl.prod;
            }
          }

        };
        return config;
      }
    ]);
})();
