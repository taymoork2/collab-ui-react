(function () {
  'use strict';

  angular
    .module('Core')
    .factory('OverviewHybridServicesCard', OverviewHybridServicesCard);

  /* @ngInject */
  function OverviewHybridServicesCard() {
    return {
      createCard: function createCard() {
        var card = {};
        card.icon = 'icon-circle-data';
        card.enabled = true;
        card.notEnabledText = 'overview.cards.hybrid.notEnabledText';
        card.notEnabledAction = '#overview';
        card.notEnabledActionText = 'overview.cards.hybrid.notEnabledActionText';
        card.hybridStatusEventHandler = function (services) {
          card.services = services;
          card.populateServicesWithHealth();
        };

        card.adminOrgServiceStatusEventHandler = function (status) {
          card.servicesStatus = status;
          card.populateServicesWithHealth();
        };

        card.populateServicesWithHealth = function () {
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
    };
  }
})();
