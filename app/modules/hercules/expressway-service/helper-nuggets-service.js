(function () {
  'use strict';

  angular
    .module('Hercules')
    .service('HelperNuggetsService', HelperNuggetsService);

  /*@ngInject*/
  function HelperNuggetsService() {

    var serviceType2RouteName = function (serviceType) {
      switch (serviceType) {
      case 'c_cal':
        return "calendar-service";
      case 'c_ucmc':
        return "call-service";
      case 'c_mgmt':
        return "management-service";
      default:
        return "";
      }
    };

    var serviceType2ServiceId = function (serviceType) {
      switch (serviceType) {
      case 'c_cal':
        return "squared-fusion-cal";
      case 'c_ucmc':
        return "squared-fusion-uc";
      case 'c_mgmt':
        return "squared-fusion-mgmt";
      default:
        return "";
      }
    };

    var serviceId2ServiceType = function (serviceId) {
      switch (serviceId) {
      case 'squared-fusion-cal':
        return "c_cal";
      case 'squared-fusion-uc':
        return "c_ucmc";
      case 'squared-fusion-mgmt':
        return "c_mgmt";
      default:
        return "";
      }
    };

    return {
      serviceType2RouteName: serviceType2RouteName,
      serviceType2ServiceId: serviceType2ServiceId,
      serviceId2ServiceType: serviceId2ServiceType
    };
  }

}());
