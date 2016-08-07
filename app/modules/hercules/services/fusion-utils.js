(function () {
  'use strict';

  angular
    .module('Hercules')
    .service('FusionUtils', FusionUtils);

  /*@ngInject*/
  function FusionUtils() {
    var service = {
      connectorType2RouteName: connectorType2RouteName,
      connectorType2ServicesId: connectorType2ServicesId,
      serviceId2ConnectorType: serviceId2ConnectorType,
      serviceId2Icon: serviceId2Icon
    };

    return service;

    //////////

    function connectorType2RouteName(connectorType) {
      switch (connectorType) {
        case 'c_cal':
          return 'calendar-service';
        case 'c_ucmc':
          return 'call-service';
        case 'c_mgmt':
          return 'management-service';
        default:
          return '';
      }
    }

    function connectorType2ServicesId(connectorType) {
      switch (connectorType) {
        case 'c_cal':
          return ['squared-fusion-cal'];
        case 'c_ucmc':
          return ['squared-fusion-uc', 'squared-fusion-ec'];
        case 'c_mgmt':
          return ['squared-fusion-mgmt'];
        case 'mf_mgmt':
          return ['squared-fusion-media'];
        default:
          return [];
      }
    }

    function serviceId2ConnectorType(serviceId) {
      switch (serviceId) {
        case 'squared-fusion-cal':
          return 'c_cal';
        case 'squared-fusion-uc':
        case 'squared-fusion-ec':
          return 'c_ucmc';
        case 'squared-fusion-mgmt':
          return 'c_mgmt';
        case 'squared-fusion-media':
          return 'mf_mgmt';
        default:
          return '';
      }
    }

    function serviceId2Icon(serviceId) {
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
    }

  }
}());
