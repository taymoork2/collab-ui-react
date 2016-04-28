(function () {
  'use strict';

  angular
    .module('DigitalRiver')
    .factory('OnlineTrialConfig', OnlineTrialConfig);

  function OnlineTrialConfig(Config) {

    var onlineTrialConfig = {
      amount: '0.0',
      //TODO use Cisco Partner org ID for prod and a test org ID for dev and integration.
      partnerInternalUUID: {
        dev: '03fbeb02-8df5-4218-a92a-48f014ebc547',
        cfe: '03fbeb02-8df5-4218-a92a-48f014ebc547',
        integration: '03fbeb02-8df5-4218-a92a-48f014ebc547',
        prod: '03fbeb02-8df5-4218-a92a-48f014ebc547'
      },

      getPartnerInternalUUID: function () {

        var env = Config.getEnv();
        if (env === 'dev') {
          return this.partnerInternalUUID.dev;
        } else if (env === 'integration') {
          return this.partnerInternalUUID.integration;
        } else {
          return this.partnerInternalUUID.prod;
        }
      }
    };
    return onlineTrialConfig;
  }
}());
