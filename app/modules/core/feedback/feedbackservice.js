'use strict';

angular.module('Core')
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
            $http.defaults.headers.common.Authorization = 'Bearer ' + $rootScope.token;
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
                Auth.handleStatus(status);
              });
          } else {
            callback('get feedback url not valid - empty request.');
          }
          //console.log(feedbackData);
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
              Auth.handleStatus(status);
            });
        }
      };
    }
  ]);
