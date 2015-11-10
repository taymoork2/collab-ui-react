'use strict';

angular.module('Hercules')
  .service('NotificationConfigService', ['$http', 'Notification', 'ConfigService',
    function NotificationConfigService($http, notification, config) {

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
