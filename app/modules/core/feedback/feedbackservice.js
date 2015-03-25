'use strict';

angular
  .module('Core')
  .service('FeedbackService', ['$http', '$rootScope', '$location', 'Config', 'Log', '$translate', 'Auth',
    function ($http, $rootScope, $location, Config, Log, $translate, Auth) {
      var feedbackUrl = Config.feedbackUrl;

      return {
        getFeedbackUrl: function (appType, feedbackId, callback) {
          var feedbackData = {
            'appType': appType,
            'appVersion': Config.getEnv(),
            'feedbackId': feedbackId,
            'languageCode': $translate.use()
          };
          if (appType && feedbackId) {
            $http({
                method: 'POST',
                url: feedbackUrl,
                data: feedbackData
              })
              .success(function (data, status) {
                data.success = true;
                callback(data, status);
              })
              .error(function (data, status) {
                callback(data, status);
              });
          } else {
            callback('get feedback url not valid - empty request.');
          }
        },

        getUrlTemplate: function (url, callback) {
          $http({
              method: 'GET',
              url: url
            })
            .success(function (data, status) {
              data.success = true;
              callback(data, status);
            })
            .error(function (data, status) {
              callback(data, status);
            });
        }
      };
    }
  ]);
