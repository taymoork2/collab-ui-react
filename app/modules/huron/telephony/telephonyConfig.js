(function () {
  'use strict';

  angular
    .module('Huron')
    .factory('HuronConfig', ['Config',
      function (Config) {
        var config = {
          cmiUrl: {
            dev: 'https://cmi.hitest.huron-dev.com',
            integration: 'https://cmi.hitest.huron-dev.com',
            prod: 'https://cmi.huron-dev.com'
          },
          emailUrl: {
            dev: 'https://hermes.hitest.huron-dev.com',
            integration: 'https://hermes.hitest.huron-dev.com',
            prod: 'https://hermes.huron-dev.com'
          },

          storefrontUrl: {
            dev: 'https://storefront.hitest.huron-dev.com',
            integration: 'https://storefront.hitest.huron-dev.com',
            prod: 'https://storefront.huron-dev.com'
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

          getStorefrontUrl: function () {
            if (Config.isDev()) {
              return this.storefrontUrl.dev;
            } else if (Config.isIntegration()) {
              return this.storefrontUrl.integration;
            } else {
              return this.storefrontUrl.prod;
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
          }
        };
        return config;
      }
    ]);
})();
