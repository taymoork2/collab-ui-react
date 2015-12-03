'use strict';

angular.module('Mediafusion')
  .service('EmailNotificationConfigService', ['$http', 'Notification', 'MediaConfigService',
    function EmailNotificationConfigService($http, notification, config) {

      var url = config.getUrl() + '/notification_config';

      var read = function (callback) {
        $http
          .get(url)
          .success(function (data) {
            callback(null, data);
          })
          .error(function () {
            callback(arguments, null);
          });
      };

      var write = function (data, callback) {
        $http
          .put(url, data)
          .success(function (data) {
            callback(null, data);
          })
          .error(function () {
            callback(arguments, null);
          });
      };

      return {
        read: read,
        write: write
      };
    }
  ]);
