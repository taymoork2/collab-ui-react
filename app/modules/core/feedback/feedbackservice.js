(function () {
  'use strict';

  /* @ngInject */
  function FeedbackService($http, $q, Config, $translate) {
    return {
      getFeedbackUrl: function (appType, feedbackId) {
        var feedbackData = {
          'appType': appType,
          'appVersion': Config.getEnv(),
          'feedbackId': feedbackId,
          'languageCode': $translate.use(),
        };

        if (!appType || !feedbackId) {
          return $q.reject('AppType and/or FeedbackId not set');
        }

        return $http({
          method: 'POST',
          url: Config.feedbackUrl,
          data: feedbackData,
        });
      },
    };
  }

  angular
    .module('Core')
    .service('FeedbackService', FeedbackService);

}());
