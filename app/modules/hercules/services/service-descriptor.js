'use strict';

angular.module('Hercules')
  .service('ServiceDescriptor', ['$http', 'ConfigService', 'Authinfo',
    function ServiceDescriptor($http, config, Authinfo) {
      var services = function (callback) {
        $http
          .get(config.getUrl() + '/organizations/' + Authinfo.getOrgId() + '/services')
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
          return service.connector_type != 'c_mgmt' && service.connector_type != 'mf_mgmt' && service.service_id != 'squared-fusion-ec';
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
          .put(config.getUrl() + '/organizations/' + Authinfo.getOrgId() + '/services/' + serviceId, {
            enabled: enabled
          })
          .success(function () {
            callback(null);
          })
          .error(function () {
            callback(arguments);
          });
      };

      var serviceIcon = function (serviceId) {
        if (!serviceId) {
          return 'icon icon-circle-question';
        }
        switch (serviceId) {
        case 'squared-fusion-cal':
          return 'icon icon-circle-calendar';
        case 'squared-fusion-uc':
          return 'icon icon-circle-call';
        case 'squared-fusion-media':
          return 'icon icon-circle-telepresence';
        case 'contact-center-context':
          return 'icon icon-circle-world';
        default:
          return 'icon icon-circle-question';
        }
      };

      return {
        services: services,
        filterEnabledServices: filterEnabledServices,
        filterAllExceptManagement: filterAllExceptManagement,
        isFusionEnabled: isFusionEnabled,
        setServiceEnabled: setServiceEnabled,
        serviceIcon: serviceIcon
      };

    }
  ]);
