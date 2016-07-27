(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .factory('AAConfigEnvMetricService', AAConfigEnvMetricService);

  /* @ngInject */
  function AAConfigEnvMetricService(Config, Analytics) {

    var service = {
      trackProdNotifications: trackProdNotifications
    };

    return service;

    /////////////////////

    //track production messages sent from the ui to the analytics service
    function trackProdNotifications(metric, properties) {
      if (Config.isProd()) {
        Analytics.trackEvent(metric + ".prod", properties);
      }
    }
  }
})();
