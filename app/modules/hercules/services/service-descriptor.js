'use strict';

angular.module('Hercules')
  .service('ServiceDescriptor', ['$http', 'ConfigService',
    function ServiceDescriptor($http, config) {
      var services = function (callback) {
        $http
          .get(config.getUrl() + '/fusion_entitlements_status')
          .success(function (data) {
            callback(null, data.fusion_services || []);
          })
          .error(function () {
            callback(arguments);
          });
      };

      var filterEnabledServices = function (services) {
        return _.filter(services, function (service) {
          return service.connector_type != 'c_mgmt' && service.enabled;
        });
      };

      var filterAllExceptManagement = function (services) {
        return _.filter(services, function (service) {
          return service.connector_type != 'c_mgmt' && service.connector_type != 'mf_mgmt';
        });
      };

      var isFusionEnabled = function (callback) {
        services(function (error, services) {
          if (error) {
            callback(false);
          } else {
            callback(services.length > 0);
          }
        });
      };

      var setServiceEnabled = function (serviceId, enabled, callback) {
        $http
          .put(config.getUrl() + '/services/' + serviceId, {
            enabled: enabled
          })
          .success(function () {
            callback(null);
          })
          .error(function () {
            callback(arguments);
          });
      };

      return {
        services: services,
        filterEnabledServices: filterEnabledServices,
        filterAllExceptManagement: filterAllExceptManagement,
        isFusionEnabled: isFusionEnabled,
        setServiceEnabled: setServiceEnabled
      };

    }
  ]);
