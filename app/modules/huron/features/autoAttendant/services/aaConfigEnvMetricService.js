(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .factory('AAConfigEnvMetricService', AAConfigEnvMetricService);

  /* @ngInject */
  function AAConfigEnvMetricService(Config, AAMetricNameService, Analytics) {

    var service = {
      trackProdOrIntegNotifications: trackProdOrIntegNotifications,
      trackConfigEnvNotifications: trackConfigEnvNotifications
    };

    return service;

    /////////////////////

    //track production vs integration messages sent from the ui
    //to the analytics service
    function trackProdOrIntegNotifications(type, properties) {
      type = typeSetter(type);
      if (Config.isProd()) {
        Analytics.trackEvent(AAMetricNameService.UI_NOTIFICATION + ".prod." + type, properties);
      } else if (Config.isIntegration()) {
        Analytics.trackEvent(AAMetricNameService.UI_NOTIFICATION + ".integration." + type, properties);
      }
    }

    //3 types of "type" for notifications that can be tracked from the ui, follows
    //what is outlined in app/modules/core/notifications/notification.service.js
    function typeSetter(type) {
      var types = ['success', 'warning', 'error'];
      return _.includes(types, type) ? type : 'error';
    }

    //track config environment messages sent from the ui
    //to the analytics service
    function trackConfigEnvNotifications(type, properties) {
      type = typeSetter(type);
      Analytics.trackEvent(AAMetricNameService.UI_NOTIFICATION + '.' + Config.getEnv() + '.' + type, properties);
    }
  }
})();
