(function () {
  'use strict';

  angular
    .module('Core')
    .factory('OverviewHybridServicesCard', OverviewHybridServicesCard);

  /* @ngInject */
  function OverviewHybridServicesCard(OverviewHelper) {
    return {
      createCard: function createCard() {
        var card = {};
        card.name = 'overview.cards.hybrid.title';
        card.cardClass = 'header-bar cta-base hybrid-card';
        card.template = 'modules/core/overview/hybridServicesCard.tpl.html';
        card.icon = 'icon-circle-data';
        card.enabled = true;
        card.notEnabledText = 'overview.cards.hybrid.notEnabledText';
        card.notEnabledAction = '#overview';
        card.notEnabledActionText = 'overview.cards.hybrid.notEnabledActionText';
        card.helper = OverviewHelper;

        card.hybridStatusEventHandler = function (err, services) {
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

        card.healthStatusUpdatedHandler = function messageHealthEventHandler(data) {
          _.each(data.components, function (component) {
            if (component.name == 'Calendar Service' || component.name == 'Cloud Hybrid Services Management') {
              card.healthStatus = card.helper.mapStatus(card.healthStatus, component.status);
            }
          });
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
