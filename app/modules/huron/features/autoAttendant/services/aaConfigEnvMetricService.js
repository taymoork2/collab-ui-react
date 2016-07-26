(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .factory('AAConfigEnvMetricService', AAConfigEnvMetricService);

  /* @ngInject */
  function AAConfigEnvMetricService(Config, Analytics) {

    var service = {
      trackProdOrIntegNotifications: trackProdOrIntegNotifications
    };

    return service;

    /////////////////////

    //track production vs integration messages sent from the ui
    //to the analytics service
    function trackProdOrIntegNotifications(metric, properties) {
      if (Config.isProd()) {
        Analytics.trackEvent(metric + ".prod", properties);
      } else if (Config.isIntegration()) {
        Analytics.trackEvent(metric + ".integration", properties);
      }
    }
  }
})();
