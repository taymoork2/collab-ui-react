'use strict';

angular.module('Hercules')
  .service('ServiceDescriptor', ['$http', 'ConfigService', 'XhrNotificationService',
    function ServiceDescriptor($http, config, notification) {
      var services = function (callback) {
        $http
          .get(config.getUrl() + '/fusion_entitlements_status')
          .success(function (data) {
            callback(null, data);
          })
          .error(function () {
            callback(arguments);
          });
      };

      return {
        services: services
      };

    }
  ]);
