'use strict';

angular.module('Hercules')
  .service('ServiceDescriptor', ['$http', 'ConfigService', 'XhrNotificationService',
    function ServiceDescriptor($http, config, notification) {
      var services = function (callback) {
        $http
          .get(config.getUrl() + '/fusion_entitlements_status')
          .success(function (data) {
            var services = _.filter(data.fusion_services || [], function (service) {
              return service.connector_type != 'c_mgmt';
            });
            callback(null, services);
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
