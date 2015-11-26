(function () {
  'use strict';

  angular
    .module('Core')
    .factory('OverviewHybridServicesCard', OverviewHybridServicesCard);

  /* @ngInject */
  function OverviewHybridServicesCard() {
    var card = this;
    this.icon = 'icon-circle-data';
    this.enabled = true;
    this.notEnabledText = 'overview.cards.hybrid.notEnabledText';
    this.notEnabledAction = '#overview';
    this.notEnabledActionText = 'overview.cards.hybrid.notEnabledActionText';
    this.hybridStatusEventHandler = function (services) {
      card.services = services;
      card.populateServicesWithHealth();
    };

    this.adminOrgServiceStatusEventHandler = function (status) {
      card.servicesStatus = status;
      card.populateServicesWithHealth();
    };

    this.populateServicesWithHealth = function () {
      if (card.services && card.servicesStatus) {
        _.each(card.services, function (service) {
          service.healthStatus = (serviceToTypeMap[service.id] && card.servicesStatus && card.servicesStatus[serviceToTypeMap[service.id]]) ? 'success' : 'warning';
        });
      }
    };

    var serviceToTypeMap = {};

    serviceToTypeMap['squared-fusion-mgmt'] = "c_mgmt";
    serviceToTypeMap['squared-fusion-uc'] = "c_ucmc";
    serviceToTypeMap['squared-fusion-cal'] = "c_cal";
    serviceToTypeMap['squared-fusion-media'] = "mf_mgmt";
    //:  "cs_mgmt",  not mapped
    serviceToTypeMap['center-context'] = "cs_context";
    //"d_openj"  not mapped

    return card;
  }
})();
